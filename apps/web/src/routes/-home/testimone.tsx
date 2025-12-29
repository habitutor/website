import Carousel from "@/components/carousel";
import { Container } from "@/components/ui/container";
import { DATA } from "./data";

export default function Testimone() {
  return (
    <>
      <section className="container mx-auto flex w-full max-w-4xl flex-col px-4 overflow-visible relative my-20">
        <main className="bg-neutral-100 border border-neutral-200 rounded-2xl py-8 gap-y-32 flex flex-col">
          <div className="text-center mb-4">
            <h2 className="font-bold text-2xl">
              Ruang Aman untuk{" "}
              <span className="text-primary-300">Bertanya & Tumbuh</span>
            </h2>
            <p className="text-sm font-medium">
              Ribuan siswa telah menemukan rumah kedua mereka di sini.
            </p>
          </div>
          <Carousel
            items={[...DATA.testimone]}
            showNavigation={true}
            showDots={true}
            autoPlay={false}
            gap={36}
            responsiveGap={true}
            className=""
          />
        </main>
      </section>
    </>
  );
}
