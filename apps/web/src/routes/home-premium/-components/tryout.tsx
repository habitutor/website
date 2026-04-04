import { TryOutCard } from "@/components/pricing/tryout-card";
import { MobileCarousel } from "@/components/pricing/mobile-carousel";
import { DATA } from "@/routes/home-premium/-components/data";

export function Tryout() {
  const tryout = Object.values(DATA.pricing_tryout);

  const mobilePlanCards = tryout.map((tryout) => <TryOutCard key={tryout.label} data={tryout} />);

  return (
    <div className="container mx-auto items-center gap-8 space-y-6 px-4 md:px-0">
      <div className="relative z-10 flex h-full flex-col items-center justify-end">
        <p className="text-center text-lg font-bold md:text-2xl">Paket Try Out</p>
        <p className="text-center text-sm md:text-lg">
          Mau ngerasain soal asli SNBT langsung? Cobain simulasi di Habitutor!
        </p>
      </div>
      {/* Main Plans Section */}
      <div className="w-full rounded-2xl border border-neutral-300 bg-neutral-100 p-6">
        <MobileCarousel items={mobilePlanCards} paginationLabel="Paket Belajar" />

        <div className="hidden w-full justify-center gap-6 md:flex md:flex-wrap lg:grid lg:grid-cols-3">
          {tryout.map((tryout) => (
            <TryOutCard key={tryout.label} data={tryout} />
          ))}
        </div>
      </div>
    </div>
  );
}
