import { cn } from "@/lib/utils";

// Sisi kiri-kanan dipudarkan tipis supaya tepi gambar tidak terlihat sebagai garis potong; atas dipudarkan
// pendek supaya atap tetap terlihat, bawah sedikit karena tepi bawah gambar aslinya bergerigi.
const EDGE_FADE = {
  maskImage:
    "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent), linear-gradient(to bottom, transparent, #000 22%, #000 92%, transparent)",
  maskComposite: "intersect",
  WebkitMaskImage:
    "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent), linear-gradient(to bottom, transparent, #000 22%, #000 92%, transparent)",
  WebkitMaskComposite: "source-in",
} as const;

/**
 * Langit halaman siswa, pasangan `CampusSkyline`. Diam di layar (tidak ikut menggulir), jadi di posisi gulir mana
 * pun kartu selalu dibingkai pemandangan yang sama: biru di atas layar, krem tipis di tengah tempat konten dibaca,
 * biru muda di dasar yang menyambung ke gedung. Lingkaran mengulang lingkaran di ilustrasi kampus; yang di tengah
 * hanya di tepi layar (setengahnya keluar) supaya tidak berada di belakang teks.
 */
const CIRCLE = "absolute rounded-full border border-sky-200/80 bg-sky-100/55";

export function CampusSky({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none", className)}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, #cfdfff 0%, #e2ebff 22%, #fff8ec 50%, #fff8ec 68%, #e6eeff 100%)",
        }}
      />
      {/* Semua lingkaran menempel di tepi layar dengan setengahnya keluar, satu gaya, ukuran mengecil ke bawah. */}
      <div className={`${CIRCLE} top-32 -right-36 size-80`} />
      <div className={`${CIRCLE} top-[38%] -left-32 hidden size-64 md:block`} />
      <div className={`${CIRCLE} top-[58%] -right-24 hidden size-48 md:block`} />
    </div>
  );
}

/**
 * Cakrawala kampus di dasar layar halaman siswa. Diam di layar di belakang konten, jadi tidak menambah tinggi
 * halaman dan kartu selalu di depannya. Tingginya dibatasi supaya tidak memakan layar, dan mulai tablet gambar
 * tampil utuh (lebarnya mengikuti tinggi) supaya atap tidak terpotong. Di HP gambar dipotong ke gedung tinggi
 * supaya tidak mengecil jadi garis tipis.
 */
export function CampusSkyline({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-40 overflow-hidden select-none md:h-[min(42vh,26rem)] 2xl:h-[min(44vh,30rem)]",
        className,
      )}
    >
      <img
        src="/kampus-biru.webp"
        alt=""
        width={1440}
        height={563}
        decoding="async"
        style={EDGE_FADE}
        className="mx-auto block size-full object-cover object-[78%_100%] md:w-auto md:max-w-none"
      />
    </div>
  );
}
