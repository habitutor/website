import { ChatCircleDotsIcon, PlusIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { Image } from "@unpic/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DATA } from "./data";
import { Float } from "./motion-bits";

function FaqIntro() {
  return (
    <motion.div
      className="flex flex-col items-center gap-6 text-center lg:sticky lg:top-28 lg:items-start lg:text-left"
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-sr-blue-200 bg-white px-3 py-1 text-xs font-semibold text-sr-blue-700 shadow-sr-1">
        <ChatCircleDotsIcon weight="fill" className="size-4 text-sr-sun-500" />
        FAQ
      </span>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-pretty text-sr-ink sm:text-4xl">
          Punya Pertanyaan? <span className="font-sr-serif text-sr-blue-600 italic">Kami Siap Bantu</span>
        </h2>
        <p className="text-sm font-medium text-pretty text-sr-muted md:text-base">
          Cari jawaban cepat tentang fitur, kelas, dan pengalaman belajar
        </p>
      </div>

      <div className="relative w-full max-w-sm">
        <Float distance={10} duration={4} className="absolute -top-20 right-2 z-10 w-28 md:w-32">
          <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.6 }}>
            <Image
              src="/avatar/tupai-cta-2.webp"
              alt=""
              width={160}
              height={160}
              className="h-auto w-full drop-shadow-[0_12px_14px_rgba(20,34,78,0.25)]"
            />
          </motion.div>
        </Float>
        <div className="relative overflow-hidden rounded-sr-lg sr-card-blue p-5 text-left">
          <div className="pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full border-[16px] border-white/10" />
          <p className="pr-24 text-base font-bold md:text-lg">Masih ada yang bikin bingung?</p>
          <p className="mt-1 text-sm text-white/80">Tim Habitutor siap jawab langsung lewat WhatsApp.</p>
          <a
            href={DATA.footer.contactWhatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-4 inline-flex sr-action items-center gap-2 rounded-full sr-card-sun px-4 py-2 text-sm font-bold"
          >
            <WhatsappLogoIcon weight="fill" className="size-5 transition-transform group-hover:rotate-12" />
            Chat Admin
          </a>
        </div>
      </div>
    </motion.div>
  );
}

type FaqItem = (typeof DATA.faq)[number];

function FaqRow({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
      className={cn(
        "overflow-hidden rounded-sr-md border-2 bg-white transition-[border-color,box-shadow] duration-300",
        isOpen
          ? "border-sr-sun-400 shadow-sr-sun"
          : "border-sr-line shadow-sr-1 hover:border-sr-blue-200 hover:shadow-sr-2",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full cursor-pointer items-center gap-4 px-4 py-4 text-left md:px-5"
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-sr-sm text-sm font-bold transition-colors duration-300",
            isOpen ? "bg-sr-blue-500 text-white" : "bg-sr-blue-50 text-sr-blue-600 group-hover:bg-sr-blue-100",
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="flex-1 font-semibold text-sr-ink">{item.question}</h3>
        <motion.span
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
            isOpen ? "bg-sr-sun-400 text-sr-ink" : "bg-sr-blue-50 text-sr-blue-600",
          )}
        >
          <PlusIcon size={16} weight="bold" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <p className="mx-4 mb-4 rounded-sr-sm bg-sr-cream px-4 py-3 text-sm leading-relaxed text-sr-ink-2 md:mx-5 md:ml-18">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  const [openId, setOpenId] = useState<number | null>(DATA.faq[0]?.id ?? null);

  return (
    <section className="relative overflow-clip bg-linear-to-b from-sr-blue-50 via-white to-sr-ivory">
      <div className="pointer-events-none absolute top-20 -left-32 size-96 rounded-full bg-sr-blue-100/60 blur-3xl" />
      <div className="relative container mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 md:py-24 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <FaqIntro />
        <div className="w-full space-y-3">
          {DATA.faq.map((item, i) => (
            <FaqRow
              key={item.id}
              item={item}
              index={i}
              isOpen={openId === item.id}
              onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
