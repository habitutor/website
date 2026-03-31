import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { DATA } from "./data";

export function FAQ() {
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const toggleAccordion = (id: number) => {
    const newOpenIds = new Set(openIds);
    if (newOpenIds.has(id)) {
      newOpenIds.delete(id);
    } else {
      newOpenIds.add(id);
    }
    setOpenIds(newOpenIds);
  };

  return (
    <section className="bg-neutral-100">
      <div className="container mx-auto flex w-full max-w-xl flex-col items-center justify-start gap-8 px-4 py-16 md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        <div className="space-y-2 text-center *:text-pretty">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Punya Pertanyaan? <span className="text-primary-300">Kami Siap Bantu</span>
          </h2>
          <p className="text-sm font-medium text-pretty md:text-base">
            Cari jawaban cepat tentang fitur, kelas, dan pengalaman belajar
          </p>
        </div>

        <div className="w-full space-y-3">
          {DATA.faq.map((item) => (
            <div key={item.id} className="flex flex-col items-center rounded-lg">
              <button
                onClick={() => toggleAccordion(item.id)}
                className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg border px-4 py-4 text-left shadow-sm transition-colors ${
                  openIds.has(item.id) ? "bg-[#FFFCF3]" : "hover:bg-gray-50"
                }`}
              >
                <h3 className="font-semibold text-gray-900">{item.question}</h3>
                <div className="flex shrink-0 justify-center text-primary-500">
                  {openIds.has(item.id) ? <MinusIcon size={20} weight="bold" /> : <PlusIcon size={20} weight="bold" />}
                </div>
              </button>

              {openIds.has(item.id) && (
                <div className="flex w-[98%] rounded-b-lg border border-[#FEEAAE] bg-[#FFF5D7] px-4 py-4 shadow-sm">
                  <p className="text-sm text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
