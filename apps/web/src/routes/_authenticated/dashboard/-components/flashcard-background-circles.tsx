import * as m from "motion/react-m";
import { MotionPulse } from "@/components/motion/motion-components";

export function FlashcardBackgroundCircles() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden xl:block">
      <MotionPulse>
        <m.div
          className="absolute -right-15 -bottom-25 h-70 w-70 rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-125 md:right-225 md:bottom-auto md:h-162.25 md:w-162.25"
          style={{ rotate: "-8.997deg" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        />
      </MotionPulse>

      <MotionPulse>
        <m.div
          className="absolute hidden rounded-[142px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-35.5 md:w-35.5"
          style={{ right: 1400, top: 400, rotate: "-8.997deg" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        />
      </MotionPulse>

      <MotionPulse>
        <m.div
          className="absolute hidden rounded-[72px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-18 md:w-18"
          style={{ right: 1300, top: 400, rotate: "-8.997deg" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        />
      </MotionPulse>

      <MotionPulse>
        <m.div
          className="absolute top-4 right-4 h-10 w-10 rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-100 md:right-52 md:h-15.25 md:w-15.25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        />
      </MotionPulse>

      <MotionPulse>
        <m.div
          className="absolute hidden rounded-[186px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-46.5 md:w-46.5"
          style={{ left: 1400, top: 400 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        />
      </MotionPulse>

      <MotionPulse>
        <m.div
          className="absolute -bottom-20 -left-15 h-55 w-55 rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-125 md:right-21.5 md:bottom-auto md:left-auto md:h-116 md:w-116"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        />
      </MotionPulse>

      <MotionPulse>
        <m.div
          className="absolute top-4 left-4 h-22.5 w-22.5 rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        />
      </MotionPulse>
    </div>
  );
}
