import { ArrowRightIcon, BooksIcon, CrownIcon, LockIcon, PencilSimpleIcon, SparkleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { isSubtestPremium } from "@habitutor/shared/content-access";
import { BackButton } from "@/components/navigation/back-button";
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
    : "Semua subtes SNBT tersusun rapi per BAB. Pilih satu, tonton videonya, lalu taklukkan latihan soalnya!";

  return (
    <div className="relative overflow-hidden rounded-sr-xl sr-card-blue">
      <div className="pointer-events-none absolute -right-16 -bottom-24 size-72 animate-sr-drift rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -top-10 left-1/2 size-24 rounded-full bg-white/10" />
      <div className="relative flex items-end justify-between gap-4 px-6 pt-7 sm:items-center sm:px-10 sm:py-10">
        <div className="relative z-10 max-w-xl pb-7 sm:pb-0">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
            <SparkleIcon weight="fill" className="size-4 text-sr-sun-400" /> Belajar sedikit, konsisten tiap hari
          </span>
          <h1 className="text-[26px] leading-tight font-extrabold text-white sm:text-[34px]">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-base">{description}</p>
        </div>
        <Image
          src="/avatar/subtest-header-avatar.webp"
          alt=""
          width={240}
          height={240}
          className="pointer-events-none relative h-auto w-28 shrink-0 object-contain select-none sm:w-52"
        />
      </div>
    </div>
  );
}

// Warna kartu bergiliran biru, kuning, oranye supaya grid subtes tetap ceria tapi satu bahasa visual.
const TINTS = {
  blue: { art: "from-sr-blue-100 to-sr-blue-200", chip: "bg-sr-blue-50 text-sr-blue-700" },
  sun: { art: "from-sr-sun-100 to-sr-sun-200", chip: "bg-sr-sun-100 text-sr-amber-700" },
  orange: { art: "from-sr-orange-100 to-sr-orange-200", chip: "bg-sr-orange-100 text-sr-orange-700" },
} as const;

const subtestTint: Record<string, keyof typeof TINTS> = {
  pu: "sun",
  ppu: "blue",
  pbm: "orange",
  pk: "blue",
  lbi: "sun",
  lbing: "blue",
  pm: "orange",
  hab: "blue",
  tka: "sun",
};

const subtestCardAvatar = {
  pu: "/avatar/subtest-pu-avatar.webp",
  ppu: "/avatar/subtest-ppu-avatar.webp",
  pbm: "/avatar/subtest-pbm-avatar.webp",
  pk: "/avatar/subtest-pk-avatar.webp",
  lbi: "/avatar/subtest-lbi-avatar.webp",
  lbing: "/avatar/subtest-lbing-avatar.webp",
  pm: "/avatar/subtest-pm-avatar.webp",
  hab: "/avatar/brain-gym.webp",
  tka: "/avatar/study-avatar.webp",
} as const;

function getSubtestLook(shortName?: string) {
  const key = (shortName?.toLowerCase() ?? "") as keyof typeof subtestCardAvatar;
  return {
    tint: TINTS[subtestTint[key] ?? "blue"],
    avatarSrc: subtestCardAvatar[key] || "/avatar/subtest-pu-avatar.webp",
  };
}

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
  const { tint, avatarSrc } = getSubtestLook(subtest?.shortName);
  // Use subtest.order to determine if premium (order > 1 means premium)
  const isPremiumSubtest = isSubtestPremium(subtest?.order ?? 1, userRole, userIsPremium);
  const isLocked = !isAdmin && isPremiumSubtest;

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-sr-lg border border-sr-line bg-white shadow-sr-1",
        isLocked ? "opacity-95" : "sr-lift",
      )}
    >
      <div className={cn("relative h-32 overflow-hidden bg-linear-to-br sm:h-36", tint.art)}>
        <div className="pointer-events-none absolute -bottom-16 left-1/2 size-44 -translate-x-1/2 rounded-full bg-white/50" />
        <Image
          src={avatarSrc}
          alt=""
          width={180}
          height={180}
          className={cn(
            "pointer-events-none absolute -bottom-6 left-1/2 h-auto w-40 -translate-x-1/2 object-contain transition-transform duration-500 select-none group-hover:-translate-y-1 sm:w-44",
            isLocked && "grayscale-[40%]",
          )}
        />
        {isLocked && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-sr-ink/85 px-3 py-1 text-xs font-bold text-white">
            <CrownIcon weight="fill" className="size-4 text-sr-sun-400" /> Premium dulu yuk!
          </span>
        )}
      </div>

      <div className="flex flex-1 items-end justify-between gap-3 p-4">
        <div className="min-w-0 space-y-1.5">
          <h3 className="leading-snug font-extrabold text-pretty text-sr-ink">{subtest?.name}</h3>
          <span
            className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold", tint.chip)}
          >
            <BooksIcon weight="fill" className="size-3.5" /> {subtest?.totalContent} Konten
          </span>
        </div>

        {isLocked ? (
          <Link
            to="/premium"
            aria-label={`Buka ${subtest?.name} dengan Premium`}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink shadow-sr-1 after:absolute after:inset-0"
          >
            <LockIcon size={18} weight="bold" />
          </Link>
        ) : (
          <Link
            to={isAdmin ? "/admin/classes/$shortName" : "/classes/$shortName"}
            params={{ shortName: subtest?.shortName?.toLowerCase() }}
            aria-label={`Buka ${subtest?.name}`}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sr-blue-500 text-white shadow-sr-1 transition-transform group-hover:translate-x-0.5 after:absolute after:inset-0"
          >
            {isAdmin ? <PencilSimpleIcon size={18} weight="bold" /> : <ArrowRightIcon size={18} weight="bold" />}
          </Link>
        )}
      </div>
    </div>
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
  const { tint, avatarSrc } = getSubtestLook(subtest?.shortName ?? shortName);

  return (
    <div
      className={cn("relative overflow-hidden rounded-sr-xl border border-white bg-linear-to-br shadow-sr-1", tint.art)}
    >
      <div className="pointer-events-none absolute -right-16 -bottom-24 size-72 rounded-full bg-white/45" />
      <div className="pointer-events-none absolute -top-12 left-1/3 size-28 rounded-full bg-white/35" />

      <div className="relative flex items-end justify-between gap-4 px-6 pt-6 sm:items-center sm:px-10 sm:py-8">
        <div className="relative z-10 max-w-xl pb-6 sm:pb-0">
          <BackButton to={isAdmin ? "/admin/classes" : "/classes"} className="mb-4" />
          {isPending ? (
            <>
              <Skeleton className="mb-2 h-8 w-64 max-w-full bg-white/60" />
              <Skeleton className="h-4 w-80 max-w-full bg-white/60" />
            </>
          ) : (
            <>
              <h1 className="text-[26px] leading-tight font-extrabold text-sr-ink sm:text-[34px]">{subtest?.name}</h1>
              <p className="mt-2 text-sm leading-relaxed text-sr-ink-2 sm:text-base">{subtest?.description}</p>
            </>
          )}
        </div>
        <Image
          src={avatarSrc}
          alt=""
          width={240}
          height={240}
          className="pointer-events-none relative h-auto w-28 shrink-0 object-contain select-none sm:w-52"
        />
      </div>
    </div>
  );
}
