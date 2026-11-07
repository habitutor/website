import {
  ArrowRightIcon,
  BookOpenIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  CheckCircleIcon,
  ClockIcon,
  CrownSimpleIcon,
  ExamIcon,
  HourglassIcon,
  ListNumbersIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import {
  FreemiumAccessPanel,
  type FreemiumStatus,
  TryoutCardAccess,
  useFreemiumStatus,
} from "./-components/freemium-access";

export const Route = createFileRoute("/_authenticated/tryout/")({
  head: () => ({
    meta: createMeta({
      title: "Try Out UTBK",
      description: "Yuk belajar bersama untuk sukses dalam UTBK!",
      noIndex: true,
    }),
  }),
  component: TryoutPage,
});

type TryoutListItem = {
  id: string;
  judul: string;
  deskripsi: string | null;
  totalSubtes: number;
  totalSoal: number;
  totalDurasi: number;
};

type HistoryItem = {
  id: string;
  tryoutId: string;
  judul: string;
  status: "berjalan" | "selesai" | "expired";
  totalSkor: number;
  mulaiAt: Date;
  selesaiAt: Date | null;
};

type TabValue = "daftar_tryout" | "passing_grade" | "hasil";
type StatusFilter = "all" | "baru" | "berjalan" | "selesai";

const TABS: { value: TabValue; label: string; short: string }[] = [
  { value: "daftar_tryout", label: "Daftar Try Out", short: "Try Out" },
  { value: "passing_grade", label: "Passing Grade", short: "Passing Grade" },
  { value: "hasil", label: "Hasil Saya", short: "Hasil" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "baru", label: "Belum dikerjakan" },
  { value: "berjalan", label: "Sedang dikerjakan" },
  { value: "selesai", label: "Selesai" },
];

const TRYOUT_PAGE_SIZE = 9;
const PASSING_GRADE_PAGE_SIZE = 20;

// Kartu try out bergiliran biru, kuning, oranye seperti kartu Kelas.
const CARD_TINTS = [
  { art: "from-sr-blue-100 to-sr-blue-200", mark: "text-sr-blue-300/60" },
  { art: "from-sr-sun-100 to-sr-sun-200", mark: "text-sr-sun-400/60" },
  { art: "from-sr-orange-100 to-sr-orange-200", mark: "text-sr-orange-200" },
] as const;

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

// Status try out bagi siswa, diambil dari sesi terbarunya (sesi selesai/waktu habis sama-sama punya hasil).
function getTryoutProgress(tryoutId: string, history: HistoryItem[]) {
  const sessions = history.filter((item) => item.tryoutId === tryoutId);
  if (sessions.length === 0) return { status: "baru" as const };
  const latest = sessions.reduce((a, b) => (new Date(a.mulaiAt) > new Date(b.mulaiAt) ? a : b));
  if (latest.status === "berjalan") return { status: "berjalan" as const, session: latest };
  return { status: "selesai" as const, session: latest };
}

function TryoutPage() {
  const { data: tryoutsData, error, isError, isPending } = useQuery(orpc.tryout.list.queryOptions({ input: {} }));
  const tryouts = asArray<TryoutListItem>(tryoutsData);
  const freemiumStatus = useFreemiumStatus();
  const { data: historyData } = useQuery(orpc.tryout.history.queryOptions({ input: {} }));
  const history = asArray<HistoryItem>(historyData);

  const [tab, setTab] = React.useState<TabValue>("daftar_tryout");
  const finishedCount = new Set(history.filter((h) => h.status !== "berjalan").map((h) => h.tryoutId)).size;

  return (
    <div className="flex w-full flex-col gap-6">
      <TryoutHeader
        stats={
          tryoutsData ? { available: tryouts.length, finished: historyData ? finishedCount : undefined } : undefined
        }
      />

      <div className="rounded-sr-xl border border-sr-line bg-white p-2 shadow-sr-1 sm:p-3">
        <div className="grid grid-cols-3 gap-1 rounded-full bg-sr-blue-50 p-1 sm:flex sm:w-fit" role="tablist">
          {TABS.map((item) => {
            const active = item.value === tab;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.value)}
                className={cn(
                  "relative rounded-full px-1 py-2 text-[13px] font-bold whitespace-nowrap transition-colors sm:px-5 sm:text-sm",
                  active ? "text-white" : "text-sr-ink-2 hover:text-sr-blue-600",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tryout-tab-pill"
                    className="absolute inset-0 rounded-full bg-sr-blue-500 shadow-sr-2"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative sm:hidden">{item.short}</span>
                <span className="relative hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {tab === "daftar_tryout" && (
          <TryoutListTab
            tryouts={tryouts}
            history={history}
            isPending={isPending}
            isError={isError}
            error={error}
            freemiumStatus={freemiumStatus.data}
          />
        )}
        {tab === "passing_grade" && <PassingGradeTab />}
        {tab === "hasil" && <HistoryTabContent onStart={() => setTab("daftar_tryout")} />}
      </motion.div>
    </div>
  );
}

function TryoutHeader({ stats }: { stats?: { available: number; finished?: number } }) {
  return (
    // Di HP maskot mengintip dari bawah teks; mulai sm duduk di kanan, sama seperti header Premium.
    <div className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 pt-6 pb-40 sm:px-8 sm:py-9 sm:pr-72 lg:px-10 lg:py-11 lg:pr-96">
      <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/8" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 size-40 rounded-full bg-white/5" />

      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
        <ExamIcon weight="fill" className="size-4 text-sr-sun-400" />
        Simulasi UTBK
      </span>
      <h1 className="relative mt-3 text-[26px] leading-tight font-extrabold text-balance text-white sm:text-3xl lg:text-4xl">
        Try Out UTBK
      </h1>
      <p className="relative mt-2.5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
        Latihan dengan suasana ujian sungguhan, lalu lihat skormu dan bandingkan dengan passing grade kampus impian.
      </p>

      {stats && (
        <div className="relative mt-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15 sm:text-sm">
            <ExamIcon weight="fill" className="size-4 text-sr-sun-400" /> {stats.available} try out tersedia
          </span>
          {stats.finished !== undefined && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15 sm:text-sm">
              <TrophyIcon weight="fill" className="size-4 text-sr-sun-400" /> {stats.finished} sudah kamu kerjakan
            </span>
          )}
        </div>
      )}

      <motion.img
        src="/avatar/subtest/tka.webp"
        alt=""
        width={485}
        height={520}
        className="pointer-events-none absolute right-1/2 bottom-0 h-36 w-auto translate-x-1/2 select-none sm:right-10 sm:h-48 sm:translate-x-0 lg:right-16 lg:h-60"
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </div>
  );
}

function TryoutListTab({
  tryouts,
  history,
  isPending,
  isError,
  error,
  freemiumStatus,
}: {
  tryouts: TryoutListItem[];
  history: HistoryItem[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  freemiumStatus?: FreemiumStatus;
}) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [page, setPage] = React.useState(1);
  const listTopRef = React.useRef<HTMLDivElement>(null);

  const hasAnyAccess = freemiumStatus?.requirementsCompleted || freemiumStatus?.hasPackage;
  const isLockedPreview = Boolean(freemiumStatus?.gateEnabled && !freemiumStatus.fullAccess && !hasAnyAccess);

  const keyword = search.trim().toLowerCase();
  const filtered = tryouts.filter((tryout) => {
    const matchSearch = !keyword || `${tryout.judul} ${tryout.deskripsi ?? ""}`.toLowerCase().includes(keyword);
    const matchStatus = statusFilter === "all" || getTryoutProgress(tryout.id, history).status === statusFilter;
    return matchSearch && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / TRYOUT_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * TRYOUT_PAGE_SIZE, currentPage * TRYOUT_PAGE_SIZE);

  const goToPage = (next: number) => {
    setPage(next);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLockedPreview) {
    return (
      <div className="flex flex-col gap-6">{freemiumStatus && <FreemiumAccessPanel status={freemiumStatus} />}</div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {freemiumStatus && <FreemiumAccessPanel status={freemiumStatus} />}

      {/* Pencarian & filter status saat siswa sudah memiliki akses */}
      {tryouts.length > 1 && (
        <div className="flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-white p-3 shadow-sr-1 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:pb-0">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setStatusFilter(item.value);
                  setPage(1);
                }}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-300",
                  statusFilter === item.value
                    ? "border-transparent bg-sr-blue-500 text-white shadow-sr-2"
                    : "border-sr-line bg-white text-sr-ink-2 hover:border-sr-blue-200 hover:text-sr-blue-600",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-80">
            <span className="sr-only">Cari try out</span>
            <MagnifyingGlassIcon
              weight="bold"
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-sr-muted"
            />
            <input
              type="search"
              placeholder="Cari try out..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-full border border-sr-line bg-sr-ivory/60 pr-4 pl-10 text-sm text-sr-ink transition-colors outline-none placeholder:text-sr-muted focus:border-sr-blue-300 focus:bg-white focus:ring-4 focus:ring-sr-blue-100"
            />
          </label>
        </div>
      )}

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i.toString()} className="overflow-hidden rounded-sr-xl border border-sr-line bg-white">
              <Skeleton className="h-24 w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <TryoutEmptyState
          title="Gagal memuat data"
          description={getErrorMessage(error, "Gagal memuat daftar Try Out")}
        />
      ) : tryouts.length === 0 ? (
        <TryoutEmptyState title="Belum ada try out" description="Try out akan segera hadir. Nantikan ya!" />
      ) : filtered.length === 0 ? (
        <TryoutEmptyState
          title="Try out tidak ditemukan"
          description="Coba ganti kata kunci atau pilih filter status yang lain."
        />
      ) : (
        <div ref={listTopRef} className="scroll-mt-28 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {paged.map((tryout, index) => (
              <motion.div
                key={`${statusFilter}-${currentPage}-${tryout.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <TryoutCard
                  tryout={tryout}
                  index={(currentPage - 1) * TRYOUT_PAGE_SIZE + index}
                  progress={getTryoutProgress(tryout.id, history)}
                  freemiumStatus={freemiumStatus}
                />
              </motion.div>
            ))}
          </div>
          {totalPages > 1 && <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />}
        </div>
      )}
    </div>
  );
}

function TryoutCard({
  tryout,
  index,
  progress,
  freemiumStatus,
}: {
  tryout: TryoutListItem;
  index: number;
  progress: ReturnType<typeof getTryoutProgress>;
  freemiumStatus?: FreemiumStatus;
}) {
  const tint = CARD_TINTS[index % CARD_TINTS.length];

  return (
    <article className="group flex h-full sr-lift flex-col overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
      <div className={cn("relative h-24 overflow-hidden bg-linear-to-br px-4 pt-4", tint.art)}>
        <div className="pointer-events-none absolute -right-10 -bottom-16 size-40 rounded-full bg-white/45" />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-4 bottom-1 text-3xl font-extrabold tracking-tight select-none sm:text-4xl",
            tint.mark,
          )}
        >
          Try Out {index + 1}
        </span>
        <ProgressChip progress={progress} />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div>
          <h3 className="line-clamp-2 text-lg leading-snug font-extrabold text-pretty text-sr-ink transition-colors group-hover:text-sr-blue-600">
            {tryout.judul}
          </h3>
          {tryout.deskripsi && (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-sr-muted">{tryout.deskripsi}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<BookOpenIcon weight="fill" />} value={tryout.totalSubtes} label="Subtes" />
          <Stat icon={<ListNumbersIcon weight="fill" />} value={tryout.totalSoal} label="Soal" />
          <Stat icon={<ClockIcon weight="fill" />} value={tryout.totalDurasi} label="Menit" />
        </div>

        <TryoutCardAccess tryoutId={tryout.id} status={freemiumStatus} />

        <div className="mt-auto">
          {progress.status === "selesai" && progress.session ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/tryout/$tryoutId" params={{ tryoutId: tryout.id }}>
                  Detail
                </Link>
              </Button>
              <Button className="rounded-full" asChild>
                <Link to="/tryout/result/$sesiId" params={{ sesiId: progress.session.id }}>
                  Lihat Hasil <ArrowRightIcon weight="bold" />
                </Link>
              </Button>
            </div>
          ) : (
            <Button className="sr-sheen w-full rounded-full" asChild>
              <Link to="/tryout/$tryoutId" params={{ tryoutId: tryout.id }}>
                {progress.status === "berjalan" ? "Lanjutkan Try Out" : "Lihat & Mulai"}{" "}
                <ArrowRightIcon weight="bold" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function ProgressChip({ progress }: { progress: ReturnType<typeof getTryoutProgress> }) {
  if (progress.status === "selesai") {
    return (
      <span className="relative inline-flex items-center gap-1 rounded-full bg-sr-live px-2.5 py-1 text-xs font-bold text-white shadow-sr-1">
        <CheckCircleIcon weight="fill" className="size-3.5" /> Selesai · Skor {progress.session?.totalSkor ?? 0}
      </span>
    );
  }
  if (progress.status === "berjalan") {
    return (
      <span className="relative inline-flex items-center gap-1 rounded-full bg-sr-sun-500 px-2.5 py-1 text-xs font-bold text-sr-ink shadow-sr-1">
        <HourglassIcon weight="fill" className="size-3.5" /> Sedang dikerjakan
      </span>
    );
  }
  return (
    <span className="relative inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-xs font-bold text-sr-ink-2 shadow-sr-1">
      Belum dikerjakan
    </span>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-sr-sm bg-sr-blue-50 px-2 py-2 text-center [&_svg]:size-4 [&_svg]:text-sr-blue-600">
      {icon}
      <span className="mt-1 text-base leading-none font-extrabold text-sr-ink">{value}</span>
      <span className="mt-0.5 text-[11px] font-semibold text-sr-muted">{label}</span>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <CaretLeftIcon weight="bold" /> <span className="max-sm:hidden">Sebelumnya</span>
      </Button>
      <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-sr-ink shadow-sr-1 ring-1 ring-sr-line">
        {page} <span className="font-medium text-sr-muted">/ {totalPages}</span>
      </span>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        <span className="max-sm:hidden">Berikutnya</span> <CaretRightIcon weight="bold" />
      </Button>
    </div>
  );
}

type PassingGradeItem = {
  id: string;
  universitas: string;
  rank: number;
  jurusan: string;
  score: number;
};

type ProgramStudiData = {
  id: number;
  nama: string;
  passedGrade: number;
};

type UniversitasData = {
  id: number;
  namaUniv: string;
  rankUniv: number;
  programStudi: ProgramStudiData[];
};

const SELECT_CLASS =
  "h-11 w-full rounded-full border border-sr-line bg-sr-ivory/60 px-4 text-sm font-semibold text-sr-ink outline-none transition-colors focus:border-sr-blue-300 focus:bg-white focus:ring-4 focus:ring-sr-blue-100 sm:w-56";

function PassingGradeTab() {
  const [selectedUniv, setSelectedUniv] = React.useState<string>("");
  const [selectedJurusan, setSelectedJurusan] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<"rank" | "score">("score");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");
  const [page, setPage] = React.useState(1);

  const {
    data: universitasData,
    isPending: isPgPending,
    isError: isPgError,
    error: pgError,
  } = useQuery(orpc.tryout.passingGrade.queryOptions({ input: {} }));

  const passingGradeItems = React.useMemo<PassingGradeItem[]>(() => {
    if (!universitasData) return [];
    const items = (universitasData as UniversitasData[]).flatMap((univ) =>
      univ.programStudi.map((prodi) => ({
        id: `${univ.id}-${prodi.id}`,
        universitas: univ.namaUniv,
        jurusan: prodi.nama,
        score: prodi.passedGrade,
        rank: 0,
      })),
    );

    // Urutkan berdasarkan score descending untuk menghitung peringkat (rank) prodi
    items.sort((a, b) => b.score - a.score);

    return items.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [universitasData]);

  const uniqueUniversitas = React.useMemo<string[]>(() => {
    if (!universitasData) return [];
    return (universitasData as UniversitasData[]).map((u) => u.namaUniv);
  }, [universitasData]);

  const uniqueJurusan = React.useMemo<string[]>(() => {
    const set = new Set(passingGradeItems.map((item) => item.jurusan));
    return Array.from(set).sort();
  }, [passingGradeItems]);

  const filteredPassingGrade = React.useMemo<PassingGradeItem[]>(() => {
    const filtered = passingGradeItems.filter((item) => {
      const matchUniv = selectedUniv ? item.universitas === selectedUniv : true;
      const matchJurusan = selectedJurusan ? item.jurusan === selectedJurusan : true;
      return matchUniv && matchJurusan;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "rank") {
        return sortDirection === "asc" ? a.rank - b.rank : b.rank - a.rank;
      } else {
        return sortDirection === "asc" ? a.score - b.score : b.score - a.score;
      }
    });
  }, [passingGradeItems, selectedUniv, selectedJurusan, sortBy, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredPassingGrade.length / PASSING_GRADE_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = filteredPassingGrade.slice(
    (currentPage - 1) * PASSING_GRADE_PAGE_SIZE,
    currentPage * PASSING_GRADE_PAGE_SIZE,
  );

  const toggleSort = (column: "rank" | "score") => {
    if (sortBy === column) setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    else {
      setSortBy(column);
      setSortDirection(column === "rank" ? "asc" : "desc");
    }
    setPage(1);
  };

  const SortIcon = sortDirection === "asc" ? CaretUpIcon : CaretDownIcon;

  if (isPgPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full rounded-sr-xl" />
        <Skeleton className="h-96 w-full rounded-sr-xl" />
      </div>
    );
  }

  if (isPgError) {
    return (
      <TryoutEmptyState
        title="Gagal memuat data"
        description={getErrorMessage(pgError, "Gagal memuat data passing grade")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-sr-xl border border-sr-line bg-white p-3 shadow-sr-1 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div>
          <p className="font-extrabold text-sr-ink">Cek passing grade kampus impian</p>
          <p className="text-xs text-sr-muted">Bandingkan dengan skor try out-mu.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={selectedUniv}
            onChange={(e) => {
              setSelectedUniv(e.target.value);
              setPage(1);
            }}
            className={SELECT_CLASS}
            aria-label="Filter universitas"
          >
            <option value="">Semua Universitas</option>
            {uniqueUniversitas.map((univ) => (
              <option key={univ} value={univ}>
                {univ}
              </option>
            ))}
          </select>
          <select
            value={selectedJurusan}
            onChange={(e) => {
              setSelectedJurusan(e.target.value);
              setPage(1);
            }}
            className={SELECT_CLASS}
            aria-label="Filter jurusan"
          >
            <option value="">Semua Jurusan</option>
            {uniqueJurusan.map((jurusan) => (
              <option key={jurusan} value={jurusan}>
                {jurusan}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-sr-xl border border-sr-line bg-white shadow-sr-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-sr-blue-50 text-xs font-bold tracking-wide text-sr-blue-700 uppercase">
              <tr>
                <th className="hidden px-4 py-3 sm:table-cell">
                  <button
                    type="button"
                    onClick={() => toggleSort("rank")}
                    className="inline-flex items-center gap-1 uppercase hover:text-sr-blue-600"
                  >
                    Rank {sortBy === "rank" && <SortIcon weight="bold" className="size-3.5" />}
                  </button>
                </th>
                <th className="px-4 py-3">Universitas</th>
                <th className="px-4 py-3">Jurusan</th>
                <th className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort("score")}
                    className="inline-flex items-center gap-1 uppercase hover:text-sr-blue-600"
                  >
                    Skor {sortBy === "score" && <SortIcon weight="bold" className="size-3.5" />}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sr-line">
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sr-muted">
                    Tidak ada data passing grade yang sesuai.
                  </td>
                </tr>
              ) : (
                pagedRows.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-sr-ivory">
                    <td className="hidden px-4 py-3 font-bold text-sr-muted sm:table-cell">#{item.rank}</td>
                    <td className="px-4 py-3 font-semibold text-sr-ink">{item.universitas}</td>
                    <td className="px-4 py-3 text-sr-ink-2">{item.jurusan}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-block rounded-full bg-sr-sun-100 px-2.5 py-0.5 font-extrabold text-sr-amber-700 tabular-nums">
                        {item.score}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-xs text-sr-muted">
          Menampilkan {pagedRows.length} dari {filteredPassingGrade.length} data
          {filteredPassingGrade.length !== passingGradeItems.length && ` (total ${passingGradeItems.length})`}.
        </p>
        {totalPages > 1 && <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />}
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function TryoutEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-sr-xl border border-dashed border-sr-line-2 bg-white/80 px-6 py-10 text-center">
      <img src="/avatar/confused-avatar.webp" alt="" className="h-32 w-auto motion-safe:animate-sr-drift" />
      <p className="text-lg font-extrabold text-sr-ink">{title}</p>
      <p className="max-w-sm text-sm leading-relaxed text-sr-muted">{description}</p>
    </div>
  );
}

const HISTORY_STATUS: Record<HistoryItem["status"], { label: string; className: string }> = {
  selesai: { label: "Selesai", className: "bg-sr-live/10 text-sr-live" },
  berjalan: { label: "Sedang dikerjakan", className: "bg-sr-sun-100 text-sr-amber-700" },
  expired: { label: "Waktu habis", className: "bg-sr-orange-100 text-sr-orange-700" },
};

function HistoryTabContent({ onStart }: { onStart: () => void }) {
  const { data: historyData, error, isError, isPending } = useQuery(orpc.tryout.history.queryOptions({ input: {} }));
  const history = asArray<HistoryItem>(historyData);

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i.toString()} className="h-48 w-full rounded-sr-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <TryoutEmptyState
        title="Gagal memuat data"
        description={getErrorMessage(error, "Gagal memuat riwayat Try Out")}
      />
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <TryoutEmptyState
          title="Belum ada hasil try out"
          description="Kerjakan try out pertamamu, nanti skor dan pembahasannya muncul di sini."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative flex flex-col justify-between gap-5 overflow-hidden rounded-sr-xl sr-card-sun p-5 md:p-6">
            <div className="pointer-events-none absolute -right-10 -bottom-16 size-40 rounded-full bg-white/40" />
            <div className="relative">
              <p className="text-sm font-semibold text-sr-amber-700">Gratis untuk dicoba</p>
              <p className="mt-1 text-xl font-extrabold">Mulai try out sekarang</p>
            </div>
            <Button variant="darkBlue" onClick={onStart} className="relative w-fit rounded-full">
              Pilih Try Out <ArrowRightIcon weight="bold" />
            </Button>
          </div>
          <div className="relative flex flex-col justify-between gap-5 overflow-hidden rounded-sr-xl sr-card-blue p-5 md:p-6">
            <div className="pointer-events-none absolute -right-10 -bottom-16 size-40 rounded-full bg-white/10" />
            <div className="relative">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-white/80">
                <CrownSimpleIcon weight="fill" className="size-4 text-sr-sun-400" /> Try Out Premium
              </p>
              <p className="mt-1 text-xl font-extrabold">Buka pembahasan lengkap</p>
            </div>
            <Button variant="secondary" className="relative w-fit rounded-full" asChild>
              <Link to="/premium">
                Lihat Premium <ArrowRightIcon weight="bold" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
      {history.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <HistoryCard history={item} />
        </motion.div>
      ))}
    </div>
  );
}

function HistoryCard({ history }: { history: HistoryItem }) {
  const status = HISTORY_STATUS[history.status];
  const isRunning = history.status === "berjalan";
  const doneAt = history.selesaiAt ?? history.mulaiAt;

  return (
    <article className="group flex h-full sr-lift flex-col gap-4 rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1">
      <div className="flex items-start justify-between gap-3">
        <h3
          className="line-clamp-2 leading-snug font-extrabold text-sr-ink transition-colors group-hover:text-sr-blue-600"
          title={history.judul}
        >
          {history.judul}
        </h3>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", status.className)}>
          {status.label}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 rounded-sr-md bg-linear-to-br from-sr-sun-100 to-sr-cream p-4">
        {isRunning ? (
          // Skala skor mulai dari 200, jadi skor sesi yang belum selesai belum bermakna.
          <div>
            <p className="text-xs font-semibold text-sr-amber-700">Skor</p>
            <p className="text-sm leading-snug font-bold text-sr-ink-2">Muncul setelah semua subtes selesai</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold text-sr-amber-700">Total skor</p>
            <p className="text-3xl leading-none font-extrabold text-sr-ink tabular-nums">{history.totalSkor}</p>
          </div>
        )}
        <p className="text-right text-xs text-sr-muted">
          {isRunning ? "Dimulai" : "Selesai"}
          <br />
          <span className="font-semibold text-sr-ink-2">
            {new Date(doneAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </p>
      </div>

      <Button className="mt-auto w-full rounded-full" variant={isRunning ? "secondary" : "default"} asChild>
        {isRunning ? (
          <Link to="/tryout/$tryoutId" params={{ tryoutId: history.tryoutId }}>
            Lanjutkan Try Out <ArrowRightIcon weight="bold" />
          </Link>
        ) : (
          <Link to="/tryout/result/$sesiId" params={{ sesiId: history.id }}>
            Lihat Hasil <ArrowRightIcon weight="bold" />
          </Link>
        )}
      </Button>
    </article>
  );
}
