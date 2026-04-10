import { Link } from "@tanstack/react-router";
import { BundlingCard } from "@/components/pricing/bundling-card";
import { MobileCarousel } from "@/components/pricing/mobile-carousel";
// import { TryOutCard } from "@/components/pricing/tryout-card";
import { DATA } from "./data";
import { Button } from "@/components/ui/button";

export function Pricing() {
  const { plans } = DATA.pricing;
  const planEntries = Object.values(plans);
  const mobilePlanEntries = planEntries.length > 0 ? [planEntries[planEntries.length - 1], ...planEntries.slice(0, -1)] : [];
  // const tryout = Object.values(DATA.pricing_tryout);

  const basicHeaderStyles = [
    "bg-tertiary-100 border-tertiary-200",
    "bg-tertiary-300 border-tertiary-400",
    "bg-tertiary-500 border-tertiary-600",
  ];
  const basicCircleStyles = [
    "bg-tertiary-100 border-tertiary-200",
    "bg-tertiary-300 border-tertiary-400",
    "bg-tertiary-500 border-tertiary-600",
  ];

  const mobilePlanCards = mobilePlanEntries.map((plan) => {
    const basicIndex = planEntries.findIndex((entry) => entry.label === plan.label);
    const isPremiumPlan = basicIndex === planEntries.length - 1;

    return isPremiumPlan ? (
      <BundlingCard
        key={plan.label}
        data={plan}
        variant="premium"
        span
        colors={{
          bg: "bg-primary-300",
          text: "text-neutral-100",
          price: "text-neutral-100",
          header: "bg-primary-500 border-neutral-1000",
          circle: "bg-primary-400 border-primary-500",
          button: "bg-primary-500 hover:bg-primary-600 text-neutral-100",
          checkBadge: "bg-secondary-200",
          medalBadge: "bg-secondary-700 text-neutral-100",
        }}
      />
    ) : (
      <BundlingCard
        key={plan.label}
        data={plan}
        variant="basic"
        colors={{
          header: basicHeaderStyles[basicIndex],
          circle: basicCircleStyles[basicIndex],
        }}
      />
    );
  });

  // const mobileTryoutCards = tryout.map((plan) => <TryOutCard key={plan.label} data={plan} />);

  return (
    <div className="flex border-2 border-secondary-100 bg-[#FFFCF3] py-16">
      <div className="container mx-auto items-center gap-8 space-y-11 px-4">
        <div className="space-y-2 text-center *:text-pretty">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Investasi Cerdas untuk Hasil yang <span className="text-primary-300">Maksimal</span>
          </h2>
          <p className="text-sm font-medium text-pretty md:text-lg">
            Dapatkan materi lengkap plus strategi rahasia dari kakak-kakak TOP PTN!
          </p>
        </div>

        {/* Main Plans Section */}
        <div className="w-full">
          <MobileCarousel
            items={mobilePlanCards}
            paginationLabel="Paket Belajar"
            viewportClassName="overflow-hidden px-8"
          />

          <div className="hidden w-full gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {planEntries.map((plan, index) =>
              index === planEntries.length - 1 ? (
                <BundlingCard
                  key={plan.label}
                  data={plan}
                  variant="premium"
                  span
                  colors={{
                    bg: "bg-primary-300",
                    text: "text-neutral-100",
                    price: "text-neutral-100",
                    header: "bg-primary-500 border-neutral-1000",
                    circle: "bg-primary-400 border-primary-500",
                    button: "bg-primary-500 hover:bg-primary-600 text-neutral-100",
                    checkBadge: "bg-secondary-200",
                    medalBadge: "bg-secondary-700 text-neutral-100",
                  }}
                />
              ) : (
                <BundlingCard
                  key={plan.label}
                  data={plan}
                  variant="basic"
                  colors={{
                    header: basicHeaderStyles[index],
                    circle: basicCircleStyles[index],
                  }}
                />
              ),
            )}
          </div>
        </div>

        {/* Paket Try Out Section */}
        {/* <div className="flex w-full flex-col items-center justify-center gap-11">
          <div className="flex h-11 w-full items-center justify-center rounded-2xl border border-[#FEE086] bg-[#FEEAAE] text-center *:text-pretty">
            <h3 className="text-base font-bold">Paket Try Out</h3>
          </div>

          <div className="w-full">
             <MobileCarousel items={mobileTryoutCards} paginationLabel="Paket Try Out" viewportClassName="overflow-hidden px-8" />

            <div className="hidden w-full gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {tryout.map((plan) => (
                <TryOutCard key={plan.label} data={plan} />
              ))}
            </div>
          </div>
        </div> */}

        <Link to={"/home-premium"} className="flex items-center justify-center">
          <Button>Lihat Semua Paket Kami!</Button>
        </Link>
      </div>
    </div>
  );
}
