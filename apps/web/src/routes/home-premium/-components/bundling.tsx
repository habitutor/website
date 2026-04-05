import { BundlingCard } from "@/components/pricing/bundling-card";
import { MobileCarousel } from "@/components/pricing/mobile-carousel";
import { DATA } from "@/routes/home-premium/-components/data";

export function Bundling() {
  const premiumPlans = Object.values(DATA.premium);
  const basicPlans = Object.values(DATA.basic);

  const premiumColors = [
    {
      bg: "bg-primary-300 border-primary-400",
      border: "border-primary-400",
      text: "text-neutral-100",
      price: "text-secondary-200",
      promo: "text-red-100",
      header: "bg-primary-500 border-neutral-1000",
      circle: "bg-primary-400 border-primary-500",
      button: "bg-primary-500 hover:bg-primary-600 text-neutral-100 border-neutral-1000",
      checkBadge: "bg-background text-secondary-1000",
      medalBadge: "bg-secondary-700 text-neutral-100",
      divider: "border-primary-100",
    },
    {
      bg: "bg-secondary-400 border-secondary-600",
      border: "border-secondary-600",
      text: "text-neutral-1000",
      price: "text-neutral-1000",
      promo: "text-red-500",
      header: "bg-secondary-900 border-secondary-1000",
      circle: "bg-secondary-500 border-secondary-600",
      button: "bg-secondary-900 hover:bg-secondary-1000 text-neutral-100 border-neutral-1000",
      checkBadge: "bg-primary-200",
      medalBadge: "bg-primary-400 text-neutral-100",
      divider: "border-neutral-1000",
    },
  ];

  const basicHeaderStyles = ["bg-tertiary-100 border-tertiary-200", "bg-tertiary-300 border-tertiary-400"];
  const basicCircleStyles = ["bg-tertiary-100 border-tertiary-200", "bg-tertiary-300 border-tertiary-400"];

  const mobilePlanCards = [
    ...premiumPlans.map((plan, index) => (
      <BundlingCard key={plan.label} data={plan} variant="premium" span={index === 0} colors={premiumColors[index]} />
    )),
    ...basicPlans.map((plan, index) => (
      <BundlingCard
        key={plan.label}
        data={plan}
        variant="basic"
        colors={{
          header: basicHeaderStyles[index],
          circle: basicCircleStyles[index],
        }}
      />
    )),
  ];

  return (
    <div className="container mx-auto items-center gap-8 space-y-11 px-4 md:px-0">
      {/* Main Plans Section */}
      <div className="w-full rounded-2xl border border-neutral-300 bg-neutral-100 p-6">
        <MobileCarousel items={mobilePlanCards} paginationLabel="Paket Belajar" />

        <div className="hidden w-full justify-center gap-6 sm:grid md:grid-cols-2 xl:grid-cols-4">
          {premiumPlans.map((plan, index) => (
            <BundlingCard
              key={plan.label}
              data={plan}
              variant="premium"
              span={index === 0}
              colors={premiumColors[index]}
            />
          ))}
          {basicPlans.map((plan, index) => (
            <BundlingCard
              key={plan.label}
              data={plan}
              variant="basic"
              colors={{
                header: basicHeaderStyles[index],
                circle: basicCircleStyles[index],
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
