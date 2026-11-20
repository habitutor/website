import { cn } from "@/lib/utils";

// Tepi gambar asli terpotong lurus. Masker memudarkan atas dan kedua sisinya supaya ilustrasi menyatu dengan
// warna dasar halaman, tanpa garis potong yang terlihat.
const EDGE_FADE = {
  maskImage:
    "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent), linear-gradient(to bottom, transparent, #000 45%)",
  maskComposite: "intersect",
  WebkitMaskImage:
    "linear-gradient(to right, transparent, #000 14%, #000 86%, transparent), linear-gradient(to bottom, transparent, #000 45%)",
  WebkitMaskComposite: "source-in",
} as const;

/**
 * Latar kampus tetap di dasar layar halaman siswa, seperti tampilan awal dashboard. Posisinya fixed di belakang
 * konten (z-0), jadi selalu terlihat di dasar layar saat menggulir dan tidak pernah menimpa kartu atau teks.
 * Konten halaman harus berada di atasnya (relative z-10). Gambar memakai latar transparan.
 */
export function CampusSkyline({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-0 select-none", className)}>
      <div className="mx-auto aspect-1440/430 w-full max-w-[900px] overflow-hidden" style={EDGE_FADE}>
        <img
          src="/dashboard-background.webp"
          alt=""
          width={1440}
          height={673}
          loading="lazy"
          decoding="async"
          className="block size-full object-cover object-bottom opacity-85"
        />
      </div>
    </div>
  );
}
