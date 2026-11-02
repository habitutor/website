import {
  CaretRightIcon,
  CheckCircleIcon,
  DotsNineIcon,
  ExamIcon,
  LockIcon,
  NoteIcon,
  PencilSimpleIcon,
  PlayCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Reorder, useDragControls } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { canAccessContent } from "@habitutor/shared/content-access";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/utils/is-admin";
import type { BodyOutputs } from "@/utils/orpc";

type ContentListItem = NonNullable<BodyOutputs["subtest"]["content"]["list"]>[number];

type ContentActionItem = {
  hasVideo: boolean;
  hasNote: boolean;
  hasPracticeQuestions: boolean;
};

function isContentCompleted(item: ContentListItem): boolean {
  const checks: boolean[] = [];

  if (item.hasVideo) {
    checks.push(item.videoCompleted === true);
  }

  if (item.hasNote) {
    checks.push(item.noteCompleted === true);
  }

  if (item.hasPracticeQuestions) {
    checks.push(item.practiceQuestionsCompleted === true);
  }

  return checks.length > 0 && checks.every(Boolean);
}

const CONTENT_ACTIONS = [
  {
    key: "video",
    label: "Video Materi",
    icon: PlayCircleIcon,
    enabled: (i: ContentActionItem) => i.hasVideo,
    className: "bg-sr-blue-500 text-white",
    width: "w-fit",
  },
  {
    key: "notes",
    label: "Catatan Materi",
    icon: NoteIcon,
    enabled: (i: ContentActionItem) => i.hasNote,
    className: "bg-sr-sun-400 text-sr-ink",
    width: "w-fit",
  },
  {
    key: "latihan-soal",
    label: "Latihan Soal",
    icon: ExamIcon,
    enabled: (i: ContentActionItem) => i.hasPracticeQuestions,
    className: "border border-sr-orange-200 bg-sr-orange-100 text-sr-orange-700",
    width: "w-fit",
  },
] as const;

function ReorderableContentCard({
  item,
  index,
  onEdit,
  onDelete,
  completed,
}: {
  item: ContentListItem;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
  completed?: boolean;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item value={item} dragListener={false} dragControls={dragControls} className="relative">
      <ContentCard
        item={item}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
        completed={completed}
        dragControls={dragControls}
      />
    </Reorder.Item>
  );
}

function ContentCard({
  item,
  index,
  onEdit,
  onDelete,
  completed,
  dragControls,
  userIsPremium,
  userRole,
  shortName,
  subtestOrder,
}: {
  item: ContentListItem;
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
  completed?: boolean;
  dragControls?: ReturnType<typeof useDragControls>;
  userIsPremium?: boolean;
  userRole?: string;
  shortName?: string;
  subtestOrder?: number;
}) {
  const isAdmin = useIsAdmin();
  const location = useLocation();
  const basePath = isAdmin ? "/admin/classes" : "/classes";
  const shortNameIndex = isAdmin ? 3 : 2;
  const subtestShortName = shortName || location.pathname.split("/")[shortNameIndex] || "";
  const isPremiumContent =
    !isAdmin && !canAccessContent(userIsPremium ?? false, userRole, subtestOrder ?? 1, item.order);

  const params = {
    shortName: subtestShortName,
    contentId: item.id.toString(),
  };

  return (
    <Card
      className={cn(
        "relative gap-3 rounded-sr-md border border-sr-line bg-white p-3 shadow-sr-1 transition-all duration-300 sm:gap-5 sm:p-4 lg:p-5",
        !isAdmin && completed && "border-sr-live/40 bg-linear-to-br from-sr-live/5 to-white",
        isPremiumContent ? "overflow-hidden" : "hover:-translate-y-0.5 hover:border-sr-blue-200 hover:shadow-sr-2",
      )}
    >
      {isPremiumContent && (
        <>
          <div className="pointer-events-none absolute inset-0 z-10 bg-sr-ivory/40" />
          <div className="absolute top-2 right-2 z-20 sm:top-3 sm:right-3">
            <div className="flex items-center gap-1.5 rounded-full bg-sr-sun-500 px-2.5 py-1 shadow-sr-1">
              <LockIcon className="size-4 text-sr-ink" weight="fill" />
              <span className="text-xs font-bold text-sr-ink">Premium</span>
            </div>
          </div>
        </>
      )}

      {!isAdmin && completed && !isPremiumContent && (
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-sr-live/10 px-2 py-0.5 text-xs font-bold text-sr-live sm:top-3 sm:right-3">
          <CheckCircleIcon className="size-4 sm:size-5" weight="fill" /> Selesai
        </div>
      )}

      <div className="flex flex-row justify-between gap-3 sm:items-start">
        <div className="flex items-start gap-3">
          {isAdmin && dragControls && (
            <div
              className="mt-0.5 flex size-8 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground hover:bg-muted active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <DotsNineIcon className="size-6" weight="bold" />
            </div>
          )}
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-sr-xs text-sm font-extrabold sm:size-9",
              !isAdmin && completed ? "bg-sr-live text-white" : "bg-sr-blue-50 text-sr-blue-600",
            )}
          >
            {index + 1}
          </div>

          <div className="flex h-full items-center pt-0.5">
            <p className="mr-20 text-sm leading-snug font-bold text-sr-ink sm:text-base lg:text-lg">{item.title}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 sm:flex-col sm:items-end">
          {isAdmin && (onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onEdit}>
                  <PencilSimpleIcon className="size-4 lg:size-5" />
                </Button>
              )}

              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                  onClick={onDelete}
                >
                  <TrashIcon className="size-4 lg:size-5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex gap-2 overflow-x-auto sm:gap-3">
        {CONTENT_ACTIONS.map(
          ({ key, label, icon: Icon, enabled, className, width }) =>
            enabled(item) && (
              <Link
                key={key}
                to={`${basePath}/$shortName/$contentId/${key}`}
                params={params}
                className={cn(
                  "flex sr-action items-center gap-1.5 rounded-sr-sm px-3 py-2 font-semibold sm:gap-2 sm:px-4 sm:py-2.5",
                  "w-full sm:w-auto",
                  className,
                  width,
                  isPremiumContent && "pointer-events-none opacity-60",
                )}
              >
                <Icon className="size-4 sm:size-4.5" weight="bold" />
                <span className="text-xs font-medium whitespace-nowrap sm:text-[14px]">{label}</span>
                <CaretRightIcon className="ml-auto size-4 sm:size-4.5" weight="bold" />
              </Link>
            ),
        )}
      </div>
    </Card>
  );
}

type LastContentViewedItem = ContentActionItem & {
  id: number;
  title: string;
};

type ContentFilter = "all" | "material" | "tips_and_trick";

const FILTERS: { value: ContentFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "material", label: "Materi" },
  { value: "tips_and_trick", label: "Tips & Trick" },
];

export function ContentFilters({
  activeFilter,
  onChange,
}: {
  activeFilter: ContentFilter;
  onChange: (filter: ContentFilter) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 sm:overflow-visible sm:pb-0">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-300",
            "sm:h-10",
            activeFilter === filter.value
              ? "border-transparent bg-sr-blue-500 text-white shadow-sr-2"
              : "border-sr-line bg-white text-sr-ink-2 hover:border-sr-blue-200 hover:text-sr-blue-600",
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export function LastContentViewedCard({
  item,
  index,
  shortName: shortNameProp,
}: {
  item: LastContentViewedItem;
  index: number;
  shortName?: string;
}) {
  const isAdmin = useIsAdmin();
  const location = useLocation();
  const basePath = isAdmin ? "/admin/classes" : "/classes";
  const shortNameIndex = isAdmin ? 3 : 2;
  const shortNameFromPath = location.pathname.split("/")[shortNameIndex] || "";
  const shortName = shortNameProp || shortNameFromPath;

  const params = {
    shortName: shortName.toLowerCase(),
    contentId: item.id.toString(),
  };

  return (
    <Card className="sr-lift rounded-sr-md border-sr-line p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-7 w-8 shrink-0 items-center justify-center rounded-sr-xs border border-sr-blue-200 bg-sr-blue-50">
            <p className="text-[12px] font-bold text-sr-blue-600">{index + 1}</p>
          </div>

          <p className="min-w-0 text-[18px] font-bold text-sr-ink sm:text-[20px]">{item.title}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
          {shortName && (
            <span className="rounded-full bg-sr-blue-50 px-2.5 py-0.5 text-xs font-bold text-sr-blue-700 uppercase">
              {shortName}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto">
        {CONTENT_ACTIONS.map(
          ({ key, label, icon: Icon, enabled, className, width }) =>
            enabled(item) && (
              <Link
                key={key}
                to={`${basePath}/$shortName/$contentId/${key}`}
                params={params}
                className={cn(
                  "flex sr-action items-center gap-2 rounded-sr-sm px-4 py-2.5 font-semibold",
                  "w-full sm:w-auto",
                  className,
                  width,
                )}
              >
                <Icon size={18} weight="bold" />
                <span className="text-[14px] font-medium whitespace-nowrap">{label}</span>
                <CaretRightIcon size={18} className="ml-auto" weight="bold" />
              </Link>
            ),
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
  onReorder,
  userIsPremium,
  userRole,
  shortName,
  subtestOrder,
  searchQuery,
  showCount,
  hasMore,
  onLoadMore,
  activeFilter,
}: {
  title?: string;
  items?: ContentListItem[];
  isLoading?: boolean;
  error?: string;
  onCreate?: () => void;
  onEdit?: (item: ContentListItem) => void;
  onDelete?: (item: ContentListItem) => void;
  onReorder?: (newItems: ContentListItem[]) => void;
  userIsPremium?: boolean;
  userRole?: string;
  shortName?: string;
  subtestOrder?: number;
  searchQuery?: string;
  showCount?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  activeFilter?: "all" | "material" | "tips_and_trick";
}) {
  const isAdmin = useIsAdmin();
  const [localItems, setLocalItems] = useState<ContentListItem[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (items) {
      setLocalItems(items);
    }
  }, [items]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleReorder = (newItems: ContentListItem[]) => {
    setLocalItems(newItems);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (onReorder) {
        onReorder(newItems);
      }
    }, 800);
  };

  return (
    <div className="">
      <div className="flex items-center justify-between">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {isAdmin && onCreate && activeFilter !== "all" && (
          <Button type="button" variant="destructive" size="sm" onClick={onCreate} className="mb-4">
            <PlusIcon size={16} className="mr-2" weight="bold" />
            Tambah Konten
          </Button>
        )}
        {isLoading && !title && <p className="text-xs text-muted-foreground">Memuat...</p>}
      </div>

      {showCount && searchQuery && items && (
        <p className="mb-4 text-sm text-muted-foreground">
          {items.length} hasil untuk "{searchQuery}"
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!isLoading && !error && (!localItems || localItems.length === 0) && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-sr-lg border border-dashed border-sr-line-2 bg-white/80 py-10 text-center">
          <Image
            src="/avatar/confused-avatar.webp"
            alt="Empty State"
            width={150}
            height={150}
            className="animate-sr-drift"
          />
          <p className="font-extrabold text-sr-ink">Tunggu kontennya diracik dulu ya!</p>
        </div>
      )}

      {localItems &&
        localItems.length > 0 &&
        (isAdmin && onReorder && activeFilter !== "all" ? (
          <Reorder.Group as="div" axis="y" values={localItems} onReorder={handleReorder} className="space-y-2">
            {localItems.map((item, index) => (
              <ReorderableContentCard
                key={item.id}
                item={item}
                index={index}
                onEdit={onEdit ? () => onEdit(item) : undefined}
                onDelete={onDelete ? () => onDelete(item) : undefined}
              />
            ))}
          </Reorder.Group>
        ) : (
          <div className="space-y-2">
            {localItems.map((item, index) => (
              <ContentCard
                key={item.id}
                item={item}
                index={index}
                completed={isContentCompleted(item)}
                onEdit={onEdit ? () => onEdit(item) : undefined}
                onDelete={onDelete ? () => onDelete(item) : undefined}
                userIsPremium={userIsPremium}
                userRole={userRole}
                shortName={shortName}
                subtestOrder={subtestOrder}
              />
            ))}
          </div>
        ))}

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button type="button" variant="outline" onClick={onLoadMore}>
            Muat Lebih Banyak
          </Button>
        </div>
      )}
    </div>
  );
}
