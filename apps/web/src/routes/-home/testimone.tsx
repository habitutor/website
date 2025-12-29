import Carousel from "@/components/carousel";
import { Container } from "@/components/ui/container";
import { DATA } from "./data";

export default function Testimone() {
  return (
    <>
      <Container className="overflow-visible relative bg-neutral-100 rounded-2xl my-20 gap-32">
        <div className="text-center mb-4">
          <h2 className="font-bold text-2xl">
            Ruang Aman untuk Bertanya & Tumbuh
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
      </Container>
    </>
  );
}
