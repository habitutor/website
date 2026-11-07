import {
  ArrowRightIcon,
  CaretRightIcon,
  ChatsCircleIcon,
  DiscordLogoIcon,
  MoonStarsIcon,
  SunHorizonIcon,
  SunIcon,
  TargetIcon,
  WhatsappLogoIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useEffect, useState } from "react";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
import { Button } from "@/components/ui/button";
import { COMMUNITY_LINKS, getPremiumWhatsappLink, shouldShowPremiumWhatsappInvite } from "@/lib/community-links";
import { WELCOME_VIDEO_ENABLED } from "@/lib/feature-flags";
import { FREEMIUM_WHATSAPP_LINKS } from "@/lib/freemium-links";
import { PREMIUM_PLAN_NAME } from "@/lib/premium-packages";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";
import { useProcessReferralCode } from "@/hooks/data/use-process-referral-code";
import { useSyncOnboardingProfile } from "@/hooks/data/use-sync-onboarding-profile";
import { Announcement } from "../-components/announcement";
import { LastClasses } from "../-components/last-classes";
import { LiveClass } from "../-components/live-class";
import { UserProgress } from "../-components/user-progress";
import { PWATutorialDialog } from "./-components/pwa-tutorial-dialog";
import { PremiumWhatsappDialog } from "./-components/premium-whatsapp-dialog";
import { WelcomeVideoDialog } from "./-components/welcome-video-dialog";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: createMeta({
      title: "Dashboard",
      description: "Dashboard belajar Habitutor untuk persiapan SNBT/UTBK.",
      noIndex: true,
    }),
  }),
  component: RouteComponent,
});

// Kalimat penyemangat bergiliran per hari supaya beranda terasa hidup tiap kali dibuka.
const DAILY_BOOSTS = [
  "Sedikit-sedikit tiap hari, lama-lama jadi bukit. Yuk mulai dari 1 materi!",
  "Konsisten kalahkan jenius yang malas. Kamu pasti bisa!",
  "Satu soal hari ini lebih baik dari sepuluh soal yang cuma direncanakan.",
  "Kursi PTN impianmu lagi nungguin. Gas belajar bareng Habitutor!",
  "Capek itu wajar, menyerah jangan. Istirahat sebentar, lalu lanjut lagi ya!",
  "Streak kecil hari ini = skor besar di hari H.",
  "Belajar 3 menit tetap belajar. Yang penting jalan terus!",
];

// Dihitung setelah mount karena zona waktu server (SSR) bisa beda dengan perangkat siswa.
function useGreeting() {
  const [greeting, setGreeting] = useState<{ label: string; icon: typeof SunIcon; boost: string } | null>(null);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const dayIndex = Math.floor(now.getTime() / 86_400_000 - now.getTimezoneOffset() / 1440);
    const boost = DAILY_BOOSTS[dayIndex % DAILY_BOOSTS.length];
    if (hour < 4) setGreeting({ label: "Selamat malam", icon: MoonStarsIcon, boost });
    else if (hour < 11) setGreeting({ label: "Selamat pagi", icon: SunHorizonIcon, boost });
    else if (hour < 15) setGreeting({ label: "Selamat siang", icon: SunIcon, boost });
    else if (hour < 18) setGreeting({ label: "Selamat sore", icon: SunHorizonIcon, boost });
    else setGreeting({ label: "Selamat malam", icon: MoonStarsIcon, boost });
  }, []);

  return greeting;
}

function CommunityLink({
  href,
  icon,
  iconClass,
  title,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  iconClass: string;
  title: string;
  subtitle: string;
}) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      className="group flex min-w-0 items-center gap-3 rounded-sr-md border border-sr-line bg-sr-ivory/60 p-2.5 transition-all duration-300 hover:border-sr-blue-200 hover:bg-sr-blue-50 hover:shadow-sr-1 motion-safe:hover:-translate-y-0.5"
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-sr-sm text-white transition-transform duration-300 ease-sr-spring motion-safe:group-hover:scale-110 ${iconClass}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-sr-ink">{title}</span>
        <span className="block truncate text-xs text-sr-muted">{subtitle}</span>
      </span>
      <CaretRightIcon
        weight="bold"
        className="size-4 shrink-0 text-sr-muted transition-transform group-hover:translate-x-0.5"
      />
    </a>
  );
}

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { data: profile } = useQuery(orpc.profile.me.queryOptions());
  const { data: freemiumStatus } = useQuery(orpc.tryout.freemium.status.queryOptions({ input: {} }));
  // Channel WA: semua yang punya akses (lolos syarat, beli Rp5.000/Rp10.000, premium).
  const showWhatsappChannel =
    Boolean(session?.user.isPremium) ||
    Boolean(
      freemiumStatus &&
      (freemiumStatus.requirementsCompleted ||
        freemiumStatus.hasPackage ||
        freemiumStatus.hasPembahasanPurchase ||
        freemiumStatus.paid),
    );
  // Satu kartu grup WA sesuai akses user; premium didahulukan dari grup Try Out (gratis & Paket 3 Try Out).
  const premiumGroupLink = session?.user.isPremium && profile ? getPremiumWhatsappLink(profile.premiumPlan) : null;
  const hasTryoutGroup = Boolean(freemiumStatus?.hasPackage || freemiumStatus?.requirementsCompleted);
  const whatsappGroup = premiumGroupLink
    ? { href: premiumGroupLink, label: profile?.premiumPlan ? PREMIUM_PLAN_NAME[profile.premiumPlan] : "Premium" }
    : hasTryoutGroup && FREEMIUM_WHATSAPP_LINKS.paketGroup
      ? {
          href: FREEMIUM_WHATSAPP_LINKS.paketGroup,
          label: freemiumStatus?.hasPackage ? "Paket 3 Try Out" : "Try Out Gratis",
        }
      : null;
  useQuery(orpc.dashboard.content.queryOptions());

  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
  const greeting = useGreeting();
  const firstName = session?.user.name.split(" ")[0] ?? "";
  const GreetingIcon = greeting?.icon;
  const dreamText = [profile?.dreamMajor, profile?.dreamCampus].filter(Boolean).join(", ");
  const [pwaDialog, setPwaDialog] = useState(false);
  const showWelcomeVideo = WELCOME_VIDEO_ENABLED && profile ? !profile.hasSeenWelcomeVideo : false;
  const showPremiumWhatsapp =
    shouldShowPremiumWhatsappInvite({ isPremium: session?.user.isPremium, profile }) && !showWelcomeVideo;

  useProcessReferralCode();
  useSyncOnboardingProfile();

  return (
    <>
      <WelcomeVideoDialog open={showWelcomeVideo} />

      <PremiumWhatsappDialog open={showPremiumWhatsapp} plan={profile?.premiumPlan} />

      <PWATutorialDialog open={pwaDialog && !showWelcomeVideo && !showPremiumWhatsapp} onOpenChange={setPwaDialog} />

      <MotionStagger className="relative z-10 flex flex-col gap-10">
        {/* Sapaan, komunitas, dan progres ada di item yang sama, jadi jaraknya diatur di sini agar sama dengan gap-10. */}
        <MotionStaggerItem className="flex flex-col gap-10">
          <section className="space-y-4">
            {/* Hero mengikuti bahasa visual landing: badge pill bergradien, nama berkilau, maskot naik saat halaman dibuka. */}
            <div className="group relative overflow-hidden rounded-sr-xl sr-card-blue p-5 md:p-8">
              <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/10 md:-top-28 md:size-96" />
              <div className="pointer-events-none absolute top-10 right-40 hidden size-14 rounded-full bg-white/10 md:block" />
              <div className="pointer-events-none absolute -bottom-16 left-1/3 size-40 rounded-full bg-sr-sun-400/15 blur-2xl" />

              {/* Di HP maskot berdiri di atas kotak target; mulai md menempel ke dasar kartu. */}
              <div className="relative min-h-36 pr-28 md:static md:min-h-0 md:pr-64 lg:pr-80">
                <span
                  className={`sr-sheen inline-flex items-center gap-2 rounded-full border border-sr-sun-400 bg-linear-to-r from-sr-sun-100 via-white to-sr-blue-50 py-1 pr-3.5 pl-1 text-xs font-semibold text-sr-ink-2 shadow-sr-sun transition-opacity duration-500 md:text-sm ${greeting ? "opacity-100" : "opacity-0"}`}
                >
                  <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink md:size-7">
                    <span className="absolute inset-0 rounded-full bg-sr-sun-400 motion-safe:animate-sr-halo" />
                    {GreetingIcon && <GreetingIcon weight="fill" className="relative size-3.5 md:size-4" />}
                  </span>
                  {greeting?.label ?? "Halo"}
                </span>

                <h1
                  className={`mt-3 leading-tight font-extrabold tracking-tight text-white md:leading-[1.1] ${firstName.length > 10 ? "text-[24px] md:text-4xl lg:text-5xl" : "text-[30px] md:text-5xl"}`}
                  title={firstName}
                >
                  {/* Animasi hero pakai CSS: varian MotionStagger di halaman ini menahan animasi motion anaknya
                      saat masuk dari halaman lain, sehingga maskot & judul tertahan di posisi awal. */}
                  <span className="inline-block motion-safe:animate-[sr-rise_0.5s_var(--ease-sr)_0.1s_backwards]">
                    Halo,
                  </span>{" "}
                  <span className="relative inline-block max-w-full truncate align-bottom motion-safe:animate-[sr-rise_0.5s_var(--ease-sr)_0.2s_backwards]">
                    <span className="relative z-1 animate-sr-sheen bg-[linear-gradient(100deg,#ffc83d_0%,#ffe7a1_35%,#fffcf5_45%,#ffe7a1_55%,#ffc83d_100%)] bg-size-[250%_100%] bg-clip-text pb-1 text-transparent">
                      {firstName}!
                    </span>
                    <span
                      aria-hidden
                      className="absolute -bottom-0.5 left-0 h-2.5 w-full origin-left rounded-full bg-white/20 motion-safe:animate-[sr-underline_0.6s_var(--ease-sr)_0.5s_backwards] md:-bottom-1 md:h-4"
                    />
                  </span>
                </h1>

                <p
                  className={`mt-3 max-w-2xl text-[13px] leading-relaxed text-white/85 transition-opacity duration-500 md:text-base ${greeting ? "opacity-100" : "opacity-0"}`}
                >
                  <span className="font-sr-serif font-semibold text-sr-sun-400 italic">Kata hari ini: </span>
                  {greeting?.boost ?? " "}
                </p>

                <img
                  src="/avatar/testimone-avatar.webp"
                  alt=""
                  className="pointer-events-none absolute right-0 bottom-0 h-32 w-auto origin-bottom object-contain transition-transform duration-700 ease-sr-spring select-none motion-safe:animate-[sr-rise_0.8s_var(--ease-sr-spring)_0.15s_backwards] motion-safe:group-hover:scale-105 motion-safe:group-hover:-rotate-3 md:right-12 md:h-60"
                />
              </div>

              <div className="relative flex items-center gap-3 rounded-sr-md bg-white/12 p-3 ring-1 ring-white/15 md:mt-6 md:w-fit md:max-w-2xl md:px-4 md:py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink shadow-sr-sun">
                  <TargetIcon weight="fill" className="size-5" />
                </span>
                <div className="min-w-0 md:flex md:items-baseline md:gap-2">
                  <p className="text-xs font-medium text-white/75 md:shrink-0 md:text-sm">Target kamu:</p>
                  <p className="text-sm leading-snug font-extrabold text-white md:text-base">
                    {dreamText || "Isi jurusan & kampus impianmu di profil"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 overflow-hidden rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 xl:flex-row xl:items-center xl:gap-8 xl:px-6">
              <div className="flex items-center gap-3 xl:w-72 xl:shrink-0">
                <span className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-sr-blue-50 text-sr-blue-600 sm:flex">
                  <ChatsCircleIcon weight="fill" className="size-6" />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-sr-ink">Komunitas belajar</h2>
                  <p className="text-sm text-sr-muted">Tanya soal, cari teman belajar, dan dapat info terbaru.</p>
                </div>
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
                {whatsappGroup && (
                  <CommunityLink
                    href={whatsappGroup.href}
                    icon={<WhatsappLogoIcon weight="fill" className="size-5" />}
                    iconClass="bg-whatsapp"
                    title="Grup WhatsApp"
                    subtitle={whatsappGroup.label}
                  />
                )}
                {showWhatsappChannel && FREEMIUM_WHATSAPP_LINKS.channel && (
                  <CommunityLink
                    href={FREEMIUM_WHATSAPP_LINKS.channel}
                    icon={<WhatsappLogoIcon weight="fill" className="size-5" />}
                    iconClass="bg-whatsapp"
                    title="Channel WhatsApp"
                    subtitle="Info & update terbaru"
                  />
                )}
                <CommunityLink
                  href={COMMUNITY_LINKS.discord}
                  icon={<DiscordLogoIcon weight="fill" className="size-5" />}
                  iconClass="bg-discord"
                  title="Discord Habitutor"
                  subtitle="Diskusi bareng pejuang PTN"
                />
              </div>
            </div>
          </section>

          {session?.user.isPremium && showPremiumBanner ? (
            <div className="flex flex-col gap-10">
              <div className="sr-sheen relative flex w-full flex-row items-end justify-between overflow-hidden rounded-sr-lg sr-card-sun p-4 md:p-6">
                <button
                  type="button"
                  onClick={() => setShowPremiumBanner(false)}
                  className="absolute top-0 right-0 z-10 hidden cursor-pointer p-2 text-sr-amber-700 md:block"
                  aria-label="Close banner"
                >
                  <XIcon weight="bold" size={20} />
                </button>
                <div className="z-10">
                  <h5 className="font-bold md:text-2xl">Pindahkan ke Layar Utamamu!</h5>
                  <p className="text-[10px] md:text-base">Gunakan di Mobile. Akses kapanpun</p>
                </div>
                <Button variant="darkBlue" size="icon" className="z-10" onClick={() => setPwaDialog(true)}>
                  <ArrowRightIcon weight="bold" />
                </Button>
                <div className="absolute right-0 bottom-0 h-8 w-20 bg-white/30 md:h-18 md:w-60" />
                <Image
                  src="/avatar/tutorial-avatar.webp"
                  alt=""
                  width={75}
                  height={75}
                  className="absolute right-10 -bottom-18 hidden h-auto w-55 object-contain md:block"
                />
              </div>
              <MotionStaggerItem>
                <UserProgress />
              </MotionStaggerItem>
            </div>
          ) : (
            <UserProgress />
          )}
        </MotionStaggerItem>
        <MotionStaggerItem>
          <Announcement />
        </MotionStaggerItem>
        <MotionStaggerItem>
          <LiveClass />
        </MotionStaggerItem>
        <MotionStaggerItem>
          <LastClasses />
        </MotionStaggerItem>
      </MotionStagger>
    </>
  );
}
