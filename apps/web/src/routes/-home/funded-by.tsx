const FUNDERS = [
  {
    name: "Universitas Gadjah Mada",
    src: "/icons/ugm.webp",
    className: "size-16 sm:size-20",
  },
  {
    name: "P2MW / Kemahasiswaan Dikti",
    src: "/icons/kemahasiswaan_dikti.webp",
    className: "h-16 w-auto sm:h-20",
  },
  {
    name: "Ministry of Education and Culture of the Republic of Indonesia",
    src: "/icons/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg",
    className: "size-16 sm:size-20",
  },
] as const;

export function FundedBy() {
  return (
    <section aria-labelledby="funded-by-heading" className="border-y border-neutral-200 bg-neutral-100 py-8 sm:py-10">
      <div className="container mx-auto px-4">
        <h2
          id="funded-by-heading"
          className="text-center text-xs font-bold tracking-[0.2em] text-neutral-600 uppercase"
        >
          Funded by
        </h2>
        <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-8 sm:gap-16">
          {FUNDERS.map((funder) => (
            <img
              key={funder.name}
              src={funder.src}
              alt={funder.name}
              className={`${funder.className} object-contain opacity-75 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
