import { SparkleIcon } from "@phosphor-icons/react";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PERINTIS_DATA } from "./data";

export function Benefits() {
  const { benefits, comingSoon } = PERINTIS_DATA;

  return (
    <div className="container mx-auto space-y-6 px-4 md:px-0">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-extrabold sm:text-3xl">
          Yang <span className="text-primary-300">Lo Dapet</span>
        </h2>
        <p className="text-sm font-medium md:text-lg">Sekali bayar, semuanya kebuka sampai hari-H.</p>
      </div>

      <MotionStagger className="grid gap-6 md:grid-cols-3">
        {benefits.map((benefit) => (
          <MotionStaggerItem key={benefit.title} className="h-full">
            <Card className="h-full gap-4 rounded-2xl border-2 border-neutral-300 bg-neutral-100 shadow-sm">
              <CardHeader className="gap-3">
                <div
                  className={cn("flex size-12 items-center justify-center rounded-xl border-2", benefit.iconClassName)}
                >
                  <benefit.icon size={28} weight="duotone" />
                </div>
                <CardTitle className="text-lg leading-snug font-bold text-pretty">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-neutral-800 md:text-base">{benefit.description}</p>
              </CardContent>
            </Card>
          </MotionStaggerItem>
        ))}
      </MotionStagger>

      {/* Coming soon strip */}
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#FEE086] bg-[#FFF5D7] px-6 py-4 text-center sm:flex-row sm:gap-3 sm:text-left">
        <span className="flex items-center gap-1.5 rounded-full bg-secondary-700 px-3 py-1 text-xs font-bold whitespace-nowrap text-neutral-100">
          <SparkleIcon size={14} weight="fill" />
          {comingSoon.label}
        </span>
        <p className="text-xs font-medium text-neutral-900 sm:text-sm">{comingSoon.description}</p>
      </div>
    </div>
  );
}
