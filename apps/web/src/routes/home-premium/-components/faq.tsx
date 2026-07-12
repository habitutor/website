import { CaretDownIcon } from "@phosphor-icons/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PERINTIS_DATA } from "./data";

export function FAQ() {
  return (
    <section className="bg-neutral-100">
      <div className="container mx-auto flex w-full max-w-xl flex-col items-center justify-start gap-8 px-4 py-16 md:max-w-3xl">
        <div className="space-y-2 text-center *:text-pretty">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Masih <span className="text-primary-300">Ragu?</span>
          </h2>
          <p className="text-sm font-medium md:text-base">Jawaban cepat buat pertanyaan yang paling sering masuk</p>
        </div>

        <div className="w-full space-y-3">
          {PERINTIS_DATA.faq.map((item) => (
            <Collapsible key={item.id} className="group w-full">
              <CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg border border-neutral-300 bg-white px-4 py-4 text-left shadow-sm transition-colors group-data-[state=open]:bg-[#FFFCF3] hover:bg-neutral-200/50">
                <h3 className="font-semibold text-gray-900">{item.question}</h3>
                <CaretDownIcon
                  size={20}
                  weight="bold"
                  className="shrink-0 text-primary-500 transition-transform group-data-[state=open]:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mx-auto w-[98%] rounded-b-lg border border-t-0 border-[#FEEAAE] bg-[#FFF5D7] px-4 py-4 shadow-sm">
                <p className="text-sm text-gray-700">{item.answer}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
}
