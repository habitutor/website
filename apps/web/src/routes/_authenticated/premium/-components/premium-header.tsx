import { CalendarCheckIcon, CrownSimpleIcon, SealCheckIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
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
    ? "Semua fasilitas Premium Habitutor bisa kamu pakai selama masa aktif paketmu. Yuk, mulai belajar bareng sekarang!"
    : "Sekali bayar, semua fasilitas Premium langsung terbuka. Pilih masa aktif yang paling pas buat kamu.";

  return (
    <div className="space-y-4">
      {/* Di HP maskot mengintip dari bawah kartu di bawah teks; mulai sm duduk di kanan. */}
      <div className="relative overflow-hidden rounded-sr-xl sr-card-blue px-5 pt-6 pb-36 sm:px-8 sm:py-9 sm:pr-72 lg:px-10 lg:py-11 lg:pr-96">
        <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-white/8" />

        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
          <CrownSimpleIcon weight="fill" className="size-4 text-sr-sun-400" />
          {isPremium ? "Member Premium" : "Paket Premium"}
        </span>
        <h1 className="relative mt-3 text-[26px] leading-tight font-extrabold text-balance text-white sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="relative mt-2.5 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">{subtitle}</p>

        <motion.img
          src="/avatar/avatar-premium.webp"
          alt=""
          width={657}
          height={519}
          className="pointer-events-none absolute right-1/2 bottom-0 w-44 translate-x-1/2 select-none sm:right-6 sm:w-60 sm:translate-x-0 lg:right-12 lg:w-72"
          initial={{ y: 40 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>

      {isPremium && (
        <div className="flex flex-col gap-3 rounded-sr-lg border border-sr-line bg-white p-4 shadow-sr-1 sm:flex-row sm:items-center sm:p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#edfcf4] text-sr-live">
            <SealCheckIcon weight="fill" className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-sr-ink sm:text-lg">Kamu sudah berlangganan {planName}</p>
            <p className="text-sm text-sr-muted">Selesaikan pembelajaranmu baru dapat membeli paket kembali</p>
          </div>
          {expiresAt && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sr-blue-50 px-3 py-1.5 text-xs font-bold text-sr-blue-700 sm:text-sm">
              <CalendarCheckIcon weight="bold" className="size-4" />
              Aktif sampai {formatWibDate(expiresAt)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
