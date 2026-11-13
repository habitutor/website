import {
  CheckCircleIcon,
  CopyIcon,
  DownloadSimpleIcon,
  InstagramLogoIcon,
  TiktokLogoIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { orpc } from "@/utils/orpc";
import { buildShareCaption, formatDate, formatTime, type PtnEvent, SOCIAL_LINKS } from "../-lib";

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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: profile } = useQuery({ ...orpc.profile.me.queryOptions(), enabled: open });
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [classLevel, setClassLevel] = useState<string>("");
  const [campus, setCampus] = useState("");
  const [stepsDone, setStepsDone] = useState(false);
  const [consent, setConsent] = useState(false);

  // Data profil terisi otomatis; pengguna hanya melengkapi yang kurang.
  useEffect(() => {
    if (!open || !profile) return;
    setPhone((current) => current || profile.phoneNumber || "");
    setCampus((current) => current || profile.dreamCampus || "");
  }, [open, profile]);

  const register = useMutation(
    orpc.ptnTour.register.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: orpc.ptnTour.list.queryKey() }),
          queryClient.invalidateQueries({ queryKey: orpc.ptnTour.detail.queryKey({ input: { slug: event.slug } }) }),
          queryClient.invalidateQueries({ queryKey: orpc.ptnTour.me.queryKey() }),
          queryClient.invalidateQueries({ queryKey: orpc.ptnTour.materials.queryKey({ input: { slug: event.slug } }) }),
        ]);
        onOpenChange(false);
        navigate({ to: "/ptntour/$slug/success", params: { slug: event.slug } });
      },
      onError: (error) => toast.error("Pendaftaran belum berhasil", { description: error.message }),
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
    (isPremium || stepsDone) &&
    !register.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Daftar {event.title}</DialogTitle>
          <DialogDescription>
            {formatDate(event.startsAt)} · {formatTime(event.startsAt)}. Gratis dan cuma butuh satu layar.
          </DialogDescription>
        </DialogHeader>

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

        {isPremium ? (
          <p className="rounded-sr-md bg-sr-sun-100 p-3 text-sm text-sr-amber-700">
            Akunmu <strong>Premium</strong>, jadi tidak perlu follow atau membagikan poster. Cukup lengkapi data di
            atas.
          </p>
        ) : (
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
            <label className="flex items-start gap-2 text-sm font-semibold text-sr-ink">
              <input
                type="checkbox"
                checked={stepsDone}
                onChange={(e) => setStepsDone(e.target.checked)}
                className="mt-1 size-4 accent-[#2356e8]"
              />
              Aku sudah follow dan membagikan poster ke 5 grup.
            </label>
          </div>
        )}

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
            onClick={() =>
              register.mutate({
                eventId: event.id,
                phoneNumber: phone,
                schoolName: school,
                classLevel,
                dreamCampus: campus,
                educationLevel: profile?.educationLevel || "SMA",
                consent,
                confirmedSteps: isPremium || stepsDone,
              })
            }
          >
            <CheckCircleIcon weight="fill" />
            {register.isPending ? "Mendaftarkan…" : "Daftar Sekarang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
