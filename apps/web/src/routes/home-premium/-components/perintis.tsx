import { PerintisCard } from "@/components/pricing/perintis-card";
import { MobileCarousel } from "@/components/pricing/mobile-carousel";
import { DATA } from "@/routes/home-premium/-components/data";

export function Perintis() {
  const perintisPlans = Object.values(DATA.perintis);
  // const classroomPlans = [DATA.classroom];
  const allPlans = [...perintisPlans];

  const colors = [
    {
      bg: "bg-tertiary-100",
      border: "border-tertiary-200",
    },
    {
      bg: "bg-secondary-100 border-secondary-200",
      border: "border-secondary-600",
    },
    {
      bg: "bg-[#C5F5DC]",
      border: "border-fourtiary-100",
    },
  ];

  const mobilePlanCards = allPlans.map((plan, index) => (
    <PerintisCard key={plan.label} data={plan} colors={colors[index]} />
  ));

  return (
    <div className="container mx-auto items-center gap-8 space-y-6 px-4 md:px-0">
      <div className="relative z-10 flex h-full flex-col items-center justify-end">
        <p className="text-center text-lg font-bold md:text-2xl">Perintis & Classroom</p>
        <p className="text-center text-sm md:text-lg">Cuman mau banyakin sumber soal? Paket ini solusinya</p>
      </div>
      {/* Main Plans Section */}
      <div className="w-full rounded-2xl border border-neutral-300 bg-neutral-100 p-6">
        <MobileCarousel items={mobilePlanCards} paginationLabel="Paket Belajar" />

        <div className="hidden w-full justify-center gap-6 md:flex md:flex-wrap lg:grid lg:grid-cols-3">
          {allPlans.map((plan, index) => (
            <PerintisCard key={plan.label} data={plan} colors={colors[index]} />
          ))}
        </div>
      </div>
    </div>
  );
}
