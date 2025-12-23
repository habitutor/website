import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BookIcon,
  CaretRightIcon,
  ExamIcon,
  FileTextIcon,
  NoteIcon,
  PencilSimpleIcon,
  PlayCircleIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
  VideoIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/utils/is-admin";
import type { BodyOutputs } from "@/utils/orpc";
import { BackButton } from "./back-button";
import { buttonVariants } from "./ui/button";

export function SubtestHeader() {
  const isAdmin = useIsAdmin();

  const title = isAdmin
    ? "Hi Min, ini Subtest-Subtest UTBK"
    : "Kelas-Kelas UTBK";

  const description = isAdmin
    ? "Pilih subtest-subtest UTBK yang ingin diubah, dihapus, atau ditambahkan"
    : "Yuk belajar bersama untuk sukses dalam UTBK!";

  return (
    <div className="relative overflow-hidden rounded-[10px] bg-tertiary-200">
      <div className="grid grid-cols-1 gap-6 px-6 pt-8 pb-0 sm:grid-cols-2 sm:items-center sm:px-10 sm:py-10">
        {/* TEXT — mobile top, desktop LEFT */}
        <div className="relative z-10 max-w-xl">
          <h1 className="font-bold text-[24px] text-neutral-1000 leading-tight sm:text-[30px]">
            {title}
          </h1>
          <p className="mt-2 text-[14px] text-neutral-1000 leading-[21px]">
            {description}
          </p>
        </div>

        {/* VISUAL */}
        <div className="relative -mx-6 h-[110px] overflow-hidden sm:mx-0 sm:h-auto sm:overflow-visible">
          {/* Ellipse */}
          <div className="absolute top-10 right-4 bottom-0 size-[180px] rounded-full bg-tertiary-400 sm:top-2" />

          {/* Avatar */}
          <Image
            src="/avatar/subtest-header-avatar.webp"
            alt="Subtest Header Avatar"
            width={260}
            height={260}
            className="absolute right-0 size-[210px] -translate-y-10 select-none object-cover sm:bottom-0 sm:translate-y-1/2"
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

  const forceTextWhite = backgroundClass.includes("text-white");

  return (
    <div
      className={cn(backgroundClass, "relative overflow-hidden rounded-[10px]")}
    >
      {/* Back button */}
      <div className="z-10 mt-6 ml-6 sm:mt-10 sm:ml-10">
        <BackButton to={isAdmin ? "/admin/classes" : "/classes"} />
      </div>

      <div className="grid grid-cols-1 px-6 pt-4 pb-0 sm:grid-cols-2 sm:items-center sm:px-10 sm:pb-10 md:grid-cols-5">
        {/* TEXT — mobile top, desktop LEFT */}
        <div
          className={cn(
            "relative z-10 max-w-xl md:col-span-3",
            forceTextWhite && "text-white"
          )}
        >
          <h1
            className={cn(
              "font-bold text-[24px] leading-tight sm:text-[30px]",
              forceTextWhite ? "text-white" : "text-neutral-1000"
            )}
          >
            {subtest?.name}
          </h1>
          <p
            className={cn(
              "mt-2 text-[14px] leading-[21px]",
              forceTextWhite ? "text-white/90" : "text-neutral-1000"
            )}
          >
            {subtest?.description}
          </p>
        </div>

        {/* VISUAL */}
        <div className="relative -mx-6 h-[110px] overflow-hidden sm:mx-0 sm:h-auto sm:overflow-visible md:col-span-2">
          {/* Ellipse */}
          <div
            className={cn(
              patternClass,
              "absolute top-10 right-4 bottom-0 size-[180px] rounded-full sm:top-2"
            )}
          />

          {/* Avatar */}
          <Image
            src={avatarSrc}
            alt={`${subtest?.name} Avatar`}
            width={260}
            height={260}
            className="absolute right-0 left-0 size-[360px] select-none object-cover sm:bottom-0 sm:translate-y-[55%]"
          />
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
    icon: PlayCircleIcon,
    enabled: (i: ContentListItem) => i.hasVideo,
    className: "bg-primary-300 text-white",
    width: "w-fit",
  },
  {
    key: "notes",
    label: "Catatan Materi",
    icon: NoteIcon,
    enabled: (i: ContentListItem) => i.hasNote,
    className: "bg-secondary-300 text-neutral-1000",
    width: "w-fit",
  },
  {
    key: "latihan-soal",
    label: "Latihan Soal",
    icon: ExamIcon,
    enabled: (i: ContentListItem) => i.hasPracticeQuestions,
    className: "bg-tertiary-200 text-neutral-1000",
    width: "w-fit",
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
    <Card className="rounded-[10px] border border-neutral-200 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: badge + title */}
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-8 shrink-0 items-center justify-center rounded border border-neutral-200">
            <p className="font-medium text-[12px] text-primary-300">
              {index + 1}
            </p>
          </div>

          <p className="font-medium text-[18px] text-neutral-1000 sm:text-[20px]">
            {item.title}
          </p>
        </div>

        {/* Right: label + admin actions */}
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
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
                >
                  <TrashIcon size={14} />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 overflow-x-auto">
        {CONTENT_ACTIONS.map(
          ({ key, label, icon: Icon, enabled, className, width }) =>
            enabled(item) && (
              <Link
                key={key}
                to={`${basePath}/$shortName/$contentId/${key}`}
                params={params}
                className={cn(
                  "flex items-center gap-2 rounded-[5px] px-4 py-2.5 transition-opacity hover:opacity-90",
                  "w-full sm:w-auto",
                  className,
                  width
                )}
              >
                <Icon size={18} weight="bold" />
                <span className="whitespace-nowrap font-medium text-[14px]">
                  {label}
                </span>
                <CaretRightIcon size={18} className="ml-auto" weight="bold" />
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
            width={150}
            height={150}
            className=""
          />
          <p>Tunggu kontennya diracik dulu ya!</p>
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

export function PracticeQuestionHeader() {
  return (
    <div className="relative overflow-hidden bg-tertiary-200">
      {/* Ellipse background (dekoratif): center vertically, stick to the right, with some overflow */}
      <div
        className="absolute top-1/2 right-[-50px] size-[181px] -translate-y-1/2 rounded-full bg-tertiary-400"
        style={{ zIndex: 0 }}
      />

      {/* Main content (penentu height) */}
      <div
        className="relative flex items-center gap-6 px-6 py-4"
        style={{ zIndex: 1 }}
      >
        <h1 className="font-medium text-neutral-1000 text-xl">Latihan Soal!</h1>
        
      </div>
    </div>
  );
}
