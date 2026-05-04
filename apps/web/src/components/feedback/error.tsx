import { FlagIcon, WarningOctagonIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { orpc } from "@/utils/orpc";

export default function ErrorComponent({ error }: { error: Error }) {
  const router = useRouter();

  const reportMutation = useMutation(orpc.feedback.create.mutationOptions());

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleReport = () => {
    reportMutation.mutate({
      category: "other",
      description: JSON.stringify({
        message: error.message,
        stack: error.stack,
      }),
      path: window.location.pathname,
    });
  };

  return (
    <Container className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <WarningOctagonIcon className="size-12 text-destructive" weight="fill" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-neutral-1000">Terjadi Kesalahan</h1>
        <p className="mt-2 max-w-md text-neutral-600">
          Maaf, sepertinya terjadi masalah saat memuat halaman ini. Silakan <strong>coba lagi</strong> atau hubungi
          bantuan jika masalah berlanjut.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 max-w-full overflow-auto rounded-lg bg-neutral-100 p-4 text-left text-xs">
            {error.message}
          </pre>
        )}
        <div className="mt-8 flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              router.invalidate();
            }}
          >
            Coba Lagi
          </Button>
          <Button
            variant="outline"
            isPending={reportMutation.isPending}
            onClick={handleReport}
            disabled={reportMutation.isSuccess}
          >
            {reportMutation.isPending && "Mengirim..."}
            {reportMutation.isSuccess && "Terkirim!"}
            {reportMutation.isError && "Gagal, coba lagi"}
            {!reportMutation.isPending && !reportMutation.isSuccess && !reportMutation.isError && (
              <>
                <FlagIcon /> Laporkan Masalah
              </>
            )}
          </Button>
          <Button
            onClick={() => {
              router.navigate({ to: "/" });
            }}
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </Container>
  );
}
