import {
  ArrowSquareOutIcon,
  CheckCircleIcon,
  CopyIcon,
  ImageIcon,
  LockKeyIcon,
  LockKeyOpenIcon,
  StarIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FREEMIUM_LINKS,
  FREEMIUM_PAKET_PRICE_LABEL,
  FREEMIUM_PEMBAHASAN_PRICE_LABEL,
  FREEMIUM_WHATSAPP_LINKS,
  buildBroadcastText,
} from "@/lib/freemium-links";
import { useMidtransScript } from "@/lib/midtrans";
import { cn } from "@/lib/utils";
import { client, orpc } from "@/utils/orpc";

const PAYMENT_ACTIVATION_MAX_RETRIES = 6;
const PAYMENT_ACTIVATION_RETRY_DELAY_MS = 1000;
const PROOF_MAX_SIDE = 1280;
const PROOF_QUALITY = 0.8;

const PROOF_SLOTS = [
  { key: "instagram", label: "Bukti follow Instagram" },
  { key: "tiktok", label: "Bukti follow TikTok" },
  { key: "broadcast", label: "Bukti share BC ke 5 grup WA" },
] as const;

export type FreemiumStatus = Awaited<ReturnType<typeof client.tryout.freemium.status>>;

/** Error modul tryout membawa pesan Indonesia di data.message; error lain di message. */
export function getApiErrorMessage(error: Error) {
  const data = (error as Error & { data?: { message?: unknown } }).data;
  return typeof data?.message === "string" ? data.message : error.message;
}

export function useFreemiumStatus(tryoutId?: string) {
  return useQuery(orpc.tryout.freemium.status.queryOptions({ input: tryoutId ? { tryoutId } : {} }));
}

function useRefreshFreemium() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.tryout.freemium.status.key() }),
      queryClient.invalidateQueries({ queryKey: orpc.tryout.results.key() }),
    ]);
  };
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForPaymentActivation(orderId: string) {
  for (let attempt = 0; attempt < PAYMENT_ACTIVATION_MAX_RETRIES; attempt += 1) {
    try {
      const result = await client.transaction.status({ orderId });
      if (result.status === "success") return true;
      if (result.status === "failed") return false;
    } catch (error) {
      console.error("Failed to sync freemium payment status", error);
    }
    await sleep(PAYMENT_ACTIVATION_RETRY_DELAY_MS);
  }
  return false;
}

const PAYMENT_COPY = {
  paket: {
    success: "Pembayaran berhasil! Kamu dapat 3 jatah TO, pembahasannya sudah termasuk.",
    pending: "Pembayaran sedang diproses. Jatah TO akan aktif otomatis setelah terkonfirmasi.",
  },
  pembahasan: {
    success: "Pembayaran berhasil! Pembahasan TO ini sudah terbuka.",
    pending: "Pembayaran sedang diproses. Pembahasan akan terbuka otomatis setelah terkonfirmasi.",
  },
} as const;

/** Bayar lewat Midtrans Snap; akses aktif otomatis setelah pembayaran terverifikasi di server. */
export function useFreemiumPayment({ kind, onPaid }: { kind: "paket" | "pembahasan"; onPaid?: () => void }) {
  useMidtransScript();
  const refresh = useRefreshFreemium();
  const mutation = useMutation({
    mutationFn: (tryoutId?: string) =>
      kind === "paket"
        ? client.transaction.subscribeFreemium()
        : client.transaction.subscribeFreemiumPembahasan({ tryoutId: tryoutId ?? "" }),
  });

  const completePayment = async (orderId: string) => {
    const activated = await waitForPaymentActivation(orderId);
    await refresh();
    if (activated) {
      toast.success(PAYMENT_COPY[kind].success);
      onPaid?.();
      return;
    }
    toast.info(PAYMENT_COPY[kind].pending);
  };

  const pay = (tryoutId?: string) => {
    if (mutation.isPending) return;

    mutation.mutate(tryoutId, {
      onSuccess: (data) => {
        if (window.snap) {
          window.snap.pay(data.token, {
            onSuccess: () => void completePayment(data.orderId),
            onPending: () => toast.info(PAYMENT_COPY[kind].pending),
            onError: () => toast.error("Pembayaran gagal. Silakan coba lagi."),
            onClose: () => toast.warning("Pembayaran dibatalkan."),
          });
          return;
        }
        window.location.href = data.redirectUrl;
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  return { pay, isPending: mutation.isPending };
}

function useSelectTryout() {
  const refresh = useRefreshFreemium();
  const select = useMutation(
    orpc.tryout.freemium.select.mutationOptions({
      onSuccess: async (data) => {
        await refresh();
        toast.success(
          data.source === "paket" ? "TO dipilih. Pembahasannya sudah termasuk paket." : "TO gratis kamu sudah dipilih.",
        );
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
  );
  const unselect = useMutation(
    orpc.tryout.freemium.unselect.mutationOptions({
      onSuccess: async () => {
        await refresh();
        toast.success("Pilihan dilepas. Jatahnya bisa dipakai untuk TO lain.");
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
  );
  return { select, unselect };
}

async function compressImageToDataUrl(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, PROOF_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Browser tidak mendukung pemrosesan gambar");
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", PROOF_QUALITY);
}

function WhatsappButton({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild className="h-auto w-full bg-whatsapp py-2.5 whitespace-normal text-white hover:bg-whatsapp/90">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <WhatsappLogoIcon weight="fill" />
        {label}
        <ArrowSquareOutIcon />
      </a>
    </Button>
  );
}

/** Channel WA untuk semua yang punya akses; grup WA hanya untuk pembeli Paket 3 TryOut. */
export function FreemiumWhatsappInvites({
  showPaketGroup = false,
  compact = false,
}: {
  showPaketGroup?: boolean;
  compact?: boolean;
}) {
  const { channel, paketGroup } = FREEMIUM_WHATSAPP_LINKS;
  if (!channel && !(showPaketGroup && paketGroup)) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {showPaketGroup && paketGroup && (
          <Button asChild size="sm" className="bg-whatsapp text-white hover:bg-whatsapp/90">
            <a href={paketGroup} target="_blank" rel="noopener noreferrer">
              <WhatsappLogoIcon weight="fill" /> Grup WA Paket 3 TO
            </a>
          </Button>
        )}
        {channel && (
          <Button asChild size="sm" variant="outline" className="border-whatsapp text-whatsapp hover:bg-whatsapp/10">
            <a href={channel} target="_blank" rel="noopener noreferrer">
              <WhatsappLogoIcon weight="fill" /> Channel WA
            </a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {showPaketGroup && paketGroup && <WhatsappButton href={paketGroup} label="Gabung Grup WA Paket 3 TryOut" />}
      {channel && <WhatsappButton href={channel} label="Ikuti Channel WA Habitutor" />}
    </div>
  );
}

function BroadcastTextBox() {
  // Dihitung saat render supaya H-N dan tanggal pendaftaran selalu sesuai hari ini.
  const broadcastText = buildBroadcastText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(broadcastText);
      toast.success("Teks BC disalin");
    } catch {
      toast.error("Gagal menyalin teks, salin manual ya");
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-gray-50 p-3 text-sm">
      <p className="max-h-48 overflow-y-auto whitespace-pre-wrap text-gray-700">{broadcastText}</p>
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={handleCopy}>
        <CopyIcon /> Salin teks BC
      </Button>
    </div>
  );
}

function ProofSlot({
  label,
  preview,
  onPick,
}: {
  label: string;
  preview: string | null;
  onPick: (file: File) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-primary-300 hover:bg-gray-50",
        preview && "border-emerald-400 bg-emerald-50/40",
      )}
    >
      {preview ? (
        <img src={preview} alt={label} className="size-14 shrink-0 rounded-md border object-cover" />
      ) : (
        <span className="flex size-14 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-400">
          <ImageIcon size={24} />
        </span>
      )}
      <span className="flex flex-col">
        <span className="font-semibold text-gray-800">{label}</span>
        <span className="text-xs text-muted-foreground">
          {preview ? "Ketuk untuk ganti foto" : "Ketuk untuk pilih foto"}
        </span>
      </span>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
          event.target.value = "";
        }}
      />
    </label>
  );
}

export function FreemiumRequirementsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const refresh = useRefreshFreemium();
  const [previews, setPreviews] = useState<(string | null)[]>(PROOF_SLOTS.map(() => null));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const submitMutation = useMutation(orpc.tryout.freemium.completeRequirements.mutationOptions());

  const allPicked = previews.every((preview) => preview !== null);

  const handlePick = async (index: number, file: File) => {
    setIsProcessing(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setPreviews((current) => current.map((item, itemIndex) => (itemIndex === index ? dataUrl : item)));
    } catch {
      toast.error("Gagal membaca gambar. Coba foto lain.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    const proofs = previews.filter((preview): preview is string => preview !== null);
    submitMutation.mutate(
      { proofs },
      {
        onSuccess: async () => {
          await refresh();
          setIsDone(true);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        {isDone ? (
          <>
            <DialogHeader>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:mx-0">
                <CheckCircleIcon size={28} weight="fill" />
              </div>
              <DialogTitle>Syarat terpenuhi, kamu dapat 1 TO gratis!</DialogTitle>
              <DialogDescription>
                Pilih 1 TO lewat tombol "Pilih TO ini" di daftar TO. Pilihan masih bisa diganti selama TO-nya belum
                mulai dikerjakan. Pembahasannya bisa dibuka {FREEMIUM_PEMBAHASAN_PRICE_LABEL} setelah selesai.
              </DialogDescription>
            </DialogHeader>
            <FreemiumWhatsappInvites />
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Pilih TO</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Akses Gratis: Penuhi 3 Syarat</DialogTitle>
              <DialogDescription>
                Lakukan ketiga hal di bawah, lalu upload foto buktinya. Setelah terkirim, kamu langsung bisa memilih 1
                TO.
              </DialogDescription>
            </DialogHeader>

            <ol className="flex flex-col gap-3 text-sm">
              <li className="flex flex-col gap-2">
                <span className="font-semibold">1. Follow Instagram Habitutor</span>
                <Button asChild variant="outline" size="sm" className="w-fit">
                  <a href={FREEMIUM_LINKS.instagram} target="_blank" rel="noopener noreferrer">
                    Buka Instagram <ArrowSquareOutIcon />
                  </a>
                </Button>
              </li>
              <li className="flex flex-col gap-2">
                <span className="font-semibold">2. Follow TikTok Habitutor</span>
                <Button asChild variant="outline" size="sm" className="w-fit">
                  <a href={FREEMIUM_LINKS.tiktok} target="_blank" rel="noopener noreferrer">
                    Buka TikTok <ArrowSquareOutIcon />
                  </a>
                </Button>
              </li>
              <li className="flex flex-col gap-2">
                <span className="font-semibold">3. Share BC ke 5 grup WhatsApp</span>
                <BroadcastTextBox />
              </li>
            </ol>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Upload foto bukti</p>
              {PROOF_SLOTS.map((slot, index) => (
                <ProofSlot
                  key={slot.key}
                  label={slot.label}
                  preview={previews[index] ?? null}
                  onPick={(file) => void handlePick(index, file)}
                />
              ))}
            </div>

            <DialogFooter>
              <Button disabled={!allPicked || isProcessing || submitMutation.isPending} onClick={handleSubmit}>
                {submitMutation.isPending ? "Mengirim..." : "Kirim Bukti"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FreemiumPaidDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:mx-0">
            <CheckCircleIcon size={28} weight="fill" />
          </div>
          <DialogTitle>Paket 3 TryOut aktif!</DialogTitle>
          <DialogDescription>
            Pilih 3 TO lewat tombol "Pilih TO ini" di daftar TO. Pembahasan ketiga TO itu sudah termasuk dan terbuka
            setelah kamu selesai mengerjakannya.
          </DialogDescription>
        </DialogHeader>
        <FreemiumWhatsappInvites showPaketGroup />
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Pilih TO</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OptionBenefits({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-1.5 text-sm">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <CheckCircleIcon size={18} weight="fill" className="mt-px shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function SlotChip({ label, used, total }: { label: string; used: number; total: number }) {
  return (
    <span className="rounded-full border bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
      {label}: {used}/{total} TO dipakai
    </span>
  );
}

/**
 * Panel akses di atas daftar TO. Belum punya akses: dua pilihan (gratis / Rp10.000).
 * Sudah punya akses: satu baris status jatah, tanpa mengulang syarat yang sudah terpenuhi.
 */
export function FreemiumAccessPanel({ status }: { status: FreemiumStatus }) {
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [paidOpen, setPaidOpen] = useState(false);
  const payment = useFreemiumPayment({ kind: "paket", onPaid: () => setPaidOpen(true) });

  const hasAnyAccess = status.requirementsCompleted || status.hasPackage;
  const remaining = status.freeSlots.remaining + status.packageSlots.remaining;
  const canBuyPaket = status.packageSlots.remaining === 0;
  const payLabel = payment.isPending ? "Memproses..." : `Bayar ${FREEMIUM_PAKET_PRICE_LABEL}`;

  const dialogs = (
    <>
      <FreemiumRequirementsDialog open={requirementsOpen} onOpenChange={setRequirementsOpen} />
      <FreemiumPaidDialog open={paidOpen} onOpenChange={setPaidOpen} />
    </>
  );

  if (status.fullAccess || !status.gateEnabled) return dialogs;

  if (!hasAnyAccess) {
    return (
      <>
        <section
          aria-labelledby="freemium-access-title"
          className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm md:p-6"
        >
          <div className="flex items-center gap-2 text-primary-300">
            <LockKeyOpenIcon size={24} weight="bold" />
            <h2 id="freemium-access-title" className="text-xl font-bold">
              Pilih Cara Akses TryOut
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#6ee7b7] p-5 text-green-950">
              <div className="flex flex-col gap-2">
                <p className="text-lg font-bold">Gratis · 1 TO</p>
                <OptionBenefits
                  items={[
                    "Follow IG & TikTok, share BC ke 5 grup WA",
                    "Kerjakan 1 TO pilihanmu",
                    `Pembahasan bisa dibuka ${FREEMIUM_PEMBAHASAN_PRICE_LABEL}`,
                  ]}
                />
              </div>
              <Button
                className="w-full bg-[#064e3b] text-white hover:bg-[#064e3b]/90"
                onClick={() => setRequirementsOpen(true)}
              >
                Penuhi Syarat
              </Button>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#818cf8] p-5 text-indigo-950">
              <div className="flex flex-col gap-2">
                <p className="text-lg font-bold">Paket 3 TO · {FREEMIUM_PAKET_PRICE_LABEL}</p>
                <OptionBenefits
                  items={["Kerjakan 3 TO pilihanmu", "Pembahasan 3 TO sudah termasuk", "Grup WA khusus pembeli paket"]}
                />
              </div>
              <Button
                className="w-full bg-[#312e81] text-white hover:bg-[#312e81]/90"
                disabled={payment.isPending}
                onClick={() => payment.pay()}
              >
                {payLabel}
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Brain Gym, kelas, dan fitur lain tetap seperti akun gratis.{" "}
            <Link to="/premium" className="font-semibold text-primary-300 underline-offset-2 hover:underline">
              Lihat Premium
            </Link>{" "}
            untuk akses semua fitur.
          </p>
        </section>
        {dialogs}
      </>
    );
  }

  return (
    <>
      <section
        aria-label="Status akses TryOut"
        className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {status.requirementsCompleted && (
              <SlotChip label="Gratis" used={status.freeSlots.used} total={status.freeSlots.total} />
            )}
            {status.packageSlots.total > 0 && (
              <SlotChip label="Paket" used={status.packageSlots.used} total={status.packageSlots.total} />
            )}
          </div>
          <p className="text-sm text-gray-600">
            {remaining > 0
              ? `Sisa ${remaining} TO. Pilih lewat tombol "Pilih TO ini" di kartu TO.`
              : "Semua jatah TO kamu sudah dipilih."}
          </p>
          <FreemiumWhatsappInvites showPaketGroup={status.hasPackage} compact />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {!status.requirementsCompleted && (
            <Button variant="outline" onClick={() => setRequirementsOpen(true)}>
              Dapat 1 TO Gratis
            </Button>
          )}
          {canBuyPaket && (
            <Button disabled={payment.isPending} onClick={() => payment.pay()}>
              {payment.isPending ? "Memproses..." : `Tambah 3 TO · ${FREEMIUM_PAKET_PRICE_LABEL}`}
            </Button>
          )}
        </div>
      </section>
      {dialogs}
    </>
  );
}

function SelectTryoutButton({
  tryoutId,
  status,
  className,
  variant,
}: {
  tryoutId: string;
  status: FreemiumStatus;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const { select } = useSelectTryout();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const usesPaket = status.packageSlots.remaining > 0;

  return (
    <>
      <Button className={className} variant={variant} disabled={select.isPending} onClick={() => setConfirmOpen(true)}>
        {select.isPending ? "Memilih..." : "Pilih TO ini"}
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pilih TO ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {usesPaket
                ? "Memakai 1 jatah Paket 3 TryOut. Pembahasannya sudah termasuk."
                : `Memakai jatah TO gratis kamu. Pembahasannya bisa dibuka ${FREEMIUM_PEMBAHASAN_PRICE_LABEL} setelah selesai.`}{" "}
              Pilihan masih bisa diganti selama TO ini belum mulai dikerjakan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => select.mutate({ tryoutId })}>Ya, pilih</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/** Aksi pilih/ganti TO di kartu daftar TO. Null kalau user punya akses penuh atau gerbang mati. */
export function TryoutCardAccess({ tryoutId, status }: { tryoutId: string; status: FreemiumStatus | undefined }) {
  const { unselect } = useSelectTryout();
  if (!status || !status.gateEnabled || status.fullAccess) return null;

  const selection = status.selections.find((item) => item.tryoutId === tryoutId);
  if (selection) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            selection.source === "paket" ? "bg-indigo-100 text-indigo-800" : "bg-emerald-100 text-emerald-800",
          )}
        >
          {selection.source === "paket" ? "Dipilih · pembahasan termasuk" : "Dipilih · TO gratis"}
        </span>
        {!selection.started && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            disabled={unselect.isPending}
            onClick={() => unselect.mutate({ tryoutId })}
          >
            Ganti TO
          </Button>
        )}
      </div>
    );
  }

  if (status.startableTryoutIds.includes(tryoutId)) {
    return (
      <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
        Sudah pernah dikerjakan
      </span>
    );
  }

  if (status.freeSlots.remaining + status.packageSlots.remaining > 0) {
    return <SelectTryoutButton tryoutId={tryoutId} status={status} variant="outline" className="w-full" />;
  }

  return null;
}

/** Ditampilkan di halaman detail saat TO ini belum bisa dikerjakan. */
export function TryoutDetailGate({ tryoutId, status }: { tryoutId: string; status: FreemiumStatus }) {
  const remaining = status.freeSlots.remaining + status.packageSlots.remaining;
  if (remaining === 0) return <FreemiumAccessPanel status={status} />;

  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-6">
      <div className="flex items-start gap-3">
        <LockKeyIcon size={24} weight="bold" className="mt-0.5 shrink-0 text-primary-300" />
        <div>
          <h2 className="font-bold text-gray-900">TO ini belum kamu pilih</h2>
          <p className="text-sm text-gray-600">
            Kamu masih punya {remaining} jatah TO. Pilih TO ini untuk mulai mengerjakan.
          </p>
        </div>
      </div>
      <SelectTryoutButton tryoutId={tryoutId} status={status} />
    </section>
  );
}

/** Isi paywall pembahasan di halaman hasil, menyesuaikan status freemium user. */
export function PembahasanPaywall({
  tryoutId,
  paid,
  hasUnusedCredit,
}: {
  tryoutId: string;
  paid: boolean;
  hasUnusedCredit: boolean;
}) {
  const status = useFreemiumStatus();
  const refresh = useRefreshFreemium();
  const payment = useFreemiumPayment({ kind: "pembahasan" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const selectMutation = useMutation(orpc.tryout.freemium.selectPembahasan.mutationOptions());

  const gateEnabled = status.data?.gateEnabled === true;
  // Jatah pembahasan sistem lama (pembeli Rp10.000 sebelum ada pilihan TO).
  const canUseLegacyCredit = gateEnabled && paid && hasUnusedCredit;
  const canPay = gateEnabled && !canUseLegacyCredit;

  const handleSelect = () => {
    selectMutation.mutate(
      { tryoutId },
      {
        onSuccess: async () => {
          await refresh();
          toast.success("Pembahasan TO ini sudah terbuka!");
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  };

  const description = canUseLegacyCredit
    ? "Kamu punya 1 jatah pembahasan. Pakai untuk TO ini? Jatah yang sudah dipakai tidak bisa dipindah ke TO lain."
    : canPay
      ? `Buka pembahasan TO ini cukup ${FREEMIUM_PEMBAHASAN_PRICE_LABEL}, atau upgrade ke Premium untuk pembahasan semua TO.`
      : "Akses evaluasi detail, kunci jawaban yang benar, dan pembahasan langkah demi langkah khusus untuk pengguna Premium.";

  return (
    <div className="relative z-10 flex flex-col items-center gap-4 px-6">
      <div className="flex size-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shadow-inner">
        <LockKeyIcon size={40} weight="fill" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">Pembahasan Terkunci</h2>
      <p className="max-w-md text-sm text-slate-600 md:text-base">{description}</p>

      <div className="mt-4 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
        {canUseLegacyCredit && (
          <Button
            size="lg"
            className="font-bold"
            disabled={selectMutation.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            <LockKeyOpenIcon weight="bold" /> Buka Pembahasan TO Ini
          </Button>
        )}
        {canPay && (
          <Button size="lg" className="font-bold" disabled={payment.isPending} onClick={() => payment.pay(tryoutId)}>
            {payment.isPending ? "Memproses..." : `Buka Pembahasan ${FREEMIUM_PEMBAHASAN_PRICE_LABEL}`}
          </Button>
        )}

        <Button asChild size="lg" className="bg-[#F2C94C] font-bold text-slate-900 shadow-md hover:bg-[#F2C94C]/90">
          <Link to="/premium">
            <StarIcon weight="fill" className="mr-2" size={20} /> Upgrade ke Premium
          </Link>
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buka pembahasan TO ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Jatah ini akan dipakai untuk TO ini dan tidak bisa dipindah ke TO lain. Pembahasan TO ini tetap terbuka
              selamanya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSelect}>Ya, buka TO ini</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
