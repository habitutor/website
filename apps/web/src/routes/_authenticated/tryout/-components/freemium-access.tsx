import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  CheckCircleIcon,
  CopyIcon,
  ImageIcon,
  LockKeyIcon,
  LockKeyOpenIcon,
  PlusCircleIcon,
  SparkleIcon,
  StarIcon,
  TicketIcon,
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
    success: "Pembayaran berhasil! Kamu dapat 3 jatah Try Out, pembahasannya sudah termasuk.",
    pending: "Pembayaran sedang diproses. Jatah Try Out akan aktif otomatis setelah terkonfirmasi.",
  },
  pembahasan: {
    success: "Pembayaran berhasil! Pembahasan Try Out ini sudah terbuka.",
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
          data.source === "paket"
            ? "Try Out dipilih. Pembahasannya sudah termasuk paket."
            : "Try Out gratis kamu sudah dipilih.",
        );
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    }),
  );
  const unselect = useMutation(
    orpc.tryout.freemium.unselect.mutationOptions({
      onSuccess: async () => {
        await refresh();
        toast.success("Pilihan dilepas. Jatahnya bisa dipakai untuk Try Out lain.");
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

/** Channel WA untuk semua yang punya akses; grup WA Try Out untuk yang lolos syarat gratis dan pembeli paket. */
export function FreemiumWhatsappInvites({ showPaketGroup = false }: { showPaketGroup?: boolean }) {
  const { channel, paketGroup } = FREEMIUM_WHATSAPP_LINKS;
  if (!channel && !(showPaketGroup && paketGroup)) return null;

  return (
    <div className="flex flex-col gap-2">
      {showPaketGroup && paketGroup && <WhatsappButton href={paketGroup} label="Gabung Grup WA Try Out" />}
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
    <div className="flex flex-col gap-2 rounded-sr-sm border bg-sr-ivory p-3 text-sm">
      <p className="max-h-48 overflow-y-auto whitespace-pre-wrap text-sr-ink-2">{broadcastText}</p>
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
        "flex cursor-pointer items-center gap-3 rounded-sr-sm border border-dashed p-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-sr-blue-300 hover:bg-sr-ivory",
        preview && "border-sr-live bg-sr-live/5",
      )}
    >
      {preview ? (
        <img src={preview} alt={label} className="size-14 shrink-0 rounded-sr-xs border object-cover" />
      ) : (
        <span className="flex size-14 shrink-0 items-center justify-center rounded-sr-xs bg-sr-blue-50 text-sr-blue-300">
          <ImageIcon size={24} />
        </span>
      )}
      <span className="flex flex-col">
        <span className="font-semibold text-sr-ink">{label}</span>
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
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-sr-live/10 text-sr-live sm:mx-0">
                <CheckCircleIcon size={28} weight="fill" />
              </div>
              <DialogTitle>Syarat terpenuhi, kamu dapat 1 Try Out gratis!</DialogTitle>
              <DialogDescription>
                Pilih 1 Try Out lewat tombol "Pilih Try Out ini" di daftar Try Out. Pilihan masih bisa diganti selama
                Try Out-nya belum mulai dikerjakan. Pembahasannya bisa dibuka {FREEMIUM_PEMBAHASAN_PRICE_LABEL} setelah
                selesai.
              </DialogDescription>
            </DialogHeader>
            <FreemiumWhatsappInvites showPaketGroup />
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Pilih Try Out</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Akses Gratis: Penuhi 3 Syarat</DialogTitle>
              <DialogDescription>
                Lakukan ketiga hal di bawah, lalu upload foto buktinya. Setelah terkirim, kamu langsung bisa memilih 1
                Try Out.
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
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-sr-live/10 text-sr-live sm:mx-0">
            <CheckCircleIcon size={28} weight="fill" />
          </div>
          <DialogTitle>Paket 3 Try Out aktif!</DialogTitle>
          <DialogDescription>
            Pilih 3 Try Out lewat tombol "Pilih Try Out ini" di daftar Try Out. Pembahasan ketiga Try Out itu sudah
            termasuk dan terbuka setelah kamu selesai mengerjakannya.
          </DialogDescription>
        </DialogHeader>
        <FreemiumWhatsappInvites showPaketGroup />
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Pilih Try Out</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FreeAccessCard({ onOpenRequirements }: { onOpenRequirements: () => void }) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-sr-xl border-2 border-sr-line bg-white p-6 shadow-sr-1 transition-all duration-300 hover:-translate-y-0.5 hover:border-sr-blue-300 hover:shadow-sr-2 md:p-7">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sr-line bg-sr-ivory px-3 py-1 text-xs font-extrabold tracking-wide text-sr-ink-2 uppercase">
            Jalur Gratis
          </span>
          <span className="text-xs font-semibold text-sr-muted">1 jatah Try Out</span>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-sr-ink sm:text-2xl">1 Try Out Gratis</h3>
          <p className="mt-1 text-xs text-sr-muted">Cukup ikuti 3 langkah pendaftaran sederhana</p>
        </div>

        <div className="flex items-baseline gap-1.5 border-y border-sr-line/70 py-3.5">
          <span className="text-3xl font-black text-sr-ink sm:text-4xl">Rp0</span>
          <span className="text-xs font-semibold text-sr-muted">/ 1 Try Out</span>
        </div>

        <ul className="flex flex-col gap-3 text-sm">
          <li className="flex items-start gap-2.5 text-sr-ink-2">
            <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-sr-blue-50 text-sr-blue-600">
              <CheckCircleIcon size={16} weight="bold" />
            </span>
            <span>Follow Instagram & TikTok, lalu bagikan pesan ke 5 grup WA</span>
          </li>
          <li className="flex items-start gap-2.5 text-sr-ink-2">
            <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-sr-blue-50 text-sr-blue-600">
              <CheckCircleIcon size={16} weight="bold" />
            </span>
            <span>Bebas pilih 1 Try Out yang ingin kamu kerjakan</span>
          </li>
          <li className="flex items-start gap-2.5 text-sr-ink-2">
            <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-sr-blue-50 text-sr-blue-600">
              <CheckCircleIcon size={16} weight="bold" />
            </span>
            <span>Skor dan evaluasi langsung keluar setelah pengerjaan selesai</span>
          </li>
          <li className="flex items-start gap-2.5 text-xs text-sr-muted">
            <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full border border-sr-line bg-sr-ivory text-sr-muted">
              <CheckCircleIcon size={14} weight="regular" />
            </span>
            <span>Pembahasan soal bisa dibuka {FREEMIUM_PEMBAHASAN_PRICE_LABEL} per Try Out</span>
          </li>
        </ul>
      </div>

      <div className="mt-6 pt-2">
        <Button
          variant="outline"
          className="w-full rounded-full border-2 border-sr-line-2 bg-white py-3 text-sm font-extrabold text-sr-ink transition-all hover:border-sr-blue-500 hover:bg-sr-blue-50 hover:text-sr-blue-600 hover:shadow-sr-1"
          onClick={onOpenRequirements}
        >
          Penuhi Syarat Gratis
        </Button>
      </div>
    </div>
  );
}

function PaidAccessCard({ onPay, isPending }: { onPay: () => void; isPending: boolean }) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-sr-xl sr-card-blue p-6 text-white shadow-sr-2 ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sr-3 md:p-7">
      <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-white/10 blur-xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 size-40 rounded-full bg-white/5 blur-lg" />

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sr-sun-200 bg-sr-sun-100 px-3 py-1 text-xs font-black tracking-wider text-sr-amber-700 uppercase shadow-sr-1">
            <SparkleIcon weight="fill" className="size-3 text-sr-amber-700" />
            Paling Hemat
          </span>
          <span className="text-xs font-bold text-sr-sun-200">Akses langsung</span>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-sr-sun-200 sm:text-2xl">Paket 3 Try Out</h3>
          <p className="mt-1 text-xs text-white/85">Langsung kerjakan tanpa perlu upload bukti pendaftaran</p>
        </div>

        <div className="flex flex-col gap-2 border-y border-white/20 py-3.5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-sr-sun-200 sm:text-4xl">{FREEMIUM_PAKET_PRICE_LABEL}</span>
            <span className="text-xs font-semibold text-white/80">/ 3 Try Out</span>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-white">
            <CheckCircleIcon weight="fill" className="size-3.5 text-sr-sun-400" />
            Sudah termasuk pembahasan ketiga Try Out
          </span>
        </div>

        <ul className="flex flex-col gap-3 text-sm">
          <li className="flex items-start gap-2.5 text-white/95">
            <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink shadow-sr-1">
              <CheckCircleIcon size={14} weight="bold" />
            </span>
            <span>Bebas pilih dan kerjakan 3 Try Out kapan saja</span>
          </li>
          <li className="flex items-start gap-2.5 text-white/95">
            <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink shadow-sr-1">
              <CheckCircleIcon size={14} weight="bold" />
            </span>
            <span>Pembahasan lengkap 3 Try Out sudah otomatis terbuka</span>
          </li>
          <li className="flex items-start gap-2.5 text-white/95">
            <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink shadow-sr-1">
              <CheckCircleIcon size={14} weight="bold" />
            </span>
            <span>Gabung grup WhatsApp komunitas Try Out Habitutor</span>
          </li>
        </ul>
      </div>

      <div className="relative z-10 mt-6 pt-2">
        <Button
          variant="secondary"
          className="sr-sheen w-full rounded-full py-3 text-base font-extrabold text-sr-ink shadow-sr-sun transition-all active:scale-95"
          disabled={isPending}
          onClick={onPay}
        >
          {isPending ? "Memproses..." : "Beli Paket 3 Try Out"}
        </Button>
      </div>
    </div>
  );
}

function SlotChip({ label, used, total }: { label: string; used: number; total: number }) {
  return (
    <span className="rounded-full border border-sr-line bg-sr-ivory px-3 py-1 text-xs font-semibold text-sr-ink-2">
      {label}: {used}/{total} Try Out dipakai
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
          id="freemium-access-panel"
          aria-label="Pilihan cara akses Try Out"
          className="relative flex flex-col gap-5 overflow-hidden rounded-sr-xl border border-sr-line bg-linear-to-b from-sr-ivory/60 via-white to-white p-4 shadow-sr-1 sm:p-5 md:p-6"
        >
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
            <FreeAccessCard onOpenRequirements={() => setRequirementsOpen(true)} />
            <PaidAccessCard onPay={() => payment.pay()} isPending={payment.isPending} />
          </div>

          <div className="flex flex-col items-start justify-between gap-3 rounded-sr-lg border border-sr-sun-200 bg-linear-to-r from-sr-sun-100/60 via-sr-cream/40 to-sr-blue-50/60 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink shadow-sr-1">
                <StarIcon weight="fill" className="size-4" />
              </span>
              <p className="text-xs text-sr-ink-2 sm:text-sm">
                Ingin akses tanpa batas ke <strong>semua Try Out</strong>, materi kelas, dan{" "}
                <strong>150+ sesi live</strong>?
              </p>
            </div>
            <Link
              to="/premium"
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-sr-blue-600 transition-colors hover:text-sr-blue-700 hover:underline sm:text-sm"
            >
              Lihat Paket Premium <ArrowRightIcon weight="bold" className="size-3.5" />
            </Link>
          </div>
        </section>
        {dialogs}
      </>
    );
  }

  return (
    <>
      <section
        aria-label="Status akses Try Out"
        className="flex flex-col gap-4 rounded-sr-xl border border-sr-line bg-white p-4 shadow-sr-1 sm:p-5"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-sr-sm bg-sr-blue-50 text-sr-blue-600">
              <TicketIcon weight="fill" className="size-6" />
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="font-extrabold text-sr-ink">Akses Try Out kamu</p>
              <div className="flex flex-wrap gap-2">
                {status.requirementsCompleted && (
                  <SlotChip label="Gratis" used={status.freeSlots.used} total={status.freeSlots.total} />
                )}
                {status.packageSlots.total > 0 && (
                  <SlotChip label="Paket" used={status.packageSlots.used} total={status.packageSlots.total} />
                )}
              </div>
              {remaining > 0 && (
                <p className="text-sm text-sr-muted">
                  Sisa {remaining} Try Out. Pilih lewat tombol "Pilih Try Out ini" di kartu Try Out.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:shrink-0">
            {!status.requirementsCompleted && (
              <Button
                variant="outline"
                className="rounded-full border-sr-line-2 font-semibold hover:border-sr-blue-300 hover:bg-sr-blue-50"
                onClick={() => setRequirementsOpen(true)}
              >
                Dapat 1 Try Out Gratis
              </Button>
            )}
            {canBuyPaket && (
              <Button
                variant="secondary"
                className="sr-sheen rounded-full px-5 font-bold shadow-sr-sun transition-all"
                disabled={payment.isPending}
                onClick={() => payment.pay()}
              >
                {payment.isPending ? (
                  "Memproses..."
                ) : (
                  <>
                    <PlusCircleIcon weight="fill" className="size-4 text-sr-amber-700" />
                    <span>Tambah 3 Try Out</span>
                    <span className="rounded-full bg-sr-ink/10 px-2 py-0.5 text-xs font-black text-sr-ink">
                      {FREEMIUM_PAKET_PRICE_LABEL}
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>
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
        {select.isPending ? "Memilih..." : "Pilih Try Out ini"}
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pilih Try Out ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {usesPaket
                ? "Memakai 1 jatah Paket 3 Try Out. Pembahasannya sudah termasuk."
                : `Memakai jatah Try Out gratis kamu. Pembahasannya bisa dibuka ${FREEMIUM_PEMBAHASAN_PRICE_LABEL} setelah selesai.`}{" "}
              Pilihan masih bisa diganti selama Try Out ini belum mulai dikerjakan.
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

/** Aksi pilih/ganti Try Out di kartu daftar Try Out. Null kalau user punya akses penuh atau gerbang mati. */
export function TryoutCardAccess({ tryoutId, status }: { tryoutId: string; status: FreemiumStatus | undefined }) {
  const { unselect } = useSelectTryout();
  if (!status || !status.gateEnabled || status.fullAccess) return null;

  const selection = status.selections.find((item) => item.tryoutId === tryoutId);
  if (selection) {
    // Try Out gratis yang sudah dikerjakan bisa pindah ke jatah paket, jadi label mengikuti akses pembahasan.
    const hasPembahasan = status.pembahasanTryoutIds.includes(tryoutId);
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-sr-md border px-3 py-2.5",
          hasPembahasan ? "border-sr-blue-200 bg-sr-blue-50" : "border-sr-live/30 bg-sr-live/10",
        )}
      >
        <CheckCircleIcon
          weight="fill"
          className={cn("size-5 shrink-0", hasPembahasan ? "text-sr-blue-600" : "text-sr-live")}
        />
        <div className="min-w-0 flex-1 leading-tight">
          <p className={cn("text-sm font-extrabold", hasPembahasan ? "text-sr-blue-700" : "text-sr-live")}>
            Try Out ini sudah kamu pilih
          </p>
          <p className="text-xs text-sr-ink-2">
            {hasPembahasan ? "Pembahasan sudah termasuk" : "Pakai jatah Try Out gratis"}
          </p>
        </div>
        {!selection.started && (
          <button
            type="button"
            className="shrink-0 text-xs font-bold text-sr-blue-600 hover:underline disabled:opacity-50"
            disabled={unselect.isPending}
            onClick={() => unselect.mutate({ tryoutId })}
          >
            Ganti Try Out
          </button>
        )}
      </div>
    );
  }

  if (status.startableTryoutIds.includes(tryoutId)) {
    return (
      <div className="flex items-center gap-2 rounded-sr-md border border-sr-live/30 bg-sr-live/10 px-3 py-2.5 text-sm font-bold text-sr-live">
        <CheckCircleIcon weight="fill" className="size-5 shrink-0" /> Sudah pernah dikerjakan
      </div>
    );
  }

  if (status.freeSlots.remaining + status.packageSlots.remaining > 0) {
    return <SelectTryoutButton tryoutId={tryoutId} status={status} variant="outline" className="w-full rounded-full" />;
  }

  return null;
}

/** Ditampilkan di halaman detail saat Try Out ini belum bisa dikerjakan. */
export function TryoutDetailGate({ tryoutId, status }: { tryoutId: string; status: FreemiumStatus }) {
  const remaining = status.freeSlots.remaining + status.packageSlots.remaining;
  if (remaining === 0) return <FreemiumAccessPanel status={status} />;

  return (
    <section className="flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 sm:flex-row sm:items-center sm:justify-between md:p-6">
      <div className="flex items-start gap-3">
        <LockKeyIcon size={24} weight="bold" className="mt-0.5 shrink-0 text-sr-blue-600" />
        <div>
          <h2 className="font-bold text-sr-ink">Try Out ini belum kamu pilih</h2>
          <p className="text-sm text-sr-muted">
            Kamu masih punya {remaining} jatah Try Out. Pilih Try Out ini untuk mulai mengerjakan.
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
          toast.success("Pembahasan Try Out ini sudah terbuka!");
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  };

  const description = canUseLegacyCredit
    ? "Kamu punya 1 jatah pembahasan. Pakai untuk Try Out ini? Jatah yang sudah dipakai tidak bisa dipindah ke Try Out lain."
    : canPay
      ? `Buka pembahasan Try Out ini cukup ${FREEMIUM_PEMBAHASAN_PRICE_LABEL}, atau upgrade ke Premium untuk pembahasan semua Try Out.`
      : "Akses evaluasi detail, kunci jawaban yang benar, dan pembahasan langkah demi langkah khusus untuk pengguna Premium.";

  return (
    <div className="relative z-10 flex flex-col items-center gap-4 px-6">
      <div className="flex size-20 items-center justify-center rounded-full bg-sr-blue-50 text-sr-blue-600">
        <LockKeyIcon size={40} weight="fill" />
      </div>
      <h2 className="text-2xl font-bold text-sr-ink md:text-3xl">Pembahasan Terkunci</h2>
      <p className="max-w-md text-sm text-sr-muted md:text-base">{description}</p>

      <div className="mt-4 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
        {canUseLegacyCredit && (
          <Button
            size="lg"
            className="font-bold"
            disabled={selectMutation.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            <LockKeyOpenIcon weight="bold" /> Buka Pembahasan Try Out Ini
          </Button>
        )}
        {canPay && (
          <Button size="lg" className="font-bold" disabled={payment.isPending} onClick={() => payment.pay(tryoutId)}>
            {payment.isPending ? "Memproses..." : `Buka Pembahasan ${FREEMIUM_PEMBAHASAN_PRICE_LABEL}`}
          </Button>
        )}

        <Button
          asChild
          size="lg"
          className="rounded-full bg-sr-sun-500 font-bold text-sr-ink shadow-sr-sun hover:bg-sr-sun-400"
        >
          <Link to="/premium">
            <StarIcon weight="fill" className="mr-2" size={20} /> Upgrade ke Premium
          </Link>
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buka pembahasan Try Out ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Jatah ini akan dipakai untuk Try Out ini dan tidak bisa dipindah ke Try Out lain. Pembahasan Try Out ini
              tetap terbuka selamanya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleSelect}>Ya, buka Try Out ini</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
