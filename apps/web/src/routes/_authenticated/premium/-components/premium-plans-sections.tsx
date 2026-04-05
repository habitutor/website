import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
import { MobileCarousel } from "@/components/pricing/mobile-carousel";
import { TryOutCard } from "@/components/pricing/tryout-card";
import { DATA } from "@/routes/home-premium/-components/data";
import type { ComponentProps } from "react";
import type { BundlingVariant } from "../premium-payment";
import { BundlingCard } from "./bundling-card";
import { PerintisClassroomCard } from "./perintis-card";
import { PremiumHeader } from "./premium-header";
import { PrivilegeCard } from "./privilege-card";

type PremiumPlansSectionsProps = {
  session: ComponentProps<typeof PremiumHeader>["session"];
  isPremium: boolean;
  currentTier: BundlingVariant | null;
  isTransactionPending: boolean;
  activeVariant: BundlingVariant | null;
  onSubscribe: (variant: BundlingVariant) => void;
};

export function PremiumPlansSections({
  session,
  isPremium,
  currentTier,
  isTransactionPending,
  activeVariant,
  onSubscribe,
}: PremiumPlansSectionsProps) {
  const tryoutPlans = Object.values(DATA.pricing_tryout);
  const bundlingCards = [
    <BundlingCard
      key="premium"
      variant="premium"
      isCurrentPlan={currentTier === "premium"}
      isSubscribed={isPremium && currentTier !== "premium"}
      isPending={isTransactionPending && activeVariant === "premium"}
      buttonDisabled={false}
      onSubscribe={onSubscribe}
    />,
    <BundlingCard
      key="premium2"
      variant="premium2"
      isCurrentPlan={currentTier === "premium2"}
      isSubscribed={isPremium && currentTier !== "premium2"}
      isPending={isTransactionPending && activeVariant === "premium2"}
      buttonDisabled={false}
      onSubscribe={onSubscribe}
    />,
  ];
  const privilegeCards = [
    <PrivilegeCard key="privilege1" variant="privilege1" />,
    <PrivilegeCard key="privilege2" variant="privilege2" />,
  ];
  const perintisCards = [
    <PerintisClassroomCard key="perintis1" variant="perintis1" />,
    <PerintisClassroomCard key="perintis2" variant="perintis2" />,
    <PerintisClassroomCard key="classroom" variant="classroom" />,
  ];
  const tryoutCards = tryoutPlans.map((plan) => <TryOutCard key={plan.label} data={plan} />);

  return (
    <MotionStagger className="mt-4 flex flex-col gap-6 sm:-mt-3">
      <MotionStaggerItem>
        <PremiumHeader session={session} />
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
          <div className="flex flex-col">
            <span className="text-lg font-bold sm:text-2xl">Ultimate Bundling</span>
            <span className="text-sm font-medium sm:text-lg">
              Paket yang paling worth it!!! Paling lengkap + murah!!
            </span>
          </div>
          <MobileCarousel items={bundlingCards} paginationLabel="Ultimate Bundling" itemClassName="w-full shrink-0" />
          <div className="hidden gap-6 sm:grid sm:grid-cols-2">{bundlingCards}</div>
        </div>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
          <div className="flex flex-col">
            <span className="text-lg font-bold sm:text-2xl">Privilege</span>
            <span className="text-sm font-medium sm:text-lg">
              Pilihan paket belajar yang lebih ringan dengan benefit terarah.
            </span>
          </div>
          <MobileCarousel items={privilegeCards} paginationLabel="Privilege" itemClassName="w-full shrink-0" />
          <div className="hidden gap-6 sm:grid sm:grid-cols-2">{privilegeCards}</div>
        </div>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
          <div className="flex flex-col">
            <span className="text-lg font-bold sm:text-2xl">Perintis & Classroom</span>
            <span className="text-sm font-medium sm:text-lg">
              Pilihan belajar bertahap dengan isi dan warna yang sama seperti section perintis.
            </span>
          </div>
          <MobileCarousel
            items={perintisCards}
            paginationLabel="Perintis dan Classroom"
            itemClassName="w-full shrink-0"
          />
          <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">{perintisCards}</div>
        </div>
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="space-y-6 rounded-2xl border border-neutral-300 bg-neutral-100 p-6 sm:p-10">
          <div className="flex flex-col">
            <span className="text-lg font-bold sm:text-2xl">Paket Try Out</span>
            <span className="text-sm font-medium sm:text-lg">
              Pilih paket try out sesuai intensitas latihan yang kamu butuhkan.
            </span>
          </div>
          <MobileCarousel items={tryoutCards} paginationLabel="Paket Try Out" itemClassName="w-full shrink-0" />
          <div className="hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">{tryoutCards}</div>
        </div>
      </MotionStaggerItem>
    </MotionStagger>
  );
}
