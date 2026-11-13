import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { client, orpc } from "@/utils/orpc";

/** Pengaturan pusat (link channel WA, teks promo) yang sama untuk semua event. */
export function usePtnTourSettings() {
  return useQuery({ ...orpc.ptnTour.settings.queryOptions(), staleTime: 5 * 60_000 });
}

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

/**
 * Ambil link rekaman dari server (aturan akses diperiksa di sana), lalu buka di tab baru.
 * Kalau akses ditolak karena masa gratis habis atau khusus Premium, tampilkan ajakan upgrade (bukan hanya galat).
 */
export function useWatchRecording() {
  const [locked, setLocked] = useState<string | null>(null);
  const mutation = useMutation({
    // Lewat klien langsung (bukan cache query) supaya galat akses tidak memunculkan toast global ganda.
    mutationFn: (slug: string) => client.ptnTour.watch({ slug }),
    onSuccess: ({ recordingUrl }) => window.open(recordingUrl, "_blank", "noopener,noreferrer"),
    onError: (error) => {
      const message = error.message ?? "";
      if (/premium|berakhir/i.test(message)) setLocked(message);
      else toast.error("Rekaman belum bisa diputar", { description: message });
    },
  });
  return { ...mutation, locked, closeLocked: () => setLocked(null) };
}
