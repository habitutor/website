import {
  ArrowRightIcon,
  PencilSimpleIcon,
  PlayIcon,
  BookIcon,
  FileTextIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/utils/is-admin";
import type { BodyOutputs } from "@/utils/orpc";
import { buttonVariants } from "./ui/button";
import { Image } from "@unpic/react";
import { BackButton } from "./back-button";

export function SubtestHeader() {
  const isAdmin = useIsAdmin();
  const title = isAdmin ? "Subtest-Subtest UTBK" : "Kelas-Kelas UTBK";
  const description = isAdmin
    ? "Pilih subtest-subtest UTBK yang ingin kamu pelajari"
    : "Yuk belajar bersama untuk sukses dalam UTBK!";

  return (
    <div className="relative min-h-40 overflow-hidden rounded-[10px] bg-tertiary-200">
      {/* Ellipse background */}
      <div className="absolute left-[43px] top-[54px] h-[183px] w-[181px] rounded-full bg-tertiary-400" />

      {/* Avatar image */}
      <div className="absolute left-[17px] top-[-39px] size-[232px]">
        <Image
          src={"/avatar/subtest-header-avatar.webp"}
          alt="Subtest Header Avatar"
          width={232}
          height={232}
          className="pointer-events-none select-none object-cover object-[50%_50%]"
        />
      </div>

      {/* Text content */}
      <div className="absolute left-[249px] top-[61px] w-[306px] whitespace-pre-wrap">
        <h1 className="font-bold text-[30px] leading-[45px] text-neutral-1000">
          {title}
        </h1>
        <p className="font-normal text-[14px] leading-[21px] text-neutral-1000">
          {description}
        </p>
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

type SubtestListItem = NonNullable<
  BodyOutputs["subtest"]["listSubtests"]
>[number];

export function SubtestCard({ subtest }: { subtest: SubtestListItem }) {
  const isAdmin = useIsAdmin();
  const shortName =
    subtest?.shortName?.toLowerCase() as keyof typeof subtestCardBackground;
  const backgroundClass =
    subtestCardBackground[shortName] || "bg-secondary-400";
  const patternClass = subtestCardPattern[shortName] || "bg-secondary-600";
  const avatarSrc =
    subtestCardAvatar[shortName] || "/avatar/subtest-pu-avatar.webp";

  return (
    <Card
      className={cn(
        backgroundClass,
        "relative min-h-40 overflow-hidden border-0 p-4 transition-colors"
      )}
    >
      {/* Pattern element */}
      <div
        className={cn(
          patternClass,
          "absolute right-0 bottom-0 h-[70%] w-auto aspect-square"
        )}
      />

      {/* Avatar image */}
      <div className="absolute right-13 translate-x-1/2 bottom-0 translate-y-1/4 h-[170%] w-auto aspect-square">
        <Image
          src={avatarSrc}
          alt={`${subtest?.name} Avatar`}
          width={356}
          height={356}
          className="pointer-events-none select-none object-cover object-[50%_50%]"
        />
      </div>
      <div className="flex h-full justify-between">
        <div className="mt-auto mb-0 w-1/2">
          <h3 className="text-pretty font-medium">{subtest?.name}</h3>
          <p className="text-sm"># Materi</p>
        </div>

        <Link
          to={isAdmin ? "/admin/classes/$shortName" : "/classes/$shortName"}
          params={{ shortName: subtest?.shortName?.toLowerCase() }}
          className={cn(
            buttonVariants({ variant: "lightBlue", size: "icon" }),
            "z-1 mt-auto mb-0"
          )}
        >
          {isAdmin ? (
            <PencilSimpleIcon size={18} weight="bold" />
          ) : (
            <ArrowRightIcon size={18} weight="bold" />
          )}
        </Link>
      </div>
    </Card>
  );
}

export function ClassHeader({ subtest }: { subtest: SubtestListItem }) {
  const isAdmin = useIsAdmin();
  const shortName =
    subtest?.shortName?.toLowerCase() as keyof typeof subtestCardBackground;
  const backgroundClass =
    subtestCardBackground[shortName] || "bg-secondary-400";
  const patternClass = subtestCardPattern[shortName] || "bg-secondary-600";
  const avatarSrc =
    subtestCardAvatar[shortName] || "/avatar/subtest-pu-avatar.webp";

  return (
    <div className={cn(backgroundClass, "relative rounded-[10px]")}>
      {/* Back button */}
      <div className="ml-[33px] mt-[33px] z-10">
        <BackButton to={isAdmin ? "/admin/classes" : "/classes"} />
      </div>

      <div className="relative flex items-center pt-[33px] overflow-hidden">
        {/* Left section with pattern and avatar */}
        <div className="relative shrink-0 w-[240px] self-stretch">
          {/* Wrapper yang posisinya SAMA dengan pattern */}
          <div className="absolute left-[34px] bottom-0 h-full aspect-square">
            {/* Pattern (tidak diubah) */}
            <div className={cn(patternClass, "h-full w-full")} />

            {/* Avatar centered ke pattern */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[356px]">
              <Image
                src={avatarSrc}
                alt={`${subtest?.name} Avatar`}
                width={356}
                height={356}
                className="pointer-events-none select-none object-cover"
              />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-col items-start gap-[8px] min-h-[90px] justify-center mr-10 mb-10">
          <h1 className="font-bold text-[30px] leading-[45px] text-black">
            {subtest?.name}
          </h1>
          <p className="font-normal text-[14px] leading-[21px] text-black">
            {subtest?.description}
          </p>
        </div>
      </div>
    </div>
  );
}

type ContentListItem = NonNullable<
  BodyOutputs["subtest"]["listContentByCategory"]
>[number];

const CONTENT_ACTIONS = [
  {
    key: "video",
    label: "Video Materi",
    icon: PlayIcon,
    enabled: (i: ContentListItem) => i.hasVideo,
    className: "bg-primary-300 text-white",
    width: "w-[185px]",
  },
  {
    key: "notes",
    label: "Catatan Materi",
    icon: BookIcon,
    enabled: (i: ContentListItem) => i.hasNote,
    className: "bg-secondary-300 text-neutral-1000",
    width: "w-[194px]",
  },
  {
    key: "quiz",
    label: "Quiz",
    icon: FileTextIcon,
    enabled: (i: ContentListItem) => i.hasQuiz,
    className: "bg-tertiary-200 text-neutral-1000",
    width: "w-[194px]",
  },
] as const;

function ContentCard({
  item,
  index,
}: {
  item: ContentListItem;
  index: number;
}) {
  const isAdmin = useIsAdmin();
  const location = useLocation();
  const basePath = isAdmin ? "/admin/classes" : "/classes";
  const shortNameIndex = isAdmin ? 3 : 2;
  const shortName = location.pathname.split("/")[shortNameIndex];

  const params = {
    shortName,
    contentId: item.id.toString(),
  };

  return (
    <Card className="relative overflow-hidden border border-neutral-200 rounded-[10px] p-0 min-h-[137px]">
      {/* Numbered badge */}
      <div className="absolute left-[22px] top-[25px] h-[28px] w-[32.356px] border border-neutral-200 rounded-[3.111px] flex items-center justify-center">
        <p className="font-medium text-[12.444px] leading-[18.667px] text-primary-300">
          {index + 1}
        </p>
      </div>

      {/* Title */}
      <div className="absolute left-[74px] top-[25px]">
        <p className="font-medium text-[20px] leading-[30px] text-neutral-1000">
          {item.title}
        </p>
      </div>

      {/* Subtest label */}
      <div className="absolute right-[22px] top-[19px] w-[134px] flex flex-col items-end">
        <p className="font-normal text-[14px] leading-[21px] text-primary-200 text-right">
          Subtest
        </p>
      </div>

      {/* Action buttons */}
      <div className="absolute left-[22px] top-[73px] flex items-center gap-[19px]">
        {CONTENT_ACTIONS.map(
          ({ key, label, icon: Icon, enabled, className, width }) =>
            enabled(item) && (
              <Link
                key={key}
                to={`${basePath}/$shortName/$contentId/${key}`}
                params={params}
                className={cn(
                  "relative h-[44px] rounded-[5px] flex items-center gap-[10px] pl-[18px] pr-[10px] transition-opacity hover:opacity-90",
                  className,
                  width
                )}
              >
                <Icon size={18} weight="regular" />
                <p className="font-normal text-[14px] leading-[21px] shrink-0">
                  {label}
                </p>
                <CaretRightIcon
                  size={24}
                  weight="regular"
                  className="ml-auto"
                />
              </Link>
            )
        )}
      </div>
    </Card>
  );
}

export function ContentList({
  items,
  isLoading,
  error,
}: {
  title: string;
  items?: ContentListItem[];
  isLoading?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {isLoading && (
          <p className="text-muted-foreground text-xs">Memuat...</p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!isLoading && !error && (!items || items.length === 0) && (
        <p className="text-muted-foreground text-sm">Belum ada konten.</p>
      )}

      <div className="space-y-2">
        {items?.map((item, index) => (
          <ContentCard key={item.id} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
