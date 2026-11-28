import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/** Penanda di dasar daftar: halaman berikutnya dimuat otomatis saat penanda ini mendekati layar. */
export function LoadMore({
  hasMore,
  isFetching,
  isError,
  onLoad,
}: {
  hasMore: boolean;
  isFetching: boolean;
  isError: boolean;
  onLoad: () => void;
}) {
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Saat gagal tidak dicoba otomatis, supaya server tidak ditembak terus-menerus.
    if (!sentinel.current || !hasMore || isFetching || isError) return;
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && onLoad(), {
      rootMargin: "600px",
    });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, isFetching, isError, onLoad]);

  if (!hasMore) return null;

  return (
    <div ref={sentinel} className="mt-6 flex justify-center">
      <Button variant="outline" disabled={isFetching} onClick={onLoad}>
        {isFetching ? "Memuat…" : isError ? "Gagal memuat, coba lagi" : "Muat lebih banyak"}
      </Button>
    </div>
  );
}

/**
 * Setelah kembali dari halaman detail, gulirkan daftar ke item yang tadi dibuka. Beri tiap item atribut
 * data-list-item, dan panggil fungsi yang dikembalikan saat item diklik.
 */
export function useReturnToItem(storageKey: string, ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const id = sessionStorage.getItem(storageKey);
    if (!id) return;
    // Ditunda sebentar supaya tidak ditimpa pengaturan posisi gulir bawaan router.
    const timer = window.setTimeout(() => {
      sessionStorage.removeItem(storageKey);
      document.querySelector(`[data-list-item="${CSS.escape(id)}"]`)?.scrollIntoView({ block: "center" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [storageKey, ready]);

  return (id: number) => sessionStorage.setItem(storageKey, String(id));
}

/**
 * Isi yang berat (misalnya pratinjau Tiptap) baru dirender saat mendekati layar. Tanpa ini, daftar berisi puluhan
 * soal membekukan halaman beberapa detik setiap kali dimuat atau dibuka kembali.
 */
export function WhenNearScreen({ children, className }: { children: React.ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (near || !box.current) return;
    const observer = new IntersectionObserver((entries) => entries[0]?.isIntersecting && setNear(true), {
      rootMargin: "300px",
    });
    observer.observe(box.current);
    return () => observer.disconnect();
  }, [near]);

  return (
    <div ref={box} className={className}>
      {near ? children : null}
    </div>
  );
}
