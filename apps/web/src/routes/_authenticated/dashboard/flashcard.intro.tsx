import { createFileRoute } from "@tanstack/react-router";
import * as m from "motion/react-m";
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
						className="absolute right-[-60px] bottom-[-100px] h-[280px] w-[280px] rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-[500px] md:right-[900px] md:bottom-auto md:h-[649px] md:w-[649px] md:rounded-[649px]"
						style={{ rotate: "-8.997deg" }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.1, duration: 0.3 }}
					/>
				</MotionPulse>

				{/* Lingkaran 2*/}
				<MotionPulse>
					<m.div
						className="absolute hidden rounded-[142px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-[142px] md:w-[142px]"
						style={{ right: 1400, top: 400, rotate: "-8.997deg" }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.3 }}
					/>
				</MotionPulse>

				{/* Lingkaran 3 */}
				<MotionPulse>
					<m.div
						className="absolute hidden rounded-[72px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-[72px] md:w-[72px]"
						style={{ right: 1300, top: 400, rotate: "-8.997deg" }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3, duration: 0.3 }}
					/>
				</MotionPulse>

				{/* Lingkaran 4 */}
				<MotionPulse>
					<m.div
						className="absolute top-[16px] right-[16px] h-[40px] w-[40px] rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-[400px] md:right-[208px] md:h-[61px] md:w-[61px] md:rounded-[62px]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4, duration: 0.3 }}
					/>
				</MotionPulse>

				{/* Lingkaran 5*/}
				<MotionPulse>
					<m.div
						className="absolute hidden rounded-[186px] border-2 border-[#FEEAAE] bg-[#FFF5D7] md:block md:h-[186px] md:w-[186px]"
						style={{ left: 1400, top: 400 }}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5, duration: 0.3 }}
					/>
				</MotionPulse>

				{/* Lingkaran 6*/}
				<MotionPulse>
					<m.div
						className="absolute bottom-[-80px] left-[-60px] h-[220px] w-[220px] rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:top-[500px] md:right-[86px] md:bottom-auto md:left-auto md:h-[464px] md:w-[464px] md:rounded-[464px]"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6, duration: 0.3 }}
					/>
				</MotionPulse>

				{/* Lingkaran tambahan */}
				<MotionPulse>
					<m.div
						className="absolute top-[16px] left-[16px] h-[90px] w-[90px] rounded-full border-2 border-[#FEEAAE] bg-[#FFF5D7] md:hidden"
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
