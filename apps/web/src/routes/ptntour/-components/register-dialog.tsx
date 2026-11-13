import {
  CheckCircleIcon,
  CopyIcon,
  DownloadSimpleIcon,
  ImageSquareIcon,
  InstagramLogoIcon,
  TiktokLogoIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressImage } from "@/lib/compress-image";
import { useMidtransScript } from "@/lib/midtrans";
import { client, orpc } from "@/utils/orpc";
import { buildShareCaption, formatDate, formatTime, type PtnEvent, SOCIAL_LINKS } from "../-lib";

const PAY_PRICE_LABEL = "Rp10.000";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Tunggu webhook/sinkronisasi Midtrans sampai pendaftaran aktif (maks ~8 detik). */
async function waitForPaymentActivation(orderId: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const result = await client.transaction.status({ orderId });
      if (result.status === "success") return true;
      if (result.status === "failed") return false;
    } catch (error) {
      console.error("Failed to sync PTN Tour payment status", error);
    }
    await sleep(1000);
  }
  return false;
}

const CLASS_LEVELS = ["10 SMA/SMK", "11 SMA/SMK", "12 SMA/SMK", "Gap year", "Lainnya"] as const;

const selectClass =
  "h-10 w-full rounded-full border-2 border-sr-line-2 bg-white px-4 text-sm text-sr-ink outline-none focus:border-sr-blue-500 focus:ring-[3px] focus:ring-sr-blue-500/30";

export function RegisterDialog({
  event,
  isPremium,
  open,
  onOpenChange,
}: {
  event: PtnEvent;
  isPremium: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  useMidtransScript();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: profile } = useQuery({ ...orpc.profile.me.queryOptions(), enabled: open });
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [classLevel, setClassLevel] = useState<string>("");
  const [campus, setCampus] = useState("");
  const [followProofs, setFollowProofs] = useState<string[]>([]);
  const [shareProofs, setShareProofs] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [method, setMethod] = useState<"free" | "pay">("free");

  // Data profil terisi otomatis; pengguna hanya melengkapi yang kurang.
  useEffect(() => {
    if (!open || !profile) return;
    setPhone((current) => current || profile.phoneNumber || "");
    setCampus((current) => current || profile.dreamCampus || "");
  }, [open, profile]);

  const register = useMutation(
    orpc.ptnTour.register.mutationOptions({
      onSuccess: async () => {
        await refreshEvent();
        onOpenChange(false);
        navigate({ to: "/ptntour/$slug/success", params: { slug: event.slug } });
      },
      onError: (error) => toast.error("Pendaftaran belum berhasil", { description: error.message }),
    }),
  );

  const refreshEvent = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.ptnTour.list.queryKey() }),
      queryClient.invalidateQueries({ queryKey: orpc.ptnTour.detail.queryKey({ input: { slug: event.slug } }) }),
      queryClient.invalidateQueries({ queryKey: orpc.ptnTour.me.queryKey() }),
      queryClient.invalidateQueries({ queryKey: orpc.ptnTour.materials.queryKey({ input: { slug: event.slug } }) }),
    ]);

  const finishPayment = async (orderId: string) => {
    const activated = await waitForPaymentActivation(orderId);
    await refreshEvent();
    if (activated) {
      toast.success("Pembayaran berhasil, kamu sudah terdaftar!");
      navigate({ to: "/ptntour/$slug/success", params: { slug: event.slug } });
      return;
    }
    toast.info("Pembayaran sedang diproses. Pendaftaran aktif otomatis setelah terkonfirmasi.");
  };

  const checkout = useMutation(
    orpc.ptnTour.checkout.mutationOptions({
      onSuccess: (data) => {
        // Tutup dialog dulu supaya popup Midtrans tidak terhalang overlay dialog.
        onOpenChange(false);
        if (window.snap) {
          window.snap.pay(data.token, {
            onSuccess: () => void finishPayment(data.orderId),
            onPending: () => toast.info("Pembayaran sedang diproses. Pendaftaran aktif otomatis setelah terkonfirmasi."),
            onError: () => toast.error("Pembayaran gagal. Silakan coba lagi."),
            onClose: () => toast.warning("Pembayaran dibatalkan."),
          });
          return;
        }
        window.location.href = data.redirectUrl;
      },
      onError: (error) => toast.error("Pembayaran belum bisa dimulai", { description: error.message }),
    }),
  );

  const origin = typeof window === "undefined" ? "https://habitutor.id" : window.location.origin;
  const caption = buildShareCaption(event, origin);
  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Teks berhasil disalin");
    } catch {
      toast.error("Gagal menyalin. Salin manual dari kotak teks.");
    }
  };

  const canSubmit =
    phone.trim() &&
    school.trim() &&
    classLevel &&
    campus.trim() &&
    consent &&
    (isPremium || method === "pay" || (followProofs.length > 0 && shareProofs.length > 0)) &&
    !register.isPending &&
    !checkout.isPending;
  const paying = !isPremium && method === "pay";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 text-left">
            <img
              src={event.posterUrl}
              alt=""
              aria-hidden
              className="aspect-4/5 w-14 shrink-0 rounded-sr-md object-cover shadow-sr-2 ring-1 ring-sr-line"
            />
            <div className="min-w-0">
              <DialogTitle className="text-left leading-snug">Daftar {event.title}</DialogTitle>
              <DialogDescription className="mt-1 text-left">
                {formatDate(event.startsAt)} · {formatTime(event.startsAt)}. Cukup satu layar.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <StepLabel number={1} title="Data dirimu" />

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="reg-phone">Nomor WhatsApp</Label>
            <Input
              id="reg-phone"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="reg-school">Asal sekolah</Label>
            <Input
              id="reg-school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Contoh: SMAN 1 Yogyakarta"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="reg-class">Kelas</Label>
              <select
                id="reg-class"
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className={selectClass}
              >
                <option value="">Pilih kelas</option>
                {CLASS_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="reg-campus">Target PTN</Label>
              <Input
                id="reg-campus"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                placeholder="Contoh: UGM"
              />
            </div>
          </div>
        </div>

        <StepLabel number={2} title={isPremium ? "Akses Premium" : "Pilih cara daftar"} />
        {isPremium ? (
          <p className="rounded-sr-md bg-sr-sun-100 p-3 text-sm text-sr-amber-700">
            Akunmu <strong>Premium</strong>, jadi tidak perlu follow atau membagikan poster. Cukup lengkapi data di
            atas.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Cara daftar">
            {(
              [
                { value: "free", title: "Gratis", hint: "Follow + share poster" },
                { value: "pay", title: `Bayar ${PAY_PRICE_LABEL}`, hint: "Langsung daftar, tanpa syarat" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={method === option.value}
                onClick={() => setMethod(option.value)}
                className={`relative rounded-sr-lg border-2 p-3 text-left transition-all duration-200 ${
                  method === option.value
                    ? "border-sr-blue-500 bg-sr-blue-50 shadow-sr-1"
                    : "border-sr-line bg-white hover:border-sr-blue-200"
                }`}
              >
                <span
                  className={`absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full border-2 transition-colors ${
                    method === option.value ? "border-sr-blue-500 bg-sr-blue-500 text-white" : "border-sr-line-2 bg-white"
                  }`}
                >
                  {method === option.value && <CheckCircleIcon weight="fill" className="size-4" />}
                </span>
                <span className="block text-base font-black text-sr-ink">{option.title}</span>
                <span className="block text-xs text-sr-muted">{option.hint}</span>
              </button>
            ))}
          </div>
        )}

        {!isPremium && method === "free" && (
          <div className="grid gap-3 rounded-sr-lg border border-sr-line bg-sr-ivory/70 p-3">
            <div>
              <p className="text-sm font-black text-sr-ink">1. Follow akun Habitutor</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer">
                    <InstagramLogoIcon /> @habitutor.id
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <a href={SOCIAL_LINKS.instagramTutor} target="_blank" rel="noreferrer">
                    <InstagramLogoIcon /> @zhafirr.ah
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noreferrer">
                    <TiktokLogoIcon /> TikTok
                  </a>
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-black text-sr-ink">2. Bagikan poster ke 5 grup</p>
              <p className="mt-1 rounded-sr-md bg-white p-2 text-xs leading-relaxed text-sr-muted">{caption}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={copyCaption}>
                  <CopyIcon /> Salin teks
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <a href={event.posterUrl} download target="_blank" rel="noreferrer">
                    <DownloadSimpleIcon /> Unduh poster
                  </a>
                </Button>
              </div>
            </div>
            <ProofPicker
              label="Screenshot follow (maks 5)"
              hint="Bukti kamu sudah follow Instagram dan TikTok Habitutor."
              max={5}
              images={followProofs}
              onChange={setFollowProofs}
            />
            <ProofPicker
              label="Screenshot share poster (maks 10)"
              hint="Bukti kamu sudah membagikan teks dan poster ke 5 grup."
              max={10}
              images={shareProofs}
              onChange={setShareProofs}
            />
          </div>
        )}

        {paying && (
          <p className="rounded-sr-md bg-sr-ivory p-3 text-sm text-sr-muted">
            Bayar {PAY_PRICE_LABEL} lewat QRIS, e-wallet, atau transfer. Kamu langsung terdaftar begitu pembayaran
            terkonfirmasi, tanpa follow atau share.
          </p>
        )}

        <StepLabel number={3} title="Konfirmasi" />
        <label className="flex items-start gap-2 text-xs leading-relaxed text-sr-muted">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 size-4 accent-[#2356e8]"
          />
          Aku setuju datanya (nama, WhatsApp, sekolah, kelas, target PTN) dipakai Habitutor untuk pendaftaran dan
          informasi event ini.
        </label>

        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 border-t border-sr-line bg-white/95 px-6 py-3 backdrop-blur">
          <Button
            className="w-full"
            disabled={!canSubmit}
            onClick={() => {
              if (paying) {
                checkout.mutate({
                  eventId: event.id,
                  phoneNumber: phone,
                  schoolName: school,
                  classLevel,
                  dreamCampus: campus,
                  educationLevel: profile?.educationLevel || "SMA",
                  consent,
                });
                return;
              }
              register.mutate({
                eventId: event.id,
                phoneNumber: phone,
                schoolName: school,
                classLevel,
                dreamCampus: campus,
                educationLevel: profile?.educationLevel || "SMA",
                consent,
                followProofs: isPremium ? [] : followProofs,
                shareProofs: isPremium ? [] : shareProofs,
              });
            }}
          >
            <CheckCircleIcon weight="fill" />
            {paying
              ? checkout.isPending
                ? "Membuka pembayaran…"
                : `Bayar ${PAY_PRICE_LABEL} & Daftar`
              : register.isPending
                ? "Mendaftarkan…"
                : "Daftar Sekarang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StepLabel({ number, title }: { number: number; title: string }) {
  return (
    <p className="flex items-center gap-2 text-xs font-black tracking-wider text-sr-ink uppercase">
      <span className="flex size-5 items-center justify-center rounded-full bg-sr-blue-500 text-[11px] text-white">
        {number}
      </span>
      {title}
      <span aria-hidden className="h-px flex-1 bg-sr-line" />
    </p>
  );
}

function ProofPicker({
  label,
  hint,
  max,
  images,
  onChange,
}: {
  label: string;
  hint: string;
  max: number;
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const room = max - images.length;
      const picked = Array.from(files).slice(0, room);
      const compressed = await Promise.all(picked.map((file) => compressImage(file)));
      onChange([...images, ...compressed]);
      if (files.length > room) toast.info(`Maksimal ${max} gambar, sisanya diabaikan.`);
    } catch {
      toast.error("Gambar belum bisa diproses", { description: "Coba pilih file PNG, JPG, atau WebP." });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <p className="text-sm font-black text-sr-ink">{label}</p>
      <p className="text-xs text-sr-muted">{hint}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {images.map((src, index) => (
          <span key={`${index.toString()}-${src.length}`} className="relative">
            <img
              src={src}
              alt={`Bukti ${index + 1}`}
              className="size-14 rounded-sr-sm object-cover ring-1 ring-sr-line"
            />
            <button
              type="button"
              aria-label={`Hapus bukti ${index + 1}`}
              onClick={() => onChange(images.filter((_, i) => i !== index))}
              className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-sr-ink text-white"
            >
              <XIcon className="size-3" weight="bold" />
            </button>
          </span>
        ))}
        {images.length < max && (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="flex size-14 flex-col items-center justify-center gap-0.5 rounded-sr-sm border-2 border-dashed border-sr-blue-300 bg-white text-[10px] font-bold text-sr-blue-600 transition-colors hover:bg-sr-blue-50 disabled:opacity-60"
          >
            <ImageSquareIcon className="size-5" />
            {busy ? "…" : "Tambah"}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="sr-only"
        onChange={(event) => void addFiles(event.target.files)}
      />
    </div>
  );
}
