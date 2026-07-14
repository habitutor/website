import { PerintisPricingCard } from "@/routes/home-premium/-components/pricing";

type Perintis2027PlanProps = {
  isPremium: boolean;
  isPending: boolean;
  onSubscribe: () => void;
  promoCode: string;
  onPromoCodeChange: (value: string) => void;
  onValidatePromo: () => void;
  promoFeedback?: { valid: boolean; message: string; discountedPrice?: number };
  isPromoValidating: boolean;
};

export function Perintis2027Plan({
  isPremium,
  isPending,
  onSubscribe,
  promoCode,
  onPromoCodeChange,
  onValidatePromo,
  promoFeedback,
  isPromoValidating,
}: Perintis2027PlanProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PerintisPricingCard
        mode="checkout"
        isPremium={isPremium}
        isPending={isPending}
        onSubscribe={onSubscribe}
        promoCode={promoCode}
        onPromoCodeChange={onPromoCodeChange}
        onValidatePromo={onValidatePromo}
        promoFeedback={promoFeedback}
        isPromoValidating={isPromoValidating}
      />
    </div>
  );
}
