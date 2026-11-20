import { cn } from "@/lib/utils";

// Tepi gambar asli terpotong lurus (gedung kiri dan kanan). Masker memudarkan keempat tepinya supaya
// ilustrasi menyatu dengan warna dasar halaman, tanpa garis potong yang terlihat.
const EDGE_FADE = {
  maskImage:
    "linear-gradient(to right, transparent, #000 16%, #000 84%, transparent), linear-gradient(to bottom, transparent, #000 14%, #000 80%, transparent)",
  maskComposite: "intersect",
  WebkitMaskImage:
    "linear-gradient(to right, transparent, #000 16%, #000 84%, transparent), linear-gradient(to bottom, transparent, #000 14%, #000 80%, transparent)",
  WebkitMaskComposite: "source-in",
} as const;

/**
 * Ilustrasi kampus di dasar halaman siswa. Fungsinya memberi identitas pada dasar halaman yang polos dan
 * mengingatkan tujuan belajar (masuk PTN). Ia berada di alur halaman setelah konten, jadi tidak pernah berada
 * di belakang teks, dan mt-auto menempelkannya ke dasar layar pada halaman yang pendek.
 * Gambar memakai latar transparan sehingga menyatu dengan warna dasar halaman.
 */
export function CampusSkyline({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none mt-auto w-full select-none", className)}>
      <div className="mx-auto aspect-1440/620 w-full max-w-[1000px] overflow-hidden" style={EDGE_FADE}>
        <img
          src="/dashboard-background.webp"
          alt=""
          width={1440}
          height={673}
          loading="lazy"
          decoding="async"
          className="block size-full object-cover object-bottom"
        />
      </div>
    </div>
  );
}
