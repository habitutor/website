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
import { FREEMIUM_LINKS, FREEMIUM_PRICE_LABEL, buildBroadcastText, isFreemiumLinkReady } from "@/lib/freemium-links";
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

export function useFreemiumStatus() {
  return useQuery(orpc.tryout.freemium.status.queryOptions({ input: {} }));
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

/** Bayar Rp10.000 lewat Midtrans Snap; akses aktif otomatis setelah pembayaran settle. */
export function useFreemiumPayment({ onPaid }: { onPaid?: () => void } = {}) {
  useMidtransScript();
  const refresh = useRefreshFreemium();
  const mutation = useMutation(orpc.transaction.subscribeFreemium.mutationOptions());

  const completePayment = async (orderId: string) => {
    const activated = await waitForPaymentActivation(orderId);
    await refresh();
    if (activated) {
      toast.success("Pembayaran berhasil! Akses TO kamu sudah aktif.");
      onPaid?.();
      return;
    }
    toast.info("Pembayaran sedang diproses. Akses akan aktif otomatis dalam beberapa saat.");
  };

  const pay = () => {
    if (mutation.isPending) return;

    mutation.mutate(
      {},
      {
        onSuccess: (data) => {
          if (window.snap) {
            window.snap.pay(data.token, {
              onSuccess: () => void completePayment(data.orderId),
              onPending: () => toast.info("Menunggu pembayaran..."),
              onError: () => toast.error("Pembayaran gagal. Silakan coba lagi."),
              onClose: () => toast.warning("Pembayaran dibatalkan."),
            });
            return;
          }
          window.location.href = data.redirectUrl;
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return { pay, isPending: mutation.isPending };
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

export function FreemiumWhatsappInvite() {
  if (!isFreemiumLinkReady(FREEMIUM_LINKS.whatsappGroup)) return null;

  return (
    <Button asChild className="w-full bg-whatsapp text-white hover:bg-whatsapp/90">
      <a href={FREEMIUM_LINKS.whatsappGroup} target="_blank" rel="noopener noreferrer">
        <WhatsappLogoIcon weight="fill" />
        Gabung Grup WhatsApp TryOut
        <ArrowSquareOutIcon />
      </a>
    </Button>
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
      <p className="whitespace-pre-wrap text-gray-700">{broadcastText}</p>
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
        "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 text-sm transition-colors hover:bg-gray-50",
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
        onError: (error) => toast.error(error.message),
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
              <DialogTitle>Syarat terpenuhi, TO sudah terbuka!</DialogTitle>
              <DialogDescription>
                Kamu bisa langsung mengerjakan semua TO. Pembahasan tidak termasuk di akses gratis; mau buka pembahasan
                1 TO? Bayar {FREEMIUM_PRICE_LABEL} kapan saja.
              </DialogDescription>
            </DialogHeader>
            <FreemiumWhatsappInvite />
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Mulai Kerjakan TO</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Akses Gratis: Penuhi 3 Syarat</DialogTitle>
              <DialogDescription>
                Lakukan ketiga hal di bawah, lalu upload foto buktinya. TO langsung terbuka setelah upload.
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
                {submitMutation.isPending ? "Mengirim..." : "Kirim Bukti & Buka TO"}
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:mx-0">
            <CheckCircleIcon size={28} weight="fill" />
          </div>
          <DialogTitle>Pembayaran berhasil, TO sudah terbuka!</DialogTitle>
          <DialogDescription>
            Kerjakan semua TO sekarang. Setelah selesai mengerjakan, buka halaman hasilnya untuk memilih 1 TO yang
            pembahasannya ingin dibuka.
          </DialogDescription>
        </DialogHeader>
        <FreemiumWhatsappInvite />
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Mulai Kerjakan TO</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Dua pilihan akses: gratis (syarat) atau bayar Rp10.000 (bonus pembahasan 1 TO).
 * Dialog sukses tetap hidup walau kartu pilihan sudah disembunyikan (gated=false) setelah akses terbuka.
 */
export function FreemiumAccessCard({ gated }: { gated: boolean }) {
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [paidOpen, setPaidOpen] = useState(false);
  const payment = useFreemiumPayment({ onPaid: () => setPaidOpen(true) });

  return (
    <>
      {gated && (
        <div className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-2 text-primary-300">
            <LockKeyOpenIcon size={24} weight="bold" />
            <h2 className="text-xl font-bold">Pilih Cara Akses TryOut</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#6ee7b7] p-5 text-green-950">
              <div className="flex flex-col gap-1">
                <p className="text-lg font-bold">Gratis</p>
                <p className="text-sm">
                  Penuhi syarat (follow IG &amp; TikTok, share BC ke 5 grup WA). Kerjakan semua TO tanpa pembahasan.
                </p>
              </div>
              <Button
                className="w-full bg-[#064e3b] text-white hover:bg-[#064e3b]/90"
                onClick={() => setRequirementsOpen(true)}
              >
                Penuhi Syarat
              </Button>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-xl bg-[#818cf8] p-5 text-indigo-950">
              <div className="flex flex-col gap-1">
                <p className="text-lg font-bold">{FREEMIUM_PRICE_LABEL}</p>
                <p className="text-sm">
                  Kerjakan semua TO + fasilitas yang sama, plus buka pembahasan untuk 1 TO pilihanmu.
                </p>
              </div>
              <Button
                className="w-full bg-[#312e81] text-white hover:bg-[#312e81]/90"
                disabled={payment.isPending}
                onClick={payment.pay}
              >
                {payment.isPending ? "Memproses..." : `Bayar ${FREEMIUM_PRICE_LABEL}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      <FreemiumRequirementsDialog open={requirementsOpen} onOpenChange={setRequirementsOpen} />
      <FreemiumPaidDialog open={paidOpen} onOpenChange={setPaidOpen} />
    </>
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
  const payment = useFreemiumPayment();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const selectMutation = useMutation(orpc.tryout.freemium.selectPembahasan.mutationOptions());

  const gateEnabled = status.data?.gateEnabled === true;
  const canChoose = gateEnabled && hasUnusedCredit;
  const canPay = gateEnabled && !hasUnusedCredit;

  const handleSelect = () => {
    selectMutation.mutate(
      { tryoutId },
      {
        onSuccess: async () => {
          await refresh();
          toast.success("Pembahasan TO ini sudah terbuka!");
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const description = canChoose
    ? "Kamu punya 1 jatah pembahasan. Pakai untuk TO ini? Jatah yang sudah dipakai tidak bisa dipindah ke TO lain."
    : canPay && paid
      ? `Jatah pembahasan kamu sudah terpakai. Bayar ${FREEMIUM_PRICE_LABEL} lagi untuk membuka pembahasan TO ini, atau upgrade ke Premium untuk semua TO.`
      : canPay
        ? `Bayar ${FREEMIUM_PRICE_LABEL} untuk membuka pembahasan TO ini, atau upgrade ke Premium untuk semua TO.`
        : "Akses evaluasi detail, kunci jawaban yang benar, dan pembahasan langkah demi langkah khusus untuk pengguna Premium.";

  return (
    <div className="relative z-10 flex flex-col items-center gap-4 px-6">
      <div className="flex size-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shadow-inner">
        <LockKeyIcon size={40} weight="fill" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">Pembahasan Terkunci</h2>
      <p className="max-w-md text-sm text-slate-600 md:text-base">{description}</p>

      <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
        {canChoose && (
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
          <Button size="lg" className="font-bold" disabled={payment.isPending} onClick={payment.pay}>
            {payment.isPending
              ? "Memproses..."
              : paid
                ? `Bayar ${FREEMIUM_PRICE_LABEL} Lagi`
                : `Bayar ${FREEMIUM_PRICE_LABEL}`}
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
              selamanya.{" "}
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
