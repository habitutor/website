import Carousel from "@/components/testimone-carousel";
import { DATA } from "./data";
import { motion } from "motion/react";

export default function Testimone() {
  return (
    <section className="items-center bg-neutral-100">
      <motion.div
        className="z-3 flex flex-col mx-auto container items-center gap-y-4 max-w-7xl rounded-2xl xl:px-0 px-4 py-24"
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
