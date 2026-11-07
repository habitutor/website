import { ArrowRightIcon, BooksIcon, CrownIcon, LockIcon, PencilSimpleIcon, StackIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { isSubtestPremium } from "@habitutor/shared/content-access";
import { BackButton } from "@/components/navigation/back-button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/utils/is-admin";
import { orpc } from "@/utils/orpc";
import type { BodyOutputs } from "@/utils/orpc";

export function SubtestHeader({ stats }: { stats?: { subtests: number; contents: number } }) {
  const isAdmin = useIsAdmin();

  const title = isAdmin ? "Hi Min, ini Subtest-Subtest UTBK" : "Kelas-Kelas UTBK";

  const description = isAdmin
    ? "Pilih subtest-subtest UTBK yang ingin diubah, dihapus, atau ditambahkan"
    : "Semua subtes SNBT tersusun rapi per BAB. Pilih satu, tonton videonya, lalu taklukkan latihan soalnya!";

  return (
    // Di HP maskot mengintip dari bawah teks; mulai sm duduk di kanan, sama seperti header Premium.
    <div className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 pt-6 pb-40 sm:px-8 sm:py-9 sm:pr-72 lg:px-10 lg:py-11 lg:pr-96">
      <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/8" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 size-40 rounded-full bg-white/5" />

      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
        <BooksIcon weight="fill" className="size-4 text-sr-sun-400" />
        Kelas UTBK
      </span>
      <h1 className="relative mt-3 text-[26px] leading-tight font-extrabold text-balance text-white sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      <p className="relative mt-2.5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">{description}</p>

      {stats && (
        <div className="relative mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15 sm:text-sm">
            <StackIcon weight="fill" className="size-4 text-sr-sun-400" /> {stats.subtests} subtes
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15 sm:text-sm">
            <BooksIcon weight="fill" className="size-4 text-sr-sun-400" /> {stats.contents} konten belajar
          </span>
        </div>
      )}

      <motion.img
        src="/avatar/subtest/header.webp"
        alt=""
        width={528}
        height={520}
        className="pointer-events-none absolute right-1/2 bottom-0 h-36 w-auto translate-x-1/2 select-none sm:right-10 sm:h-48 sm:translate-x-0 lg:right-16 lg:h-60"
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </div>
  );
}

// Warna kartu bergiliran biru, kuning, oranye supaya grid subtes tetap ceria tapi satu bahasa visual.
const TINTS = {
  blue: { art: "from-sr-blue-100 to-sr-blue-200", chip: "bg-sr-blue-50 text-sr-blue-700", mark: "text-sr-blue-300/60" },
  sun: { art: "from-sr-sun-100 to-sr-sun-200", chip: "bg-sr-sun-100 text-sr-amber-700", mark: "text-sr-sun-400/60" },
  orange: {
    art: "from-sr-orange-100 to-sr-orange-200",
    chip: "bg-sr-orange-100 text-sr-orange-700",
    mark: "text-sr-orange-200",
  },
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

// Versi maskot yang sudah dipangkas pas ke badan tupai, jadi bisa menempel rata di dasar kartu.
const SUBTEST_AVATARS = new Set(["pu", "ppu", "pbm", "pk", "lbi", "lbing", "pm", "hab", "tka"]);

function getSubtestLook(shortName?: string) {
  const key = shortName?.toLowerCase() ?? "";
  return {
    tint: TINTS[subtestTint[key] ?? "blue"],
    avatarSrc: `/avatar/subtest/${SUBTEST_AVATARS.has(key) ? key : "pu"}.webp`,
  };
}

type SubtestListItem = NonNullable<BodyOutputs["subtest"]["list"]>["data"][number];

export function SubtestCard({
  subtest,
  userIsPremium,
  userRole,
  index = 0,
}: {
  subtest: SubtestListItem;
  userIsPremium?: boolean;
  userRole?: string;
  index?: number;
}) {
  const isAdmin = useIsAdmin();
  const { tint, avatarSrc } = getSubtestLook(subtest?.shortName);
  // Use subtest.order to determine if premium (order > 1 means premium)
  const isPremiumSubtest = isSubtestPremium(subtest?.order ?? 1, userRole, userIsPremium);
  const isLocked = !isAdmin && isPremiumSubtest;

  return (
    <div
      className="group relative flex h-full sr-lift animate-sr-rise flex-col overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className={cn("relative h-44 overflow-hidden bg-linear-to-br", tint.art)}>
        <div className="pointer-events-none absolute -right-10 -bottom-16 size-52 rounded-full bg-white/45" />
        <div className="pointer-events-none absolute -top-10 -left-8 size-28 rounded-full bg-white/30" />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-2 left-4 text-6xl leading-none font-extrabold tracking-tight uppercase select-none",
            tint.mark,
          )}
        >
          {subtest?.shortName}
        </span>
        <img
          src={avatarSrc}
          alt=""
          loading="lazy"
          className={cn(
            "pointer-events-none absolute right-5 bottom-0 h-[86%] w-auto origin-bottom object-contain transition-transform duration-500 ease-sr-spring select-none motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:scale-105",
            isLocked && "grayscale-[35%]",
          )}
        />
        {isLocked && (
          <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-sr-ink/85 px-3 py-1 text-xs font-bold text-white shadow-sr-1">
            <CrownIcon weight="fill" className="size-4 text-sr-sun-400" /> Premium
          </span>
        )}
      </div>

      <div className="flex flex-1 items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 leading-snug font-extrabold text-pretty text-sr-ink transition-colors group-hover:text-sr-blue-600">
            {subtest?.name}
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span
              className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold", tint.chip)}
            >
              <BooksIcon weight="fill" className="size-3.5" /> {subtest?.totalContent} konten
            </span>
            {isLocked && <span className="text-xs font-semibold text-sr-amber-700">Buka dengan Premium</span>}
          </p>
        </div>

        {isLocked ? (
          <Link
            to="/premium"
            aria-label={`Buka ${subtest?.name} dengan Premium`}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sr-sun-500 text-sr-ink shadow-sr-1 transition-transform group-active:scale-90 after:absolute after:inset-0"
          >
            <LockIcon size={18} weight="bold" />
          </Link>
        ) : (
          <Link
            to={isAdmin ? "/admin/classes/$shortName" : "/classes/$shortName"}
            params={{ shortName: subtest?.shortName?.toLowerCase() }}
            aria-label={`Buka ${subtest?.name}`}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sr-blue-500 text-white shadow-sr-1 transition-transform group-hover:translate-x-0.5 group-active:scale-90 after:absolute after:inset-0"
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
  const backTo = isAdmin ? "/admin/classes" : "/classes";

  return (
    // Di HP gambar jadi pita atas seperti kartu subtes dan teks dapat lebar penuh; mulai sm gambar pindah ke kanan.
    <div className="relative overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1 sm:flex sm:flex-row-reverse">
      <div
        className={cn(
          "relative h-40 shrink-0 overflow-hidden bg-linear-to-br sm:h-auto sm:min-h-60 sm:w-2/5",
          tint.art,
        )}
      >
        <div className="pointer-events-none absolute -right-10 -bottom-16 size-56 rounded-full bg-white/45" />
        <div className="pointer-events-none absolute -top-10 -left-8 size-28 rounded-full bg-white/30" />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-2 left-4 text-6xl leading-none font-extrabold tracking-tight uppercase select-none sm:text-7xl",
            tint.mark,
          )}
        >
          {subtest?.shortName ?? shortName}
        </span>
        <BackButton to={backTo} className="absolute top-3 left-3 z-10 sm:hidden" />
        <motion.img
          src={avatarSrc}
          alt=""
          className="pointer-events-none absolute right-5 bottom-0 h-[86%] w-auto object-contain select-none sm:right-8 sm:h-[78%]"
          initial={{ y: 30 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>

      <div className="relative min-w-0 flex-1 self-center p-5 sm:p-8 lg:p-10">
        <BackButton to={backTo} className="mb-4 hidden sm:inline-flex" />
        {isPending ? (
          <>
            <Skeleton className="mb-2 h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </>
        ) : (
          <>
            <h1 className="text-2xl leading-tight font-extrabold text-balance text-sr-ink sm:text-3xl lg:text-[34px]">
              {subtest?.name}
            </h1>
            {subtest?.description && (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-sr-ink-2 sm:text-base">{subtest.description}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
