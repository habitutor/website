import { ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LastContentViewedCard } from "@/components/classes";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const Announcement = () => {
  const { data, isPending } = useQuery(orpc.subtest.getRecentViews.queryOptions());

  if (isPending) {
    return (
      <section className="border p-4 md:p-10 bg-neutral-100 rounded-2xl">
        <h2 className="mb-2 font-medium">Berita khusus untukmu</h2>
        <div className="animate-pulse space-y-2">
          <div className="h-32 rounded-md bg-neutral-200" />
          <div className="h-32 rounded-md bg-neutral-200" />
        </div>
      </section>
    );
  }

  return (
    <section className="border p-4 md:p-10 bg-neutral-100 rounded-2xl w-full">
      <h2 className="mb-2 font-medium">Berita khusus untukmu</h2>
      <div className="flex flex-col md:flex-row md:gap-6 gap-4 w-full">
        <div className="md:w-[55%] w-full p-4 pb-6 bg-secondary-400 border border-secondary-700 rounded-[10px] relative overflow-hidden space-y-1">
          <h3 className="font-bold md:text-[22px] w-full relative z-10">Lorem ipsum dolor sit amet, consectetur.</h3>
          <p className="md:text-sm text-[10px] w-fulll md:w-[70%] relative z-10">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor.</p>
          <div className="h-42 w-42 bg-secondary-600 border border-secondary-700 rounded-full -bottom-20 md:right-0 -right-10 absolute" />
          <div className="md:h-11 h-8 md:w-11 w-8 bg-secondary-600 border border-secondary-700 rounded-full bottom-23 md:bottom-22 md:right-4 right-2 absolute" />
        </div>
        <div className="md:w-[45%] w-full bg-red-100 border border-red-200 rounded-[10px] p-4 relative overflow-hidden space-y-1">
          <h3 className="relative font-bold md:text-[22px] z-10">Dapatkan cashback 25%!</h3>
          <p className="relative md:text-sm text-[10px] w-[50%] z-10">Gunakan Kode Affiliate di profilmu untuk ajak teman bertumbuh bersama</p>
          <img src="/avatar/announcement-avatar.webp" alt="avatar" className="absolute -bottom-2 -right-15 md:right-0 z-1" />
          <Button variant="default" size="icon" className="z-10 bg-red-300 hover:bg-red-400 absolute right-4 bottom-4" asChild>
            <Link to="/profile">
              <ArrowRightIcon weight="bold" className="text-neutral-1000" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
