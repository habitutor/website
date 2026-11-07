import { PlayIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import YouTube from "react-youtube";

/** Tautan cadangan kalau pemutar di dalam halaman tidak jalan (mis. browser bawaan aplikasi). */
export function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Pemutar YouTube dengan sampul dulu: sebelum diketuk yang tampil thumbnail resolusi tinggi + tombol play,
 * jadi sampulnya tajam (embed YouTube di layar kecil memakai pratinjau buram) dan halaman lebih ringan.
 * Setelah diketuk, pemutar dimuat dan langsung mencoba memutar.
 */
export default function YouTubePlayer({ videoId }: { videoId: string }) {
  const [started, setStarted] = useState(false);
  const [thumbnail, setThumbnail] = useState(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);

  useEffect(() => {
    setStarted(false);
    setThumbnail(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
  }, [videoId]);

  if (!started) {
    const fallbackThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    return (
      <button
        type="button"
        onClick={() => setStarted(true)}
        aria-label="Putar video"
        className="group relative block size-full overflow-hidden rounded-xl bg-sr-ink"
      >
        <img
          src={thumbnail}
          alt=""
          // maxresdefault tidak selalu ada; YouTube lalu mengirim gambar abu-abu 120px, jadi pakai hqdefault.
          onLoad={(e) => {
            if (e.currentTarget.naturalWidth <= 120 && thumbnail !== fallbackThumbnail) setThumbnail(fallbackThumbnail);
          }}
          onError={() => thumbnail !== fallbackThumbnail && setThumbnail(fallbackThumbnail)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-linear-to-t from-sr-ink/50 via-transparent to-transparent" />
        <span className="absolute top-1/2 left-1/2 flex size-16 -translate-1/2 items-center justify-center rounded-full bg-white/95 text-sr-blue-600 shadow-sr-3 transition-transform duration-300 group-hover:scale-110 sm:size-20">
          <PlayIcon weight="fill" className="ml-1 size-7 sm:size-9" />
        </span>
      </button>
    );
  }

  return (
    <div className="size-full overflow-hidden rounded-xl bg-sr-ink">
      <YouTube
        videoId={videoId}
        className="size-full"
        iframeClassName="size-full"
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            // Di iPhone video diputar di dalam halaman, tidak dipaksa layar penuh.
            playsinline: 1,
            origin: window.location.origin,
          },
        }}
        onReady={(event) => event.target.playVideo()}
      />
    </div>
  );
}
