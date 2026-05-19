import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { ArrowRightIcon, BookOpenIcon, ClockIcon, ListNumbersIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/tryout/")({
  head: () => ({
    meta: createMeta({
      title: "Tryout UTBK",
      description: "Yuk belajar bersama untuk sukses dalam UTBK!",
      noIndex: true,
    }),
  }),
  component: TryoutPage,
});

const PASSING_GRADE_DATA = [
  {
    id: 1,
    universitas: "Universitas Indonesia",
    rank: 1,
    jurusan: "Ilmu Komputer",
    score: 744,
  },
  {
    id: 2,
    universitas: "Universitas Indonesia",
    rank: 2,
    jurusan: "Pendidikan Dokter",
    score: 729,
  },
  {
    id: 3,
    universitas: "Institut Teknologi Bandung",
    rank: 1,
    jurusan: "Sekolah Teknik Elektro dan Informatika (STEI)",
    score: 755,
  },
  {
    id: 4,
    universitas: "Institut Teknologi Bandung",
    rank: 2,
    jurusan: "Fakultas Teknik Pertambangan dan Perminyakan (FTTM)",
    score: 730,
  },
  {
    id: 5,
    universitas: "Universitas Gadjah Mada",
    rank: 1,
    jurusan: "Kedokteran",
    score: 733,
  },
  {
    id: 6,
    universitas: "Universitas Gadjah Mada",
    rank: 2,
    jurusan: "Ilmu Hubungan Internasional",
    score: 698,
  },
  {
    id: 7,
    universitas: "Universitas Padjadjaran",
    rank: 1,
    jurusan: "Ilmu Komunikasi",
    score: 685,
  },
  {
    id: 8,
    universitas: "Institut Teknologi Sepuluh Nopember",
    rank: 1,
    jurusan: "Teknik Informatika",
    score: 712,
  },
  {
    id: 9,
    universitas: "Universitas Diponegoro",
    rank: 1,
    jurusan: "Hukum",
    score: 680,
  },
  {
    id: 10,
    universitas: "Universitas Airlangga",
    rank: 1,
    jurusan: "Manajemen",
    score: 672,
  },
];

type TryoutListItem = {
  id: string;
  judul: string;
  deskripsi: string | null;
  totalSubtes: number;
  totalSoal: number;
  totalDurasi: number;
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function TryoutPage() {
  const { data: tryoutsData, error, isError, isPending } = useQuery(orpc.tryout.list.queryOptions({ input: {} }));
  const tryouts = asArray<TryoutListItem>(tryoutsData);

  return (
    <div className="flex w-full flex-col gap-6 pt-10">
      {/* Banner */}
      <div className="relative flex w-full flex-row overflow-hidden rounded-xl bg-orange-200">
        <div className="relative h-32 w-32 shrink-0 bg-yellow-400/20 sm:h-40 sm:w-48">
          <Image
            src="/avatar/tutorial-avatar.webp"
            alt="TryOut Mascot"
            layout="constrained"
            width={300}
            height={400}
            className="absolute -bottom-4 -left-4 h-[120%] w-auto object-contain sm:bottom-0 sm:left-0"
          />
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 p-4 sm:p-6 lg:p-8">
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">TryOut UTBK</h1>
          <p className="text-sm font-medium sm:text-base">Yuk belajar bersama untuk sukses dalam UTBK!</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="daftar_tryout" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="daftar_tryout">Daftar Tryout</TabsTrigger>
          <TabsTrigger value="passing_grade">Passing Grade</TabsTrigger>
          <TabsTrigger value="hasil">Hasil Tryout</TabsTrigger>
        </TabsList>

        {/* DAFTAR TRYOUT TAB */}
        <TabsContent value="daftar_tryout">
          {isPending ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <TryoutErrorState message={getErrorMessage(error, "Gagal memuat daftar tryout")} />
          ) : tryouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 shadow-sm">
              <Image
                src="/avatar/tutorial-avatar.webp"
                alt="No Tryouts"
                width={120}
                height={120}
                className="mb-4 h-24 w-24 object-contain opacity-50 sepia"
              />
              <h3 className="mb-2 text-lg font-bold text-gray-700">Belum Ada Tryout Tersedia</h3>
              <p className="text-sm text-muted-foreground">Tryout akan segera hadir. Nantikan ya!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tryouts.map((tryout) => (
                <TryoutCard key={tryout.id} tryout={tryout} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* PASSING GRADE TAB */}
        <TabsContent value="passing_grade">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-[200px]">
                <option value="">Universitas</option>
                <option value="ui">Universitas Indonesia</option>
                <option value="itb">Institut Teknologi Bandung</option>
                <option value="ugm">Universitas Gadjah Mada</option>
              </select>
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-[200px]">
                <option value="">Jurusan</option>
                <option value="cs">Ilmu Komputer</option>
                <option value="is">Sistem Informasi</option>
                <option value="med">Kedokteran</option>
              </select>
            </div>

            <div className="overflow-hidden rounded-md border bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-blue-50/50">
                  <TableRow>
                    <TableHead className="font-semibold text-primary-300">Universitas</TableHead>
                    <TableHead className="hidden font-semibold text-primary-300 sm:table-cell">Rank ↑</TableHead>
                    <TableHead className="font-semibold text-primary-300">Jurusan</TableHead>
                    <TableHead className="w-[100px] font-semibold text-primary-300" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PASSING_GRADE_DATA.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.universitas}</TableCell>
                      <TableCell className="hidden sm:table-cell">{item.rank}</TableCell>
                      <TableCell>{item.jurusan}</TableCell>
                      <TableCell>{item.score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-xs text-muted-foreground">0 of {PASSING_GRADE_DATA.length} row(s) selected.</div>
          </div>
        </TabsContent>

        {/* HASIL TRYOUT TAB */}
        <TabsContent value="hasil">
          <HistoryTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function TryoutErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 text-center shadow-sm">
      <Image
        src="/avatar/tutorial-avatar.webp"
        alt="Gagal memuat tryout"
        width={120}
        height={120}
        className="mb-4 h-24 w-24 object-contain opacity-50 sepia"
      />
      <h3 className="mb-2 text-lg font-bold text-gray-700">Gagal Memuat Data</h3>
      <p className="max-w-md px-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function TryoutCard({
  tryout,
}: {
  tryout: TryoutListItem;
}) {
  return (
    <div className="group flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary-300/50 hover:shadow-md">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-300">{tryout.judul}</h3>
        {tryout.deskripsi && <p className="line-clamp-2 text-sm text-muted-foreground">{tryout.deskripsi}</p>}
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <BookOpenIcon className="size-4" />
          {tryout.totalSubtes} Subtes
        </span>
        <span className="flex items-center gap-1">
          <ListNumbersIcon className="size-4" />
          {tryout.totalSoal} Soal
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon className="size-4" />
          {tryout.totalDurasi} Menit
        </span>
      </div>

      <Button className="w-full" asChild>
        <Link to="/tryout/$tryoutId" params={{ tryoutId: tryout.id }}>
          Lihat Detail <ArrowRightIcon weight="bold" />
        </Link>
      </Button>
    </div>
  );
}

type HistoryItem = {
  id: string;
  tryoutId: string;
  judul: string;
  status: "berjalan" | "selesai" | "expired";
  totalSkor: number;
  mulaiAt: Date;
  selesaiAt: Date | null;
};

function HistoryTabContent() {
  const { data: historyData, error, isError, isPending } = useQuery(orpc.tryout.history.queryOptions({ input: {} }));
  const history = asArray<HistoryItem>(historyData);

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <TryoutErrorState message={getErrorMessage(error, "Gagal memuat riwayat tryout")} />;
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 md:py-20">
        <Image
          src="/avatar/tutorial-avatar.webp"
          alt="No Results"
          width={150}
          height={150}
          className="mb-6 h-32 w-32 object-contain sepia"
        />
        <h3 className="mb-12 text-2xl font-bold text-gray-800">Belum Ada Hasil Tryout</h3>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:w-[800px]">
          <div className="flex flex-col justify-between gap-6 rounded-xl bg-[#6ee7b7] p-6 text-green-950">
            <p className="text-xl font-bold lg:w-[80%]">Mulai Tryout Sekarang, Gratis!</p>
            <Button className="w-fit self-end bg-[#064e3b] text-white hover:bg-[#064e3b]/90">
              Mulai Sekarang <ArrowRightIcon weight="bold" />
            </Button>
          </div>

          <div className="flex flex-col justify-between gap-6 rounded-xl bg-[#818cf8] p-6 text-indigo-950">
            <div>
              <p className="mb-1 text-sm font-medium">Akses Pembahasan Dengan</p>
              <p className="text-xl font-bold">Tryout Premium</p>
            </div>
            <Button className="w-fit self-end bg-[#312e81] text-white hover:bg-[#312e81]/90" asChild>
              <Link to="/premium">
                Akses TryOut Premium <ArrowRightIcon weight="bold" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {history.map((h: HistoryItem) => (
        <HistoryCard key={h.id} history={h} />
      ))}
    </div>
  );
}

function HistoryCard({ history }: { history: HistoryItem }) {
  const isSelesai = history.status === "selesai";

  return (
    <div className="group flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-primary-300/50 hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="truncate pr-2 text-lg font-bold text-gray-900" title={history.judul}>
          {history.judul}
        </h3>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            isSelesai
              ? "bg-green-100 text-green-700"
              : history.status === "berjalan"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {isSelesai ? "Completed" : history.status === "berjalan" ? "On Progress" : "Expired"}
        </span>
      </div>

      <div className="mt-2">
        <p className="text-sm text-muted-foreground">Total Score</p>
        <p className="text-2xl font-bold text-gray-900">{history.totalSkor}</p>
      </div>

      <Button
        className={`mt-2 w-full ${!isSelesai ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-primary-300 hover:bg-primary-400"}`}
        asChild
      >
        {isSelesai ? (
          <Link to="/tryout/result/$sesiId" params={{ sesiId: history.id }}>
            Lihat Detail
          </Link>
        ) : (
          <Link to="/tryout/session" search={{ tryoutId: history.tryoutId }}>
            Lanjut Tes
          </Link>
        )}
      </Button>
    </div>
  );
}
