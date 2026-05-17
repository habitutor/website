import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createMeta } from "@/lib/seo-utils";

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

function TryoutPage() {
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
      <Tabs defaultValue="guideline" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="guideline">Guideline</TabsTrigger>
          <TabsTrigger value="passing_grade">Passing Grade</TabsTrigger>
          <TabsTrigger value="hasil">Hasil Tryout</TabsTrigger>
        </TabsList>

        {/* GUIDELINE TAB */}
        <TabsContent value="guideline">
          <div className="flex flex-col gap-6 rounded-xl border bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl text-primary-300">Petunjuk Pengerjaan Try Out</h2>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-yellow-600">Aturan Pengerjaan:</p>
                <ul className="ml-5 list-disc space-y-1">
                  <li>Setiap subtes hanya 1x</li>
                  <li>Waktu habis / klik Selesai , tidak bisa diulang</li>
                  <li>Pembahasan terbuka setelah semua subtes selesai</li>
                </ul>
                <p className="mt-2 text-sm">
                  ⚠️ <span className="italic">Catatan:</span> timer <strong>tetap berjalan</strong>.
                </p>
              </div>

              <div>
                <p className="flex items-center gap-1 font-semibold text-primary-300">💡 Tips</p>
                <ul className="mt-1 ml-5 list-disc space-y-1">
                  <li>Pastikan internet & baterai aman</li>
                  <li>Tandai soal ragu untuk dikerjakan nanti</li>
                  <li>Atur waktu, jangan terlalu lama di satu soal</li>
                </ul>
              </div>
            </div>

            <div className="mt-2">
              <p className="text-lg font-medium">Siap? Yuk mulai tryoutnya! Semangat 💪🔥</p>
            </div>

            <Button size="lg" className="w-full text-base font-semibold md:w-auto" asChild>
              <Link to="/tryout/session">
                Mulai Tryout Sekarang <ArrowRightIcon weight="bold" />
              </Link>
            </Button>

            <div className="mt-2 border-t pt-6 text-sm">
              <p className="mb-3 font-semibold">Ingin akses pembahasan lebih lengkap?</p>
              <Button
                variant="outline"
                className="hover:bg-primary-50 w-fit border-primary-300 text-primary-300"
                asChild
              >
                <Link to="/premium">
                  TryOut Premium <ArrowUpRightIcon weight="bold" />
                </Link>
              </Button>
            </div>
          </div>
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
                    <TableHead className="w-[100px] font-semibold text-primary-300"></TableHead>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
