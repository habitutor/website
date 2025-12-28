import { ArrowRightIcon, SealCheckIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Container } from "@/components/ui/container";
import { DATA } from "./data";

export function Pricing() {
  const { title, subtitle, starter, premium } = DATA.pricing;

  return (
    <Container>
      <div className="text-center">
        <h1 className="font-bold text-2xl">{title}</h1>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-10">
        <StarterCard data={starter} />
        <PremiumCard data={premium} />
      </div>
    </Container>
  );
}

function StarterCard({ data }: { data: typeof DATA.pricing.starter }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="font-medium text-sm">{data.label}</h3>
      <p className="font-bold text-2xl text-primary">{data.price}</p>

      <ul className="mt-4 space-y-2">
        {data.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <SealCheckIcon size={16} weight="fill" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"
      >
        {data.cta}
        <ArrowRightIcon size={16} />
      </Link>
    </div>
  );
}

function PremiumCard({ data }: { data: typeof DATA.pricing.premium }) {
  return (
    <div className="rounded-2xl bg-blue-700 p-6 text-white shadow-sm">
      <h3 className="font-medium text-sm">{data.label}</h3>
      <p className="font-bold text-2xl text-yellow-300">
        {data.price}
        <span className="ml-1 text-sm opacity-80">{data.suffix}</span>
      </p>

      <ul className="mt-4 space-y-2">
        {data.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <SealCheckIcon size={16} weight="fill" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-blue-700 text-sm"
      >
        {data.cta}
        <ArrowRightIcon size={16} />
      </Link>
    </div>
  );
}
