import { ArrowRightIcon, CaretDownIcon, LightbulbFilamentIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";
import { SectionCard } from "./section-card";

type AnnouncementItem = {
  id: number;
  title: string;
  description: string;
  variant: "primary" | "cashback";
  ctaLink?: string | null;
  ctaLabel?: string | null;
  order: number;
};

const DUMMY_PRIMARY: AnnouncementItem = {
  id: 1,
  title: "Seleksi Semakin Kompetitif",
  description:
    "Dengan jumlah lulusan SMA yang besar dan daya tampung PTN terbatas, persaingan SNBT dan Ujian Mandiri diperkirakan tetap ketat dalam beberapa tahun ke depan. Bagi calon mahasiswa, memahami data, rasio persaingan, dan karakter seleksi menjadi kunci untuk meningkatkan peluang. Keberhasilan masuk PTN tidak hanya ditentukan nilai tinggi, tetapi juga strategi yang tepat dan kesiapan mental.",
  variant: "primary",
  ctaLink: null,
  ctaLabel: null,
  order: 1,
};

const CASHBACK: AnnouncementItem = {
  id: 2,
  title: "Dapatkan cashback 25%!",
  description: "Bagikan kode affiliate di profilmu. Temanmu ikut belajar, kamu dapat cashback.",
  variant: "cashback",
  ctaLink: "/profile",
  ctaLabel: "Lihat kode affiliate",
  order: 2,
};

// Deskripsi panjang dipotong dulu supaya kartu tetap rapi; siswa bisa membuka sisanya.
const LONG_DESCRIPTION = 200;

export const Announcement = () => {
  const { data: dashboardContent } = useQuery(orpc.dashboard.content.queryOptions());
  const announcements = dashboardContent?.announcements;
  const primaryAnnouncement = announcements?.find((item) => item.variant === "primary") ?? DUMMY_PRIMARY;
  const cashbackCtaLink = CASHBACK.ctaLink || "/profile";
  const [expanded, setExpanded] = useState(false);
  const isLong = primaryAnnouncement.description.length > LONG_DESCRIPTION;
  const primaryCta = primaryAnnouncement.ctaLink;

  return (
    <SectionCard title="Tips SNBT khusus untukmu">
      <div className="grid w-full gap-4 lg:grid-cols-5">
        <article className="group relative sr-lift overflow-hidden rounded-sr-xl border border-sr-sun-200 bg-linear-to-br from-sr-cream via-white to-sr-sun-100 p-5 shadow-sr-1 md:p-7 lg:col-span-3">
          <div className="pointer-events-none absolute -top-16 -right-16 size-44 rounded-full bg-sr-sun-200/50" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-sr-sm bg-sr-sun-500 text-sr-ink shadow-sr-sun transition-transform duration-500 ease-sr-spring motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-12">
                <LightbulbFilamentIcon weight="fill" className="size-6" />
              </span>
              <p className="text-sm font-bold text-sr-amber-700">Tips minggu ini</p>
            </div>
            <h3 className="mt-4 text-xl leading-snug font-extrabold text-balance text-sr-ink md:text-2xl md:text-left">
              {primaryAnnouncement.title}
            </h3>
            <p
              className={`mt-2 max-w-2xl text-[15px] leading-7 text-pretty text-sr-ink-2 md:max-w-none ${isLong && !expanded ? "line-clamp-4" : ""}`}
            >
              {primaryAnnouncement.description}
            </p>

            {(isLong || primaryCta) && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {isLong && (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-sr-sun-200 bg-white px-4 py-2 text-sm font-bold text-sr-ink shadow-sr-1 transition-colors hover:border-sr-sun-400"
                    aria-expanded={expanded}
                  >
                    {expanded ? "Tutup" : "Baca selengkapnya"}
                    <CaretDownIcon
                      weight="bold"
                      className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
                {primaryCta && (
                  <Button variant="darkBlue" className="rounded-full" asChild>
                    <a
                      href={primaryCta}
                      {...(primaryCta.startsWith("/") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {primaryAnnouncement.ctaLabel || "Selengkapnya"} <ArrowRightIcon weight="bold" />
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </article>

        <article className="group relative flex min-h-56 sr-lift flex-col overflow-hidden rounded-sr-xl sr-card-blue p-5 md:p-7 lg:col-span-2">
          <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 -left-12 size-44 rounded-full bg-white/5" />
          <div className="relative mb-6">
            <p className="text-sm font-semibold text-white/80">Ajak teman belajar bareng</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="text-6xl leading-none font-extrabold text-sr-sun-400">25%</span>
              <span className="text-lg font-bold text-white">cashback</span>
            </p>
            <p className="mt-3 max-w-[62%] text-sm leading-relaxed text-white/85 sm:max-w-none sm:pr-28 md:pr-32 lg:pr-36">{CASHBACK.description}</p>
          </div>
          <Button variant="secondary" className="sr-sheen relative z-10 mt-auto w-fit rounded-full" asChild>
            <Link to={cashbackCtaLink}>
              {CASHBACK.ctaLabel} <ArrowRightIcon weight="bold" />
            </Link>
          </Button>
          <img
            src="/avatar/avatar-premium.webp"
            alt=""
            className="pointer-events-none absolute -right-4 bottom-0 h-28 w-auto object-contain transition-transform duration-500 ease-sr-spring motion-safe:group-hover:-translate-y-2 md:h-36"
          />
        </article>
      </div>
    </SectionCard>
  );
};
