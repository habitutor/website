import * as m from "motion/react-m";
import { createFileRoute } from "@tanstack/react-router";
import { MotionPulse } from "@/components/motion/motion-components";
import { FlashcardIntro } from "./-components/flashcard-intro";

export const Route = createFileRoute("/_authenticated/dashboard/flashcard/intro")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="relative overflow-hidden">
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                {/* Lingkaran 1 */}
                <MotionPulse>
                    <m.div
                        className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-full
                            w-[280px] h-[280px] bottom-[-100px] right-[-60px]
                            md:w-[649px] md:h-[649px] md:rounded-[649px] md:bottom-auto md:top-[500px] md:right-[900px]"
                        style={{ rotate: "-8.997deg" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                    />
                </MotionPulse>

                {/* Lingkaran 2*/}
                <MotionPulse>
                    <m.div
                        className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-[142px]
                            hidden md:block md:w-[142px] md:h-[142px]"
                        style={{ right: 1400, top: 400, rotate: "-8.997deg" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    />
                </MotionPulse>

                {/* Lingkaran 3 */}
                <MotionPulse>
                    <m.div
                        className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-[72px]
                            hidden md:block md:w-[72px] md:h-[72px]"
                        style={{ right: 1300, top: 400, rotate: "-8.997deg" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                    />
                </MotionPulse>

                {/* Lingkaran 4 */}
                <MotionPulse>
                    <m.div
                        className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-full
                            w-[40px] h-[40px] top-[16px] right-[16px]
                            md:w-[61px] md:h-[61px] md:rounded-[62px] md:top-[400px] md:right-[208px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                    />
                </MotionPulse>

                {/* Lingkaran 5*/}
                <MotionPulse>
                    <m.div
                        className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-[186px]
                            hidden md:block md:w-[186px] md:h-[186px]"
                        style={{ left: 1400, top: 400 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    />
                </MotionPulse>

                {/* Lingkaran 6*/}
                <MotionPulse>
                    <m.div
                        className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-full
                            w-[220px] h-[220px] bottom-[-80px] left-[-60px]
                            md:w-[464px] md:h-[464px] md:rounded-[464px] md:bottom-auto md:left-auto md:top-[500px] md:right-[86px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                    />
                </MotionPulse>

                {/* Lingkaran tambahan */}
                <MotionPulse>
                    <m.div
                        className="absolute border-[#FEEAAE] border-2 bg-[#FFF5D7] rounded-full
                            w-[90px] h-[90px] top-[16px] left-[16px]
                            md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    />
                </MotionPulse>
            </div>

            <div className="relative z-10">
                <FlashcardIntro />
            </div>
        </div>
    );
}