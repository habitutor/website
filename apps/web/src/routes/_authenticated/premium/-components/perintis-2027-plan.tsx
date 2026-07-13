import { PerintisPricingCard } from "@/routes/home-premium/-components/pricing";

type Perintis2027PlanProps = {
  isPremium: boolean;
  isPending: boolean;
  onSubscribe: () => void;
};

export function Perintis2027Plan({ isPremium, isPending, onSubscribe }: Perintis2027PlanProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PerintisPricingCard mode="checkout" isPremium={isPremium} isPending={isPending} onSubscribe={onSubscribe} />
    </div>
  );
}
