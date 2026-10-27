import { Image } from "@unpic/react";
import type { authClient } from "@/lib/auth-client";
import { PREMIUM_PLAN_NAME, type PremiumPlan, formatWibDate } from "@/lib/premium-packages";

type PremiumHeaderProps = {
  session: typeof authClient.$Infer.Session | null;
  subscribedPlan?: PremiumPlan | null;
};

export function PremiumHeader({ session, subscribedPlan }: PremiumHeaderProps) {
  const isPremium = session?.user.isPremium ?? false;
  const expiresAt = session?.user.premiumExpiresAt;
  const planName = subscribedPlan ? PREMIUM_PLAN_NAME[subscribedPlan] : "Premium";

  const title = isPremium ? `${planName} kamu sudah aktif!` : "Pilih Paket Premium Habitutor";
  const subtitle = isPremium
    ? "Semua fasilitas Premium Habitutor bisa kamu pakai selama masa aktif paketmu — belajar bareng mulai sekarang"
    : "Sekali bayar, semua fasilitas Premium langsung terbuka — pilih masa aktif yang paling pas buat kamu";

  return (
    <main className="space-y-6">
      <div className="relative overflow-hidden rounded-sr-lg sr-card-blue">
        <div className="grid grid-cols-3 gap-6 px-6 py-8 sm:items-center sm:px-10 sm:py-10">
          <div className="relative col-span-1 -mx-6 h-27.5 sm:mx-0 sm:h-auto">
            <div className="absolute size-45 -translate-x-1/4 translate-y-1/5 rounded-full bg-white/15 sm:-top-15 sm:left-6" />
            <Image
              src="/avatar/premium-pricing-card-avatar.webp"
              alt="Premium Avatar"
              width={260}
              height={260}
              className="absolute top-5 -left-4 size-40 object-cover select-none sm:size-52.5 sm:-translate-y-1/2"
            />
          </div>

          <div className="relative z-10 col-span-2">
            <h1 className="bg-linear-to-r from-white to-sr-sun-200 bg-clip-text text-[24px] leading-tight font-bold text-transparent sm:text-[30px]">
              {title}
            </h1>
            <p className="mt-2 text-[14px] leading-5.25 text-white/90">{subtitle}</p>
          </div>
        </div>
      </div>

      {isPremium && (
        <div className="w-full rounded-sr-md border border-green-200 bg-[#EDFCF4] p-4 text-fourtiary-400">
          <p className="text-xl font-bold sm:text-2xl">Kamu sudah berlangganan {planName}!</p>
          {expiresAt && (
            <p className="text-sm font-semibold sm:text-lg">Masa aktif sampai {formatWibDate(expiresAt)}</p>
          )}
          <p className="text-sm sm:text-lg">Selesaikan pembelajaranmu baru dapat membeli paket kembali</p>
        </div>
      )}
    </main>
  );
}
