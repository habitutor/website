import { ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

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
  title: "Lorem ipsum dolor sit amet, consectetur.",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor.",
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

export const Announcement = ({ announcements }: { announcements?: AnnouncementItem[] }) => {
  const primaryAnnouncement = announcements?.find((item) => item.variant === "primary") ?? DUMMY_PRIMARY;
  const cashbackAnnouncement = CASHBACK;
  const cashbackCtaLink = CASHBACK.ctaLink || "/profile";

  return (
    <section className="w-full rounded-2xl border bg-neutral-100 p-4 md:p-10">
      <h2 className="mb-2 font-medium">Berita khusus untukmu</h2>
      <div className="flex w-full flex-col gap-4 md:flex-row md:gap-6">
        <div className="relative w-full space-y-1 overflow-hidden rounded-[10px] border border-secondary-700 bg-secondary-400 p-4 pb-6 md:w-[55%]">
          <h3 className="relative z-10 w-full font-bold md:text-[22px]">{primaryAnnouncement.title}</h3>
          <p className="relative z-10 w-full text-[10px] md:w-[70%] md:text-sm">{primaryAnnouncement.description}</p>
          <div className="absolute -right-10 -bottom-20 h-42 w-42 rounded-full border border-secondary-700 bg-secondary-600 md:right-0" />
          <div className="absolute right-2 bottom-23 h-8 w-8 rounded-full border border-secondary-700 bg-secondary-600 md:right-4 md:bottom-22 md:h-11 md:w-11" />
        </div>
        <div className="relative w-full space-y-1 overflow-hidden rounded-[10px] border border-red-200 bg-red-100 p-4 md:w-[45%]">
          <h3 className="relative z-10 font-bold md:text-[22px]">{cashbackAnnouncement.title}</h3>
          <p className="relative z-10 w-[50%] text-[10px] md:text-sm">{cashbackAnnouncement.description}</p>
          <img
            src="/avatar/announcement-avatar.webp"
            alt="avatar"
            className="absolute -right-15 -bottom-2 z-1 md:right-0"
          />
          <Button
            variant="default"
            size="icon"
            className="absolute right-4 bottom-4 z-10 bg-red-300 hover:bg-red-400"
            asChild
          >
            <Link to={cashbackCtaLink}>
              <ArrowRightIcon weight="bold" className="text-neutral-1000" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
