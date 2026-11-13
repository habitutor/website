import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orpc } from "@/utils/orpc";

/** Buka Zoom lewat server: tombol hanya berhasil di jendela waktu yang benar dan kehadiran tercatat. */
export function useJoinEvent() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.ptnTour.join.mutationOptions({
      onSuccess: async ({ zoomUrl }) => {
        window.open(zoomUrl, "_blank", "noopener,noreferrer");
        await queryClient.invalidateQueries({ queryKey: orpc.ptnTour.list.queryKey() });
      },
      onError: (error) => toast.error("Belum bisa join Zoom", { description: error.message }),
    }),
  );
}

/** Ambil link rekaman dari server (aturan akses diperiksa di sana), lalu buka di tab baru. */
export function useWatchRecording() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) =>
      queryClient.fetchQuery({ ...orpc.ptnTour.watch.queryOptions({ input: { slug } }), staleTime: 0 }),
    onSuccess: ({ recordingUrl }) => window.open(recordingUrl, "_blank", "noopener,noreferrer"),
    onError: (error) => toast.error("Rekaman belum bisa diputar", { description: error.message }),
  });
}
