import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
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
  description: "Gunakan Kode Affiliate di profilmu untuk ajak teman bertumbuh bersama",
  variant: "cashback",
  ctaLink: "/profile",
  ctaLabel: "Lihat",
  order: 2,
};

export const Announcement = () => {
  const { data: dashboardContent } = useQuery(orpc.dashboard.content.queryOptions());
  const announcements = dashboardContent?.announcements;
  const primaryAnnouncement = announcements?.find((item) => item.variant === "primary") ?? DUMMY_PRIMARY;
  const cashbackAnnouncement = CASHBACK;
  const cashbackCtaLink = CASHBACK.ctaLink || "/profile";

  return (
    <SectionCard title="Tips SNBT khusus untukmu">
      <div className="flex w-full flex-col gap-4 md:flex-row md:gap-6">
        <div className="relative w-full sr-lift space-y-1 overflow-hidden rounded-sr-md sr-card-sun p-4 pb-6 md:w-[55%]">
          <h3 className="relative z-10 w-full font-bold md:text-[22px]">{primaryAnnouncement.title}</h3>
          <p className="relative z-10 w-full text-[10px] md:w-[70%] md:text-sm">{primaryAnnouncement.description}</p>
          <div className="absolute -right-10 -bottom-20 h-42 w-42 rounded-full bg-white/35 md:right-0" />
          <div className="absolute right-2 bottom-23 h-8 w-8 rounded-full bg-white/35 md:right-4 md:bottom-22 md:h-11 md:w-11" />
        </div>
        <div className="relative w-full sr-lift space-y-1 overflow-hidden rounded-sr-md border border-sr-orange-200 bg-linear-to-br from-sr-orange-100 to-white p-4 md:w-[45%]">
          <h3 className="relative z-10 font-bold md:text-[22px]">{cashbackAnnouncement.title}</h3>
          <p className="relative z-10 w-[50%] text-[10px] md:text-sm">{cashbackAnnouncement.description}</p>
          <img
            src="/avatar/announcement-avatar.webp"
            alt="avatar"
            className="absolute -right-15 -bottom-2 z-1 animate-sr-drift md:right-0"
          />
          <Button variant="default" size="icon" className="absolute right-4 bottom-4 z-10" asChild>
            <Link to={cashbackCtaLink}>
              <ArrowRightIcon weight="bold" />
            </Link>
          </Button>
        </div>
      </div>
    </SectionCard>
  );
};
