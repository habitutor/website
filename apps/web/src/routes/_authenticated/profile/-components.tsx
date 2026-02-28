import { useState, useEffect } from "react";
import { ArrowLeftIcon, CheckIcon, Copy } from "lucide-react";
import { motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MotionPulse } from "@/components/motion";
import { Image } from "@unpic/react";
import { cn } from "@/lib/utils";
import { getAvatarId, getAvatarSrc } from "@/lib/avatar";
import { orpc } from "@/utils/orpc";

const AVATAR = [
  {
    id: 1,
    src: "/avatar/profile/tupai-1.webp",
    label: "tupai-1",
    className: "bg-primary-100 border-primary-200",
    imageClassName: " w-[90px] h-21",
  },
  {
    id: 2,
    src: "/avatar/profile/tupai-2.webp",
    label: "tupai-2",
    className: "bg-secondary-300 border-secondary-700",
    imageClassName: "w-[81px] h-[71px]",
  },
  {
    id: 3,
    src: "/avatar/profile/tupai-3.webp",
    label: "tupai-3",
    className: "bg-tertiary-300 border-tertiary-500",
  },
  {
    id: 4,
    src: "/avatar/profile/tupai-4.webp",
    label: "tupai-4",
    className: "bg-red-100 border-red-200",
  },
  {
    id: 5,
    src: "/avatar/profile/tupai-5.webp",
    label: "tupai-5",
    className: "bg-primary-300 border-primary-500",
  },
  {
    id: 6,
    src: "/avatar/profile/tupai-6.webp",
    label: "tupai-6",
    className: "bg-secondary-300 border-secondary-700",
  },
  {
    id: 7,
    src: "/avatar/profile/tupai-7.webp",
    label: "tupai-7",
    className: "bg-red-100 border-red-200",
  },
  {
    id: 8,
    src: "/avatar/profile/tupai-8.webp",
    label: "tupai-8",
    className: "bg-primary-300 border-primary-500",
  },
  {
    id: 9,
    src: "/avatar/profile/tupai-9.webp",
    label: "tupai-9",
    className: "bg-tertiary-100 border-tertiary-200",
  },
  {
    id: 10,
    src: "/avatar/profile/tupai-10.webp",
    label: "tupai-10",
    className: "bg-tertiary-300 border-tertiary-500",
  },
];

function AvatarItem({
  avatar,
  selected,
  onSelect,
}: {
  avatar: (typeof AVATAR)[0];
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(avatar.id)}
      className={cn(
        "relative flex cursor-pointer aspect-square w-21 h-21 items-end justify-center rounded-lg border-2 transition-all",
        avatar.className,
      )}
    >
      <Image
        src={avatar.src}
        alt={avatar.label}
        width={80}
        height={80}
        className={cn(avatar.imageClassName, "")}
      />

      <div
        className={`absolute left-1 top-1 flex size-5 items-center justify-center rounded-full border-2 text-white ${selected ? "bg-fourtiary-200 border-fourtiary-300" : "bg-transparent border-primary-background"}`}
      >
        {selected && <CheckIcon className="size-3" />}
      </div>
    </button>
  );
}

function SaveRow({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex shrink-0 flex-col gap-4 sticky md:pt-6 border-t">
      <div className="flex justify-end">
        <Button onClick={onSave} className="w-full md:w-fit">
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { session } = useRouteContext({ from: "/_authenticated" });
  const queryClient = useQueryClient();
  const profileQuery = useQuery(orpc.profile.get.queryOptions());
  const [tab, setTab] = useState<"data" | "customize">("data");
  const [formData, setFormData] = useState({
    email: session?.user.email,
    phone: "",
    name: session?.user.name ?? "",
  });
  const [customize, setCustomize] = useState({ kampus: "", jurusan: "" });
  const [selectedAvatar, setSelectedAvatar] = useState(() =>
    getAvatarId(session?.user.image),
  );
  const [copied, setCopied] = useState(false);
  const referralCode = profileQuery.data?.referralCode ?? "N/A";
  const referralCount = profileQuery.data?.referralUsage ?? 0;

  // Sync phone from API once loaded
  const profileData = profileQuery.data;
  useEffect(() => {
    if (profileData) {
      setFormData((prev) => ({
        ...prev,
        phone: profileData.phoneNumber ?? "",
      }));
      setCustomize((prev) => ({
        ...prev,
        kampus: profileData.dreamCampus ?? "",
        jurusan: profileData.dreamMajor ?? "",
      }));
    }
  }, [profileData]);

  const avatarMutation = useMutation(
    orpc.profile.updateAvatar.mutationOptions(),
  );
  const profileMutation = useMutation(orpc.profile.update.mutationOptions());

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSave = async () => {
    const avatarId = String(selectedAvatar);
    const src = getAvatarSrc(avatarId);

    try {
      // Simpan avatar (hanya ID)
      await avatarMutation.mutateAsync({ image: avatarId });
    } catch (err) {
      console.error("Avatar save error:", err);
      toast.error("Gagal menyimpan avatar");
      return;
    }

    try {
      // Simpan data profil (nama, telepon, kampus, jurusan)
      await profileMutation.mutateAsync({
        name: formData.name,
        phoneNumber: formData.phone,
        dreamCampus: customize.kampus,
        dreamMajor: customize.jurusan,
      });
    } catch (err) {
      console.error("Profile save error:", err);
      toast.error("Gagal menyimpan data profil");
      return;
    }

    // Refresh data
    queryClient.invalidateQueries({ queryKey: orpc.profile.get.key() });

    // Beritahu header via custom event
    window.dispatchEvent(new CustomEvent("avatarChanged", { detail: { src } }));

    toast.success("Profil berhasil disimpan");
  };

  return (
    <main>
      {/* Background dan dekorasi */}
      <div className="relative pt-20 flex w-full justify-center items-start md:overflow-y-hidden bg-background">
        {/* Dekorasi bulatan */}
        <MotionPulse>
          <motion.div
            className="pointer-events-none fixed left-5.5 top-101.5 z-0 hidden size-20 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.3 }}
          />
        </MotionPulse>
        <MotionPulse>
          <motion.div
            className="pointer-events-none fixed right-0 top-135.5 z-0 hidden size-78.5 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.3 }}
          />
        </MotionPulse>
        <MotionPulse>
          <motion.div
            className="pointer-events-none fixed -right-10.5 top-109 z-0 hidden size-32 rounded-full border-2 border-tertiary-200 bg-tertiary-100 md:block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.3 }}
          />
        </MotionPulse>

        {/* kartu */}
        <main className="relative z-2 w-full space-y-6 md:h-[calc(100vh-80px)] items-center border-x border-neutral-300 bg-white shadow-sm animate-in fade-in slide-in-from-bottom-6 py-10">
          {/* Tombol kembali */}
          <div className="hidden w-full px-12 md:block">
            <Button className="h-8 rounded-md bg-primary-300 px-4 text-xs font-semibold text-white hover:bg-primary-400">
              <ArrowLeftIcon className="size-4" />
              Kembali
            </Button>
          </div>

          {/* Hero banner */}
          <div className="relative w-full shrink-0 px-12 max-md:px-4">
            <div className="relative h-29.25 w-full overflow-visible rounded-[10px] border-2 border-tertiary-200 bg-tertiary-100 max-md:h-35">
              {/* Bulatan biru dalam banner */}
              <div className="pointer-events-none absolute right-0 top-0 h-full w-70 overflow-hidden rounded-br-[10px] rounded-tr-[10px] max-md:bottom-0 max-md:top-auto max-md:h-46.25 max-md:w-45.75">
                <div className="absolute -right-10.25 -top-11.75 size-77.5 rounded-full border-2 border-tertiary-400 bg-tertiary-300 max-md:-bottom-23 max-md:-right-13 max-md:top-auto max-md:size-45.75" />
              </div>

              {/* Teks */}
              <div className="p-4 md:py-5 md:px-6 ">
                <h1 className="m-0 text-[28px] md:text-[34px] font-normal leading-[1.2] text-primary-300">
                  Halo, <span className="font-bold">{session?.user.name}!</span>
                </h1>
                <p className="m-0 text-[12px] text-primary-300 md:w-full w-2/3">
                  Lengkapi informasi profilmu di bawah ini
                </p>
              </div>

              {/* Gambar tupai — key berubah tiap ganti avatar → re-mount → animasi ulang */}
              <div
                key={selectedAvatar}
                className="pointer-events-none absolute bottom-0 right-6 z-30 h-51.25 w-55.5 animate-in fade-in slide-in-from-bottom-6 max-md:right-2 max-md:h-26.5 max-md:w-28.75"
              >
                <Image
                  src={`/avatar/profile/tupai-${selectedAvatar}.webp`}
                  alt="Maskot"
                  layout="fullWidth"
                  className="h-full w-full object-contain object-bottom"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Konten */}
          <div className="relative flex w-full flex-1 flex-col gap-5 px-12 max-md:mt-6 max-md:gap-4 max-md:px-4">
            {/* Tabs */}
            <div className="flex shrink-0 gap-3">
              <Button
                variant={tab === "data" ? "default" : "outline"}
                onClick={() => setTab("data")}
              >
                Data Dirimu
              </Button>
              <Button
                variant={tab === "customize" ? "default" : "outline"}
                onClick={() => setTab("customize")}
              >
                Customize
              </Button>
            </div>

            {/* TAB: Data Diri */}
            {tab === "data" && (
              <div className="flex flex-col items-start gap-6 md:flex-row">
                {/* Kiri: form fields */}
                <div className="flex w-[48%] flex-col gap-3 max-md:w-full">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      className="cursor-not-allowed bg-muted"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomor Telepon</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      placeholder="Nomor Telepon"
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      placeholder="Nama"
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Kanan: affiliate */}
                <div className="flex flex-col gap-2 max-md:w-full">
                  <div className="text-xs font-medium">
                    Ajak Teman, Dapat <strong>Cashback 25%</strong>
                  </div>
                  <div className="flex h-23.5 items-stretch overflow-hidden rounded-lg border-2 border-secondary-600 bg-secondary-400">
                    <div className="flex flex-1 flex-col justify-center gap-1 pl-4">
                      <span className="text-[10px] font-medium">
                        Kode Affiliatemu
                      </span>
                      <span className="text-[28px] font-bold leading-10.5">
                        {referralCode}
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex w-18 cursor-pointer shrink-0 items-center justify-center border-l-2 border-secondary-700 bg-secondary-600"
                    >
                      {copied ? (
                        <CheckIcon className="size-5" />
                      ) : (
                        <Copy className="size-5" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-3 max-md:flex-col">
                    {/* Referral Terdaftar */}
                    <div className="flex w-27.5 shrink-0 items-center justify-center gap-1.5 rounded-lg border-2 border-tertiary-100 bg-background px-3 py-3.5 max-md:w-full max-md:justify-start">
                      <span className="text-[20px] font-bold ">
                        {referralCount}
                      </span>
                      <span className="whitespace-nowrap text-[9px] font-medium">
                        Referral
                        <br />
                        Terdaftar
                      </span>
                    </div>
                    {/* Terms and Conditions */}
                    <div className="flex flex-1 flex-col gap-1 rounded-[10px] border border-background bg-white px-3.5 py-3">
                      <span className="text-[10px] font-bold">
                        Terms and Conditions
                      </span>
                      <ul className="m-0 list-disc pl-3.5 text-[10px] leading-3.75">
                        <li>
                          Cashback 25% berlaku untuk pembelian paket oleh teman
                          (pengguna baru).
                        </li>
                        <li>
                          Saldo akan masuk setelah transaksi teman
                          terverifikasi.
                        </li>
                        <li>
                          Habitutor berhak membatalkan reward jika ditemukan
                          indikasi kecurangan.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Customize */}
            {tab === "customize" && (
              <div className="flex w-full md:flex-row items-start gap-8 flex-col-reverse">
                {/* Kiri: fields */}
                <div className="flex flex-1 shrink-0 flex-col gap-4 w-full">
                  <div className="space-y-2">
                    <Label>Pilih Kampus Impianmu</Label>
                    <Input
                      type="text"
                      value={customize.kampus}
                      placeholder="Kampus"
                      onChange={(e) =>
                        setCustomize({ ...customize, kampus: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pilih Jurusan Impianmu</Label>
                    <Input
                      type="text"
                      value={customize.jurusan}
                      placeholder="Jurusan"
                      onChange={(e) =>
                        setCustomize({
                          ...customize,
                          jurusan: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Kanan: avatar grid — fixed width agar tetap square */}
                <div className="flex w-full shrink-0 flex-col gap-2.5 overflow-hidden md:w-117.5">
                  <h2 className="text-xs font-semibold">Pilih Avatarmu</h2>
                  <div className="flex w-full flex-row gap-2.5 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:pb-0 md:overflow-x-visible">
                    {AVATAR.map((av) => (
                      <AvatarItem
                        key={av.id}
                        avatar={av}
                        selected={selectedAvatar === av.id}
                        onSelect={setSelectedAvatar}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Changes */}
          <div className="w-full self-stretch px-12 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:z-50 max-md:bg-white max-md:px-4 max-md:py-4 max-md:shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
            <SaveRow onSave={handleSave} />
          </div>
        </main>
      </div>
    </main>
  );
}
