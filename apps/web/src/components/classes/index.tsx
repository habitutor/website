import { ArrowRightIcon, LockIcon, LockKeyIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { isSubtestPremium } from "@habitutor/shared";
import { BackButton } from "@/components/navigation/back-button";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/utils/is-admin";
import { orpc } from "@/utils/orpc";
import type { BodyOutputs } from "@/utils/orpc";

export function SubtestHeader() {
  const isAdmin = useIsAdmin();

  const title = isAdmin ? "Hi Min, ini Subtest-Subtest UTBK" : "Kelas-Kelas UTBK";

  const description = isAdmin
    ? "Pilih subtest-subtest UTBK yang ingin diubah, dihapus, atau ditambahkan"
    : "Yuk belajar bersama untuk sukses dalam UTBK!";

  return (
    <div className="relative overflow-hidden rounded-[10px] bg-tertiary-200">
      <div className="grid grid-cols-1 gap-6 px-6 pt-8 pb-0 sm:grid-cols-2 sm:items-center sm:px-10 sm:py-10">
        {/* TEXT — mobile top, desktop LEFT */}
        <div className="relative z-10 max-w-xl">
          <h1 className="text-[24px] leading-tight font-bold text-neutral-1000 sm:text-[30px]">{title}</h1>
          <p className="mt-2 text-[14px] leading-5.25 text-neutral-1000">{description}</p>
        </div>

        {/* VISUAL */}
        <div className="relative -mx-6 h-27.5 overflow-hidden sm:mx-0 sm:h-auto sm:overflow-visible">
          {/* Ellipse */}
          <div className="absolute top-10 right-4 bottom-0 size-45 rounded-full bg-tertiary-400 sm:top-2" />

          {/* Avatar */}
          <Image
            src="/avatar/subtest-header-avatar.webp"
            alt="Subtest Header Avatar"
            width={260}
            height={260}
            className="absolute right-0 size-52.5 -translate-y-10 object-cover select-none sm:bottom-0 sm:translate-y-1/2"
          />
        </div>
      </div>
    </div>
  );
}

const subtestCardBackground = {
  pu: "bg-secondary-400",
  ppu: "bg-tertiary-400",
  pbm: "bg-fourtiary-300 *:text-white",
  pk: "bg-primary-200 *:text-white",
  lbi: "bg-secondary-400",
  lbing: "bg-tertiary-400",
  pm: "bg-fourtiary-300 *:text-white",
} as const;

const subtestCardPattern = {
  pu: "bg-secondary-600",
  ppu: "bg-tertiary-200",
  pbm: "bg-fourtiary-200",
  pk: "bg-primary-100",
  lbi: "bg-secondary-600",
  lbing: "bg-tertiary-200",
  pm: "bg-fourtiary-200",
} as const;

const subtestCardAvatar = {
  pu: "/avatar/subtest-pu-avatar.webp",
  ppu: "/avatar/subtest-ppu-avatar.webp",
  pbm: "/avatar/subtest-pbm-avatar.webp",
  pk: "/avatar/subtest-pk-avatar.webp",
  lbi: "/avatar/subtest-lbi-avatar.webp",
  lbing: "/avatar/subtest-lbing-avatar.webp",
  pm: "/avatar/subtest-pm-avatar.webp",
} as const;

type SubtestListItem = NonNullable<BodyOutputs["subtest"]["list"]>["data"][number];

export function SubtestCard({
  subtest,
  userIsPremium,
  userRole,
}: {
  subtest: SubtestListItem;
  userIsPremium?: boolean;
  userRole?: string;
}) {
  const isAdmin = useIsAdmin();
  const shortName = subtest?.shortName?.toLowerCase() as keyof typeof subtestCardBackground;
  const backgroundClass = subtestCardBackground[shortName] || "bg-secondary-400";
  const patternClass = subtestCardPattern[shortName] || "bg-secondary-600";
  const avatarSrc = subtestCardAvatar[shortName] || "/avatar/subtest-pu-avatar.webp";
  // Use subtest.order to determine if premium (order > 1 means premium)
  const isPremiumSubtest = isSubtestPremium(subtest?.order ?? 1, userRole, userIsPremium);
  const isLocked = !isAdmin && isPremiumSubtest;

  return (
    <Card
      className={cn(
        backgroundClass,
        "relative min-h-40 overflow-hidden border-0 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
      )}
    >
      {/* Lock overlay for premium content */}
      {isLocked && (
        <>
          {/* Dark overlay */}
          <div className="absolute inset-0 z-5 bg-black/40" />
          {/* Lock badge */}
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
              <LockKeyIcon size={16} className="text-white" weight="fill" />
              <span className="text-xs font-semibold text-white">Premium dulu yuk!</span>
            </div>
          </div>
        </>
      )}

      {/* Pattern element */}
      <div className={cn(patternClass, "absolute right-0 bottom-0 aspect-square h-[70%] w-auto")} />

      {/* Avatar image */}
      <div className="absolute right-13 bottom-0 aspect-square h-[170%] w-auto translate-x-1/2 translate-y-1/4">
        <Image
          src={avatarSrc}
          alt={`${subtest?.name} Avatar`}
          width={356}
          height={356}
          className="pointer-events-none object-cover object-[50%_50%] select-none"
        />
      </div>
      <div className="flex h-full justify-between">
        <div className="mt-auto mb-0 w-1/2">
          <h3 className="font-semibold text-pretty">{subtest?.name}</h3>
          <p className="text-sm font-light"> {subtest?.totalContent} Konten</p>
        </div>

        {isLocked ? (
          // Disabled button for locked subtests
          <div
            className={cn(
              buttonVariants({ variant: "lightBlue", size: "icon" }),
              "z-10 mt-auto mb-0 cursor-not-allowed opacity-50",
            )}
          >
            <LockIcon size={18} weight="bold" />
          </div>
        ) : (
          <Link
            to={isAdmin ? "/admin/classes/$shortName" : "/classes/$shortName"}
            params={{ shortName: subtest?.shortName?.toLowerCase() }}
            className={cn(buttonVariants({ variant: "lightBlue", size: "icon" }), "z-10 mt-auto mb-0")}
          >
            {isAdmin ? <PencilSimpleIcon size={18} weight="bold" /> : <ArrowRightIcon size={18} weight="bold" />}
          </Link>
        )}
      </div>
    </Card>
  );
}

export function ClassHeader({ shortName }: { shortName: string }) {
  const isAdmin = useIsAdmin();
  const { data: subtestData, isPending } = useQuery(
    orpc.subtest.byShortName.queryOptions({
      input: { shortName },
    }),
  );
  const subtest = subtestData?.subtest;
  const normalizedShortName = subtest?.shortName?.toLowerCase() as keyof typeof subtestCardBackground;
  const backgroundClass = subtestCardBackground[normalizedShortName] || "bg-secondary-400";
  const patternClass = subtestCardPattern[normalizedShortName] || "bg-secondary-600";
  const avatarSrc = subtestCardAvatar[normalizedShortName] || "/avatar/subtest-pu-avatar.webp";

  const forceTextWhite = backgroundClass.includes("text-white");

  return (
    <div className={cn(backgroundClass, "relative overflow-hidden rounded-[10px]")}>
      {/* Back button */}
      <div className="z-10 mt-6 ml-6 sm:mt-10 sm:ml-10">
        <BackButton to={isAdmin ? "/admin/classes" : "/classes"} />
      </div>

      <div className="grid grid-cols-1 px-6 pt-4 pb-0 sm:grid-cols-2 sm:items-center sm:px-10 sm:pb-10 md:grid-cols-5">
        {/* TEXT — mobile top, desktop LEFT */}
        <div className={cn("relative z-10 max-w-xl md:col-span-3", forceTextWhite && "text-white")}>
          {isPending ? (
            <>
              <Skeleton className={cn("mb-2 h-8 w-3/4", forceTextWhite && "bg-white/20")} />
              <Skeleton className={cn("h-4 w-full", forceTextWhite && "bg-white/20")} />
            </>
          ) : (
            <>
              <h1
                className={cn(
                  "text-[24px] leading-tight font-bold sm:text-[30px]",
                  forceTextWhite ? "text-white" : "text-neutral-1000",
                )}
              >
                {subtest?.name}
              </h1>
              <p
                className={cn("mt-2 text-[14px] leading-5.25", forceTextWhite ? "text-white/90" : "text-neutral-1000")}
              >
                {subtest?.description}
              </p>
            </>
          )}
        </div>

        {/* VISUAL */}
        <div className="relative -mx-6 h-32.5 overflow-hidden sm:mx-0 sm:h-auto sm:overflow-visible md:col-span-2">
          {/* Ellipse */}
          <div className={cn(patternClass, "absolute top-15 right-4 bottom-0 size-45 rounded-full sm:top-2")} />

          {/* Avatar */}
          <Image
            src={avatarSrc}
            alt={`${subtest?.name} Avatar`}
            width={260}
            height={260}
            className="absolute right-0 size-70 translate-x-1/8 -translate-y-15 object-cover select-none sm:bottom-0 sm:left-0 sm:size-90 sm:translate-x-1/6 sm:translate-y-[55%] sm:object-cover"
          />
        </div>
      </div>
    </div>
  );
}
export { ContentFilters, LastContentViewedCard, ContentList } from "./content";
export { PracticeQuestionHeader, AnswerCollapsible, PracticeQuestion, LiveClassCard } from "./practice";
