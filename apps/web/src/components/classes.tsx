import {
  ArrowRightIcon,
  BookIcon,
  CaretRightIcon,
  FileTextIcon,
  PencilSimpleIcon,
  PlayIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/utils/is-admin";
import type { BodyOutputs } from "@/utils/orpc";
import { BackButton } from "./back-button";
import { buttonVariants } from "./ui/button";

export function SubtestHeader() {
  const isAdmin = useIsAdmin();
  const title = isAdmin ? "Subtest-Subtest UTBK" : "Kelas-Kelas UTBK";
  const description = isAdmin
    ? "Pilih subtest-subtest UTBK yang ingin kamu pelajari"
    : "Yuk belajar bersama untuk sukses dalam UTBK!";

  return (
    <div className="relative min-h-40 overflow-hidden rounded-[10px] bg-tertiary-200">
      {/* Ellipse background */}
      <div className="absolute top-[54px] left-[43px] h-[183px] w-[181px] rounded-full bg-tertiary-400" />

      {/* Avatar image */}
      <div className="absolute top-[-39px] left-[17px] size-[232px]">
        <Image
          src={"/avatar/subtest-header-avatar.webp"}
          alt="Subtest Header Avatar"
          width={232}
          height={232}
          className="pointer-events-none select-none object-cover object-[50%_50%]"
        />
      </div>

      {/* Text content */}
      <div className="absolute top-[61px] left-[249px] w-[306px] whitespace-pre-wrap">
        <h1 className="font-bold text-[30px] text-neutral-1000 leading-[45px]">
          {title}
        </h1>
        <p className="font-normal text-[14px] text-neutral-1000 leading-[21px]">
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
          "absolute right-0 bottom-0 aspect-square h-[70%] w-auto"
        )}
      />

      {/* Avatar image */}
      <div className="absolute right-13 bottom-0 aspect-square h-[170%] w-auto translate-x-1/2 translate-y-1/4">
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
      <div className="z-10 mt-[33px] ml-[33px]">
        <BackButton to={isAdmin ? "/admin/classes" : "/classes"} />
      </div>

      <div className="relative flex items-center overflow-hidden pt-[33px]">
        {/* Left section with pattern and avatar */}
        <div className="relative w-[240px] shrink-0 self-stretch">
          {/* Wrapper yang posisinya SAMA dengan pattern */}
          <div className="absolute bottom-0 left-[34px] aspect-square h-full">
            {/* Pattern (tidak diubah) */}
            <div className={cn(patternClass, "h-full w-full")} />

            {/* Avatar centered ke pattern */}
            <div className="absolute top-1/2 left-1/2 size-[356px] -translate-x-1/2 -translate-y-1/2">
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
        <div className="mr-10 mb-10 flex min-h-[90px] flex-col items-start justify-center gap-[8px]">
          <h1 className="font-bold text-[30px] text-black leading-[45px]">
            {subtest?.name}
          </h1>
          <p className="font-normal text-[14px] text-black leading-[21px]">
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
    key: "latihan-soal",
    label: "Latihan Soal",
    icon: FileTextIcon,
    enabled: (i: ContentListItem) => i.hasPracticeQuestions,
    className: "bg-tertiary-200 text-neutral-1000",
    width: "w-[194px]",
  },
] as const;

function ContentCard({
  item,
  index,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  item: ContentListItem;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
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
    <Card className="relative min-h-[137px] overflow-hidden rounded-[10px] border border-neutral-200 p-0">
      {/* Numbered badge */}
      <div className="absolute top-[25px] left-[22px] flex h-[28px] w-[32.356px] items-center justify-center rounded-[3.111px] border border-neutral-200">
        <p className="font-medium text-[12.444px] text-primary-300 leading-[18.667px]">
          {index + 1}
        </p>
      </div>

      {/* Title */}
      <div className="absolute top-[25px] left-[74px]">
        <p className="font-medium text-[20px] text-neutral-1000 leading-[30px]">
          {item.title}
        </p>
      </div>

      {/* Subtest label and admin actions */}
      <div className="absolute top-[19px] right-[22px] flex w-[134px] flex-col items-end gap-2">
        <p className="text-right font-normal text-[14px] text-primary-200 leading-[21px]">
          Subtest
        </p>
        {isAdmin && (onEdit || onDelete || onMoveUp || onMoveDown) && (
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                title="Pindah ke atas"
              >
                <ArrowUpIcon size={14} />
              </Button>
            )}
            {onMoveDown && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                title="Pindah ke bawah"
              >
                <ArrowDownIcon size={14} />
              </Button>
            )}
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onEdit}
                title="Edit"
              >
                <PencilSimpleIcon size={14} />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={onDelete}
                title="Hapus"
              >
                <TrashIcon size={14} />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute top-[73px] left-[22px] flex items-center gap-[19px]">
        {CONTENT_ACTIONS.map(
          ({ key, label, icon: Icon, enabled, className, width }) =>
            enabled(item) && (
              <Link
                key={key}
                to={`${basePath}/$shortName/$contentId/${key}`}
                params={params}
                className={cn(
                  "relative flex h-[44px] items-center gap-[10px] rounded-[5px] pr-[10px] pl-[18px] transition-opacity hover:opacity-90",
                  className,
                  width
                )}
              >
                <Icon size={18} weight="regular" />
                <p className="shrink-0 font-normal text-[14px] leading-[21px]">
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
  title,
  items,
  isLoading,
  error,
  onCreate,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  title?: string;
  items?: ContentListItem[];
  isLoading?: boolean;
  error?: string;
  onCreate?: () => void;
  onEdit?: (item: ContentListItem) => void;
  onDelete?: (item: ContentListItem) => void;
  onMoveUp?: (item: ContentListItem) => void;
  onMoveDown?: (item: ContentListItem) => void;
}) {
  const isAdmin = useIsAdmin();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {title && <h3 className="font-semibold text-lg">{title}</h3>}
        {isAdmin && onCreate && (
          <Button type="button" variant="outline" size="sm" onClick={onCreate}>
            <PlusIcon size={16} className="mr-2" />
            Tambah Konten
          </Button>
        )}
        {isLoading && !title && (
          <p className="text-muted-foreground text-xs">Memuat...</p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!isLoading && !error && (!items || items.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-2">
          <Image
            src="/avatar/confused-avatar.webp"
            alt="Empty State"
            width={100}
            height={100}
          />
          <p className="text-muted-foreground text-sm">Belum ada konten.</p>
        </div>
      )}

      <div className="space-y-2">
        {items?.map((item, index) => (
          <ContentCard
            key={item.id}
            item={item}
            index={index}
            onEdit={onEdit ? () => onEdit(item) : undefined}
            onDelete={onDelete ? () => onDelete(item) : undefined}
            onMoveUp={onMoveUp ? () => onMoveUp(item) : undefined}
            onMoveDown={onMoveDown ? () => onMoveDown(item) : undefined}
            canMoveUp={index > 0}
            canMoveDown={items && index < items.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
