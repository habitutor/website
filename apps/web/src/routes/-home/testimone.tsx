import { motion } from "motion/react";
import Carousel from "@/components/testimone-carousel";
import { DATA } from "./data";

export default function Testimone() {
	return (
		<section className="items-center bg-neutral-100">
			<motion.div
				className="container z-3 mx-auto flex max-w-7xl flex-col items-center gap-y-4 rounded-2xl px-4 py-24 xl:px-0"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: 0.5, duration: 0.3 }}
			>
				<h2 className="font-bold text-2xl">Testimony Lorem Ipsum</h2>

				{/* <Image
							src="/avatar/testimone-avatar.webp"
							alt="Empty State"
							width={300}
							height={150}
							className="absolute inset-0 m-auto w-62.5 sm:w-75"
						/> */}

				<Carousel
					items={[...DATA.testimone]}
					showNavigation={true}
					showDots={true}
					autoPlay={true}
					autoPlayInterval={2000}
					gap={9}
					className=""
				/>
			</motion.div>
		</section>
	);
}
