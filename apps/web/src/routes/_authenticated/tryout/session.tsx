import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createMeta } from "@/lib/seo-utils";

export const Route = createFileRoute("/_authenticated/tryout/session")({
  head: () => ({
    meta: createMeta({
      title: "Mulai Tryout",
      description: "List jenis subtes tryout",
      noIndex: true,
    }),
  }),
  component: TryoutSessionPage,
});

const SUBTEST_LIST = [
  { id: 1, name: "Penalaran Induktif", questions: 10, duration: 10 },
  { id: 2, name: "Penalaran Deduktif", questions: 10, duration: 10 },
  { id: 3, name: "Penalaran Kuantitatif", questions: 10, duration: 10 },
  {
    id: 4,
    name: "Pengetahuan dan Pemahaman Umum",
    questions: 20,
    duration: 15,
  },
  { id: 5, name: "Pemahaman Bacaan dan Tulis", questions: 20, duration: 25 },
  { id: 6, name: "Pengetahuan Kuantitatif", questions: 20, duration: 20 },
  { id: 7, name: "Literasi Bahasa Indonesia", questions: 30, duration: 42.5 },
  { id: 8, name: "Literasi Bahasa Inggris", questions: 20, duration: 20 },
  { id: 9, name: "Penalaran Matematika", questions: 20, duration: 42.5 },
];

function TryoutSessionPage() {
  const navigate = useNavigate();
  const DEFAULT_TRYOUT_ID = process.env.NEXT_PUBLIC_DEFAULT_TRYOUT_ID || "";

  const startMutation = useMutation(
    orpc.student.tryout.start.mutationOptions({
      onSuccess: (data) => {
        toast.success("Tryout dimulai");
        if (data.sesiSubtesId && data.sesiId) {
          navigate({
            to: "/tryout/test",
            search: { sesiSubtesId: data.sesiSubtesId, sesiId: data.sesiId },
          });
        }
      },
      onError: (err) => {
        toast.error("Gagal memulai tryout", { description: () => <p>{err.message}</p> });
      },
    }),
  );

  return (
    <div className="flex w-full flex-col gap-6 pt-10">
      <Button
        variant="secondary"
        className="w-fit bg-[#3b5998] text-white hover:bg-[#3b5998]/90"
        onClick={() => navigate({ to: "/tryout" })}
      >
        <ArrowLeftIcon weight="bold" /> Kembali
      </Button>

      {/* Banner */}
      <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-xl bg-[#fde047] p-8 sm:flex-row sm:items-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-0 sm:text-3xl">Mulai Tryout Sekarang, Gratis!</h1>
        <div className="relative z-10">
          {/* Orange decorative block */}
          <div className="absolute -bottom-10 -left-10 -z-10 h-32 w-64 bg-[#f59e0b]" />
          <Button
            size="lg"
            className="bg-[#0284c7] font-semibold text-white hover:bg-[#0369a1]"
            onClick={() => startMutation.mutate({ tryoutId: DEFAULT_TRYOUT_ID })}
            disabled={startMutation.isPending || !DEFAULT_TRYOUT_ID}
          >
            {startMutation.isPending ? "Memulai..." : "Mulai Sekarang"} <ArrowRightIcon weight="bold" />
          </Button>
        </div>
      </div>

      {/* List Subtes */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-900">List Jenis Subtes</h2>
        <div className="overflow-hidden rounded-md border bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-[#e0f2fe]">
              <TableRow>
                <TableHead className="w-16 font-semibold text-gray-700">No</TableHead>
                <TableHead className="font-semibold text-gray-700">Nama Subtes</TableHead>
                <TableHead className="font-semibold text-gray-700">Jumlah Soal</TableHead>
                <TableHead className="font-semibold text-gray-700">Durasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SUBTEST_LIST.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-gray-600">{index + 1}</TableCell>
                  <TableCell className="text-gray-600">{item.name}</TableCell>
                  <TableCell className="text-gray-600">{item.questions}</TableCell>
                  <TableCell className="text-gray-600">{item.duration} Menit</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
