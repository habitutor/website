import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
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

  const [selectedUniv, setSelectedUniv] = React.useState<string>("");
  const [selectedJurusan, setSelectedJurusan] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<"rank" | "score">("score");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");

  const {
    data: universitasData,
    isPending: isPgPending,
    isError: isPgError,
    error: pgError,
  } = useQuery(orpc.tryout.passingGrade.queryOptions({ input: {} }));

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

  const passingGradeItems = React.useMemo<PassingGradeItem[]>(() => {
    if (!universitasData) return [];
    return (universitasData as UniversitasData[]).flatMap((univ) =>
      univ.programStudi.map((prodi) => ({
        id: `${univ.id}-${prodi.id}`,
        universitas: univ.namaUniv,
        rank: univ.rankUniv,
        jurusan: prodi.nama,
        score: prodi.passedGrade,
      })),
    );
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
          {isPgPending ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <Skeleton className="h-10 w-full sm:w-[200px]" />
                <Skeleton className="h-10 w-full sm:w-[200px]" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ) : isPgError ? (
            <TryoutErrorState message={getErrorMessage(pgError, "Gagal memuat data passing grade")} />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <select
                  value={selectedUniv}
                  onChange={(e) => setSelectedUniv(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-[200px]"
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
                  onChange={(e) => setSelectedJurusan(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-[200px]"
                >
                  <option value="">Semua Jurusan</option>
                  {uniqueJurusan.map((jurusan) => (
                    <option key={jurusan} value={jurusan}>
                      {jurusan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-hidden rounded-md border bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-blue-50/50">
                    <TableRow>
                      <TableHead className="font-semibold text-primary-300">Universitas</TableHead>
                      <TableHead
                        className="hidden cursor-pointer font-semibold text-primary-300 select-none hover:text-primary-400 sm:table-cell"
                        onClick={() => {
                          if (sortBy === "rank") setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                          else { setSortBy("rank"); setSortDirection("asc"); }
                        }}
                      >
                        Rank Univ {sortBy === "rank" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                      </TableHead>
                      <TableHead className="font-semibold text-primary-300">Jurusan</TableHead>
                      <TableHead
                        className="w-[100px] cursor-pointer font-semibold text-primary-300 select-none hover:text-primary-400"
                        onClick={() => {
                          if (sortBy === "score") setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                          else { setSortBy("score"); setSortDirection("desc"); }
                        }}
                      >
                        Score {sortBy === "score" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPassingGrade.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                          Tidak ada data passing grade yang sesuai.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPassingGrade.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.universitas}</TableCell>
                          <TableCell className="hidden sm:table-cell">{item.rank}</TableCell>
                          <TableCell>{item.jurusan}</TableCell>
                          <TableCell>{item.score}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="text-xs text-muted-foreground">
                Menampilkan {filteredPassingGrade.length} dari {passingGradeItems.length} data.
              </div>
            </div>
          )}
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

function TryoutCard({ tryout }: { tryout: TryoutListItem }) {
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
