import {
  ArrowLeftIcon,
  CheckIcon,
  CopyIcon,
  CrownSimpleIcon,
  EnvelopeSimpleIcon,
  GiftIcon,
  LockSimpleIcon,
  PhoneIcon,
  SparkleIcon,
  SpinnerIcon,
  TargetIcon,
  UserIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRouteContext, useRouter } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { getAvatarId, getAvatarSrc } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import { AutocompleteInput } from "@/routes/_auth/-onboarding/autocomplete-input";
import { CAMPUS_SUGGESTIONS, MAJOR_SUGGESTIONS } from "@/routes/_auth/-onboarding/constants";
import { orpc } from "@/utils/orpc";

const AVATAR_IDS = Array.from({ length: 10 }, (_, i) => i + 1);
const AVATAR_TINTS = [
  "from-sr-blue-100 to-sr-blue-200",
  "from-sr-sun-100 to-sr-sun-200",
  "from-sr-orange-100 to-sr-orange-200",
  "from-tertiary-100 to-tertiary-200",
  "from-sr-blue-200 to-sr-blue-300",
];
const SPRING = [0.34, 1.56, 0.64, 1] as const;

type Tab = "data" | "customize";

const TABS: { value: Tab; label: string; icon: typeof UserIcon }[] = [
  { value: "data", label: "Data Diri", icon: UserIcon },
  { value: "customize", label: "Target & Avatar", icon: SparkleIcon },
];

function Panel({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 sm:p-6", className)}>
      <h2 className="mb-4 flex items-center gap-2 text-base font-extrabold text-sr-ink sm:text-lg">
        <span className="flex size-8 items-center justify-center rounded-sr-sm bg-sr-blue-50 text-sr-blue-600">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function FieldLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <Label className="flex items-center gap-1.5 text-sm font-bold text-sr-ink-2">
      <span className="text-sr-muted">{icon}</span>
      {children}
    </Label>
  );
}

function ProfileHero({
  name,
  email,
  avatarId,
  isPremium,
  target,
  completion,
}: {
  name: string;
  email?: string;
  avatarId: number;
  isPremium: boolean;
  target: string;
  completion: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-sr-xl sr-card-blue p-5 sm:p-8">
      <div className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 size-48 rounded-full bg-sr-sun-400/15 blur-2xl" />

      <div className="relative flex items-center gap-4 sm:gap-6">
        <motion.div
          key={avatarId}
          className="relative flex size-20 shrink-0 items-end justify-center overflow-hidden rounded-full bg-linear-to-b from-sr-sun-200 to-sr-sun-400 ring-4 ring-white/30 sm:size-28"
          initial={{ scale: 0.6, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: SPRING }}
        >
          <Image
            src={getAvatarSrc(avatarId)}
            alt="Avatar kamu"
            width={112}
            height={112}
            className="h-[88%] w-auto object-contain"
          />
        </motion.div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-sr-sun-400 sm:text-sm">Profil kamu</p>
          <h1 className="text-xl leading-tight font-extrabold wrap-break-word text-white sm:text-4xl">
            {name || "Pejuang PTN"}
          </h1>
          {email && <p className="text-xs break-all text-white/75 sm:text-sm">{email}</p>}
          {isPremium && (
            <span className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-sr-sun-500 px-2.5 py-0.5 text-[11px] font-bold text-sr-ink">
              <CrownSimpleIcon weight="fill" className="size-3.5" /> Premium
            </span>
          )}
        </div>
      </div>

      {/* Target selebar kartu dan boleh turun baris, supaya nama kampus tidak terpotong di HP. */}
      <div className="relative mt-4 flex items-center gap-3 rounded-sr-md bg-white/10 p-3 ring-1 ring-white/15">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink">
          <TargetIcon weight="fill" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-white/75">Target kamu</p>
          <p className="text-sm leading-snug font-bold text-pretty text-white">{target || "Belum ada target impian"}</p>
        </div>
      </div>

      <div className="relative mt-3 rounded-sr-md bg-white/10 p-3 ring-1 ring-white/15">
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white">
          <span>Kelengkapan profil</span>
          <span className="text-sr-sun-400">{completion}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-sr-sun-400 to-sr-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
          />
        </div>
      </div>
    </div>
  );
}

function TabSwitch({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  return (
    <div className="flex w-full gap-1 rounded-full border border-sr-line bg-white p-1 shadow-sr-1 sm:w-fit">
      {TABS.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          aria-pressed={tab === item.value}
          className={cn(
            "relative flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-colors sm:flex-none",
            tab === item.value ? "text-white" : "text-sr-muted hover:text-sr-ink",
          )}
        >
          {tab === item.value && (
            <motion.span
              layoutId="profile-tab"
              className="absolute inset-0 rounded-full bg-sr-blue-500 shadow-sr-2"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <item.icon weight="bold" className="relative size-4" />
          <span className="relative">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function ReferralCard({
  code,
  count,
  copied,
  isGenerating,
  onAction,
}: {
  code: string | null;
  count: number;
  copied: boolean;
  isGenerating: boolean;
  onAction: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-sr-xl sr-card-sun p-5 sm:p-6">
      <div className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full border-[18px] border-white/30" />
      <div className="relative flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-sr-sm bg-white/60 text-sr-amber-700">
          <GiftIcon weight="fill" className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold text-sr-amber-700">Program referral</p>
          <h2 className="text-base font-extrabold text-sr-ink sm:text-lg">
            Ajak teman, dapat <span className="font-sr-serif italic">cashback 25%</span>
          </h2>
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-2 rounded-sr-md border-2 border-dashed border-sr-amber/50 bg-white/70 p-2 pl-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-sr-muted">Kode referral kamu</p>
          <p
            className={cn(
              "truncate font-black tracking-wider text-sr-ink",
              code ? "text-2xl" : "text-base text-sr-muted",
            )}
          >
            {code ?? "Belum punya kode"}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={onAction}
          disabled={isGenerating}
          whileTap={{ scale: 0.92 }}
          className="flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-sr-sm bg-sr-ink px-4 text-sm font-bold text-white transition-colors hover:bg-sr-ink-2 disabled:opacity-60"
        >
          {isGenerating ? (
            <SpinnerIcon className="size-4 animate-spin" />
          ) : code ? (
            copied ? (
              <>
                <CheckIcon weight="bold" className="size-4" /> Tersalin
              </>
            ) : (
              <>
                <CopyIcon weight="bold" className="size-4" /> Salin
              </>
            )
          ) : (
            "Buat kode"
          )}
        </motion.button>
      </div>

      <div className="relative mt-3 flex items-center gap-2 rounded-sr-md bg-white/50 px-3 py-2.5">
        <UsersThreeIcon weight="fill" className="size-5 text-sr-amber-700" />
        <span className="text-2xl font-black text-sr-ink tabular-nums">{count}</span>
        <span className="text-xs font-semibold text-sr-ink-2">teman terdaftar pakai kodemu</span>
      </div>

      <details className="group relative mt-3 rounded-sr-md bg-white/50 px-3 py-2.5 text-xs text-sr-ink-2">
        <summary className="cursor-pointer list-none font-bold text-sr-ink [&::-webkit-details-marker]:hidden">
          Syarat & ketentuan <span className="inline-block transition-transform group-open:rotate-180">▾</span>
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-4 leading-relaxed">
          <li>Cashback 25% berlaku untuk pembelian paket oleh teman (pengguna baru).</li>
          <li>Saldo akan masuk setelah transaksi teman terverifikasi.</li>
          <li>Habitutor berhak membatalkan reward jika ditemukan indikasi kecurangan.</li>
        </ul>
      </details>
    </section>
  );
}

function AvatarPicker({ selected, onSelect }: { selected: number; onSelect: (id: number) => void }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {AVATAR_IDS.map((id, i) => {
        const isSelected = selected === id;
        return (
          <motion.button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={isSelected}
            aria-label={`Avatar tupai ${id}`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.92 }}
            animate={{ scale: isSelected ? 1.06 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={cn(
              "relative flex aspect-square cursor-pointer items-end justify-center overflow-hidden rounded-sr-md bg-linear-to-b transition-shadow",
              AVATAR_TINTS[i % AVATAR_TINTS.length],
              isSelected ? "shadow-sr-2 ring-4 ring-sr-blue-500" : "ring-1 ring-sr-line hover:ring-sr-blue-200",
            )}
          >
            <Image src={getAvatarSrc(id)} alt="" width={80} height={80} className="h-[85%] w-auto object-contain" />
            <AnimatePresence>
              {isSelected && (
                <motion.span
                  className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-sr-blue-500 text-white shadow-sr-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.25, ease: SPRING }}
                >
                  <CheckIcon weight="bold" className="size-3" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

function SaveBar({
  visible,
  saving,
  onSave,
  onReset,
}: {
  visible: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:bottom-4 sm:px-4 sm:pb-0"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
        >
          <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-sr-lg bg-sr-ink p-3 pl-4 text-white shadow-sr-3">
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-sr-sun-400" />
            <p className="min-w-0 flex-1 text-sm font-semibold">Ada perubahan yang belum disimpan</p>
            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className="hidden cursor-pointer rounded-sr-sm px-3 py-2 text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white sm:block"
            >
              Batal
            </button>
            <Button
              onClick={onSave}
              disabled={saving}
              className="shrink-0 bg-sr-sun-500 text-sr-ink hover:bg-sr-sun-400"
            >
              {saving ? <SpinnerIcon className="size-4 animate-spin" /> : <CheckIcon weight="bold" />}
              Simpan
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ProfilePage() {
  const { session } = useRouteContext({ from: "/_authenticated" });
  const queryClient = useQueryClient();
  const router = useRouter();
  const profileQuery = useQuery(orpc.profile.me.queryOptions());
  const [tab, setTab] = useState<Tab>("data");
  const [formData, setFormData] = useState({
    email: session?.user.email,
    phone: "",
    name: session?.user.name ?? "",
  });
  const [customize, setCustomize] = useState({ kampus: "", jurusan: "" });
  const [selectedAvatar, setSelectedAvatar] = useState(() => getAvatarId(session?.user.image));
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const referralCode = profileQuery.data?.referralCode ?? null;
  const hasReferralCode = Boolean(referralCode);
  const referralCount = profileQuery.data?.referralUsage ?? 0;

  const profileData = profileQuery.data;

  const applyProfile = useCallback((data: NonNullable<typeof profileData>) => {
    setFormData((prev) => ({ ...prev, name: data.name, phone: data.phoneNumber ?? "" }));
    setCustomize({ kampus: data.dreamCampus ?? "", jurusan: data.dreamMajor ?? "" });
    setSelectedAvatar(getAvatarId(data.image));
  }, []);

  // Isi form dari data profil begitu termuat (dan setelah disimpan ulang).
  useEffect(() => {
    if (profileData) applyProfile(profileData);
  }, [profileData, applyProfile]);

  const isDirty = Boolean(
    profileData &&
    (formData.name !== profileData.name ||
      formData.phone !== (profileData.phoneNumber ?? "") ||
      customize.kampus !== (profileData.dreamCampus ?? "") ||
      customize.jurusan !== (profileData.dreamMajor ?? "") ||
      selectedAvatar !== getAvatarId(profileData.image)),
  );

  const completion = Math.round(
    ([formData.name, formData.phone, customize.kampus, customize.jurusan].filter((value) => value.trim()).length / 4) *
      100,
  );

  // Nama di dashboard & header dibaca dari sesi login (cache ["auth","getSession"] + cookie cache better-auth
  // 5 menit), jadi setelah profil disimpan sesi diambil ulang langsung dari server lalu rute dimuat ulang.
  const refreshSession = async () => {
    try {
      const fresh = await authClient.getSession({ query: { disableCookieCache: true } });
      if (fresh.data) queryClient.setQueryData(["auth", "getSession"], fresh);
      await router.invalidate();
    } catch {
      // Gagal menyegarkan sesi tidak menggagalkan penyimpanan; nama ikut berubah saat sesi diperbarui berikutnya.
    }
  };

  const avatarMutation = useMutation(orpc.profile.avatar.update.mutationOptions());
  const profileMutation = useMutation(orpc.profile.update.mutationOptions());
  const generateReferralMutation = useMutation({
    mutationFn: async () => queryClient.fetchQuery(orpc.referral.code.queryOptions()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: orpc.profile.me.key() });
      toast.success("Kode referral berhasil dibuat");
    },
    onError: () => {
      toast.error("Gagal membuat kode referral");
    },
  });

  const handleCopy = () => {
    if (!referralCode) return;

    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleReferralButtonClick = () => {
    if (hasReferralCode) {
      handleCopy();
      return;
    }

    if (generateReferralMutation.isPending) return;
    generateReferralMutation.mutate();
  };

  const handleSave = async () => {
    const nextAvatarId = selectedAvatar;
    const currentAvatarId = getAvatarId(profileData?.image ?? session?.user.image);

    const saveAvatar = async () => {
      if (nextAvatarId === currentAvatarId) {
        return { saved: false, avatarId: null as string | null, avatarSrc: null as string | null };
      }

      try {
        await avatarMutation.mutateAsync({ image: String(nextAvatarId) });
        return {
          saved: true,
          avatarId: String(nextAvatarId),
          avatarSrc: getAvatarSrc(nextAvatarId),
        };
      } catch {
        toast.error("Gagal menyimpan avatar");
        return { saved: false, avatarId: null, avatarSrc: null };
      }
    };

    const saveProfileDetails = async () => {
      try {
        await profileMutation.mutateAsync({
          name: formData.name,
          phoneNumber: formData.phone,
          dreamCampus: customize.kampus,
          dreamMajor: customize.jurusan,
        });
        return true;
      } catch {
        toast.error("Gagal menyimpan data profil");
        return false;
      }
    };

    setIsSaving(true);
    const avatarResult = await saveAvatar();
    const profileSaved = await saveProfileDetails();

    await queryClient.invalidateQueries({ queryKey: orpc.profile.me.key() });
    if (avatarResult.saved || profileSaved) await refreshSession();
    setIsSaving(false);

    if (avatarResult.saved && avatarResult.avatarSrc && avatarResult.avatarId) {
      window.dispatchEvent(
        new CustomEvent("avatarChanged", { detail: { src: avatarResult.avatarSrc, image: avatarResult.avatarId } }),
      );
    }

    if (avatarResult.saved || profileSaved) {
      toast.success("Profil berhasil disimpan");
    }
  };

  const target = [customize.jurusan, customize.kampus].filter(Boolean).join(", ");

  return (
    <main className="relative mx-auto w-full max-w-5xl space-y-5 pt-24 pb-28 sm:space-y-6 sm:pt-28">
      <Link
        to="/dashboard"
        className="group inline-flex items-center gap-2 rounded-full border border-sr-line bg-white px-4 py-2 text-sm font-semibold text-sr-blue-700 shadow-sr-1 transition-all hover:-translate-y-0.5 hover:shadow-sr-2"
      >
        <ArrowLeftIcon weight="bold" className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Kembali ke dashboard
      </Link>

      <ProfileHero
        name={formData.name}
        email={formData.email}
        avatarId={selectedAvatar}
        isPremium={Boolean(session?.user.isPremium)}
        target={target}
        completion={completion}
      />

      <TabSwitch tab={tab} onChange={setTab} />

      <AnimatePresence mode="wait" initial={false}>
        {tab === "data" ? (
          <motion.div
            key="data"
            className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Panel title="Data diri" icon={<UserIcon weight="fill" className="size-4.5" />}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <FieldLabel icon={<EnvelopeSimpleIcon weight="bold" className="size-4" />}>Email</FieldLabel>
                  <div className="relative">
                    <Input
                      type="email"
                      value={formData.email ?? ""}
                      className="h-11 cursor-not-allowed bg-sr-blue-50 pr-10"
                      disabled
                    />
                    <LockSimpleIcon
                      weight="fill"
                      className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-sr-muted"
                    />
                  </div>
                  <p className="text-xs text-sr-muted">Email dipakai untuk masuk, jadi tidak bisa diubah.</p>
                </div>
                <div className="space-y-2">
                  <FieldLabel icon={<UserIcon weight="bold" className="size-4" />}>Nama</FieldLabel>
                  <Input
                    type="text"
                    value={formData.name}
                    placeholder="Nama lengkap"
                    className="h-11"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel icon={<PhoneIcon weight="bold" className="size-4" />}>Nomor Telepon</FieldLabel>
                  <Input
                    type="tel"
                    value={formData.phone}
                    placeholder="Contoh: 081234567890"
                    className="h-11"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </Panel>

            <ReferralCard
              code={referralCode}
              count={referralCount}
              copied={copied}
              isGenerating={generateReferralMutation.isPending}
              onAction={handleReferralButtonClick}
            />
          </motion.div>
        ) : (
          <motion.div
            key="customize"
            className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Panel title="Target impian" icon={<TargetIcon weight="fill" className="size-4.5" />}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <FieldLabel icon={<SparkleIcon weight="bold" className="size-4" />}>Kampus impianmu</FieldLabel>
                  <AutocompleteInput
                    value={customize.kampus}
                    onChange={(kampus) => setCustomize({ ...customize, kampus })}
                    suggestions={CAMPUS_SUGGESTIONS}
                    placeholder="Contoh: Universitas Gadjah Mada"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel icon={<SparkleIcon weight="bold" className="size-4" />}>Jurusan impianmu</FieldLabel>
                  <AutocompleteInput
                    value={customize.jurusan}
                    onChange={(jurusan) => setCustomize({ ...customize, jurusan })}
                    suggestions={MAJOR_SUGGESTIONS}
                    placeholder="Contoh: Kedokteran"
                  />
                </div>
              </div>
            </Panel>

            <Panel title="Pilih avatarmu" icon={<SparkleIcon weight="fill" className="size-4.5" />}>
              <AvatarPicker selected={selectedAvatar} onSelect={setSelectedAvatar} />
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>

      <SaveBar
        visible={isDirty}
        saving={isSaving}
        onSave={handleSave}
        onReset={() => profileData && applyProfile(profileData)}
      />
    </main>
  );
}
