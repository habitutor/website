import { ArrowCircleRightIcon, ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
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
  // Satu kartu grup WA sesuai akses user; premium didahulukan dari grup TryOut (gratis & Paket 3 TryOut).
  const premiumGroupLink = session?.user.isPremium && profile ? getPremiumWhatsappLink(profile.premiumPlan) : null;
  const hasTryoutGroup = Boolean(freemiumStatus?.hasPackage || freemiumStatus?.requirementsCompleted);
  const whatsappGroup = premiumGroupLink
    ? { href: premiumGroupLink, label: profile?.premiumPlan ? PREMIUM_PLAN_NAME[profile.premiumPlan] : "Premium" }
    : hasTryoutGroup && FREEMIUM_WHATSAPP_LINKS.paketGroup
      ? {
          href: FREEMIUM_WHATSAPP_LINKS.paketGroup,
          label: freemiumStatus?.hasPackage ? "Paket 3 TryOut" : "TryOut Gratis",
        }
      : null;
  useQuery(orpc.dashboard.content.queryOptions());

  const [showPremiumBanner, setShowPremiumBanner] = useState(true);
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

      <MotionStagger className="relative z-10 flex flex-col gap-6">
        <MotionStaggerItem>
          <section className="flex w-full items-center justify-between gap-0 max-sm:flex-col-reverse max-sm:items-start">
            <div className="flex items-center gap-2">
              <img src="/avatar/profile/tupai-1.webp" alt="Tupai" className="h-auto w-40 object-cover" />
              <div className="space-y-1 text-primary">
                <h1 className="text-4xl">
                  Halo, <strong>{session?.user.name.split(" ")[0]}!</strong>
                </h1>
                <p className="">
                  <strong>{dreamText || "Dream major, dream campus"}</strong> menunggumu!
                </p>
              </div>
            </div>

            <div className="fixed right-4 bottom-10 z-20 grid w-56 max-w-[calc(100vw-2rem)] grid-cols-1 gap-2 md:static md:w-auto md:max-w-none [&>a]:flex [&>a]:items-center [&>a]:justify-between [&>a]:gap-3 [&>a]:rounded-lg [&>a]:p-4 [&>a]:text-white [&>a]:transition-colors">
              {whatsappGroup && (
                <a
                  href={whatsappGroup.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="group relative overflow-clip bg-whatsapp hover:bg-whatsapp/80"
                >
                  <div className="z-10 min-w-0">
                    <p className="truncate text-xs font-semibold text-white/80">{whatsappGroup.label}</p>
                    <p className="font-bold">Join WhatsApp</p>
                  </div>
                  <ArrowCircleRightIcon size={24} className="z-10 shrink-0" />
                  <Image
                    src="/icons/whatsapp.svg"
                    width={70}
                    height={70}
                    className="absolute right-0 -bottom-[40%] opacity-100 transition-transform group-hover:-translate-y-1"
                  />
                </a>
              )}
              <a
                href={COMMUNITY_LINKS.discord}
                rel="noopener noreferrer"
                target="_blank"
                className="group relative overflow-clip bg-discord hover:bg-discord/80"
              >
                <p className="z-10 min-w-0 font-bold">Join Discord</p>
                <ArrowCircleRightIcon size={24} className="z-10 shrink-0" />
                <Image
                  src="/icons/discord.svg"
                  width={70}
                  height={70}
                  className="absolute right-0 -bottom-[40%] opacity-100 transition-transform group-hover:-translate-y-1"
                />
              </a>
              {showWhatsappChannel && FREEMIUM_WHATSAPP_LINKS.channel && (
                <a
                  href={FREEMIUM_WHATSAPP_LINKS.channel}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="group relative overflow-clip bg-whatsapp hover:bg-whatsapp/80"
                >
                  <p className="z-10 min-w-0 font-bold">Ikuti Channel WhatsApp</p>
                  <ArrowCircleRightIcon size={24} className="z-10 shrink-0" />
                </a>
              )}
            </div>
          </section>

          {session?.user.isPremium && showPremiumBanner ? (
            <div className="mb-6 flex flex-col gap-6">
              <div className="relative flex w-full flex-row items-end justify-between overflow-hidden bg-secondary-400 p-4 md:p-6">
                <button
                  type="button"
                  onClick={() => setShowPremiumBanner(false)}
                  className="absolute top-0 right-0 z-10 hidden cursor-pointer p-2 text-secondary-1000 md:block"
                  aria-label="Close banner"
                >
                  <XIcon weight="bold" size={20} />
                </button>
                <div className="z-10">
                  <h5 className="font-bold md:text-2xl">Pindahkan ke Layar Utamamu!</h5>
                  <p className="text-[10px] md:text-base">Gunakan di Mobile. Akses kapanpun</p>
                </div>
                <Button
                  variant="default"
                  size="icon"
                  className="z-10 bg-secondary-1000 hover:bg-secondary-900"
                  onClick={() => setPwaDialog(true)}
                >
                  <ArrowRightIcon weight="bold" />
                </Button>
                <div className="absolute right-0 bottom-0 h-8 w-20 bg-secondary-600 md:h-18 md:w-60" />
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

      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-0">
        <img src="/dashboard-background.webp" alt="" className="block h-auto w-full" />
      </div>
    </>
  );
}
