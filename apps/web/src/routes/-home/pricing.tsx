import { ArrowRightIcon, MedalIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui/container";
import { DATA } from "./data";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Image } from "@unpic/react";

export function Pricing() {
  const { title, subtitle, starter, premium } = DATA.pricing;

  return (
    <Container>
      <div className="text-center mb-4">
        <h1 className="font-bold text-2xl">{title}</h1>
        <p className="text-sm font-medium">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-6">
        <StarterCard data={starter} />
        <PremiumCard data={premium} />
      </div>
    </Container>
  );
}

function StarterCard({ data }: { data: typeof DATA.pricing.starter }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
      {/* Top */}
      <div className="relative z-1">
        <h3 className="font-medium text-base">{data.label}</h3>
        <p className="font-bold text-4xl text-primary-300">{data.price}</p>
      </div>

      {/* Bottom */}
      <div className="relative z-1">
        <ul className="mt-4 space-y-2">
          {data.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <MedalIcon size={16} />
              <span className="text-sm whitespace-pre-wrap">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-end -mt-8">
          <Link
            to="/"
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "",
            )}
          >
            {data.cta}
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>

      <div className="absolute h-[140%] bg-tertiary-100 rounded-full z-0 aspect-square right-0 top-0  -translate-y-1/2 translate-x-1/2" />
    </div>
  );
}

function PremiumCard({ data }: { data: typeof DATA.pricing.premium }) {
  return (
    <div className="rounded-2xl bg-primary-300 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
      {/* Top */}
      <div className="relative z-2">
        <h3 className="font-medium text-base text-white">{data.label}</h3>
        <p className="font-bold text-4xl text-secondary-200">
          {data.price}
          <span className="ml-1 text-sm text-white font-normal">
            {data.suffix}
          </span>
        </p>
      </div>

      {/* Bottom */}
      <div className="relative z-1">
        <ul className="mt-4 space-y-2 *:text-white">
          {data.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <MedalIcon size={16} />
              <span className="text-sm whitespace-pre-wrap">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-end -mt-8">
          <Link
            to="/"
            className={cn(
              buttonVariants({ size: "sm", variant: "default" }),
              "",
            )}
          >
            {data.cta}
            <ArrowRightIcon size={16} />
          </Link>
        </div>
      </div>

      {/* Avatar */}
      <Image
        src="/avatar/premium-pricing-card-avatar.webp"
        alt="Subtest Header Avatar"
        width={530}
        height={530}
        className="absolute bottom-12 sm:bottom-10 right-5 h-[50%] sm:h-[80%] lg:h-[60%] lg:bottom-11 w-auto z-1"
      />

      <div className="absolute h-[140%] bg-primary-200 rounded-full z-0 aspect-square right-0 bottom-0 translate-y-1/2 translate-x-1/2" />
    </div>
  );
}
