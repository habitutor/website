import { ArrowLeftIcon, CheckCircleIcon, QuotesIcon, SparkleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { DATA } from "@/routes/-home/data";

const QUOTE_INTERVAL_MS = 5000;
const EASE = [0.2, 0.7, 0.2, 1] as const;

type AuthShellProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  highlights: string[];
  mascotHidden?: boolean;
  mascotKey?: string | number;
  children: ReactNode;
  footer?: ReactNode;
};

function RotatingQuote() {
  const quotes = DATA.testimonials;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % quotes.length), QUOTE_INTERVAL_MS);
    return () => clearInterval(t);
  }, [quotes.length]);

  const quote = quotes[index];

  return (
    <div className="relative min-h-36 rounded-sr-lg bg-white/12 p-5 ring-1 ring-white/25 backdrop-blur">
      <QuotesIcon weight="fill" className="absolute -top-3 left-4 size-7 text-sr-sun-400" />
      <AnimatePresence mode="wait">
        <motion.div
          key={quote.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="space-y-3"
        >
          <p className="line-clamp-3 font-sr-serif text-sm leading-relaxed text-white/95 italic">{quote.desc}</p>
          <p className="text-xs font-semibold text-sr-sun-400">
            {quote.name} · <span className="text-white/80">{quote.title}</span>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function BrandPanel({
  eyebrow,
  title,
  description,
  highlights,
  mascotKey,
}: Pick<AuthShellProps, "eyebrow" | "title" | "description" | "highlights" | "mascotKey">) {
  return (
    <motion.aside
      className="relative hidden overflow-hidden rounded-sr-xl sr-card-blue p-10 lg:sticky lg:top-10 lg:flex lg:min-h-[36rem] lg:flex-col lg:gap-8"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 size-80 animate-sr-drift rounded-full border-[36px] border-white/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-sr-sun-400/25 blur-3xl" />

      <div className="relative space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-white/25">
          <SparkleIcon weight="fill" className="size-3.5 text-sr-sun-400" />
          {eyebrow}
        </span>
        <h2 className="text-4xl leading-tight font-extrabold text-balance">{title}</h2>
        <p className="max-w-md text-white/85">{description}</p>
        <ul className="space-y-2 pt-2">
          {highlights.map((item, i) => (
            <motion.li
              key={item}
              className="flex items-center gap-2 text-sm font-medium"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
            >
              <CheckCircleIcon weight="fill" className="size-5 text-sr-sun-400" />
              {item}
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="relative mt-auto flex items-end gap-4">
        <div className="flex-1">
          <RotatingQuote />
        </div>
        <motion.div
          key={mascotKey}
          className="relative -mr-4 -mb-4 w-40 shrink-0 xl:w-48"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1, y: [0, -10, 0] }}
          transition={{
            scale: { type: "spring", stiffness: 400, damping: 10 },
            y: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
        >
          <Image
            src="/avatar/tupai-hero.webp"
            alt=""
            width={220}
            height={220}
            className="h-auto w-full drop-shadow-[0_18px_20px_rgba(10,20,60,0.35)]"
          />
        </motion.div>
      </div>
    </motion.aside>
  );
}

export function AuthShell({
  eyebrow,
  title,
  description,
  highlights,
  mascotHidden = false,
  mascotKey,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-clip bg-linear-to-br from-sr-blue-50 via-sr-ivory to-sr-sun-100 px-4 pt-20 pb-10 lg:py-10">
      <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-sr-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full bg-sr-sun-200/60 blur-3xl" />

      <Link
        to="/"
        className="group absolute top-4 left-4 z-20 inline-flex sr-action items-center gap-2 rounded-full border border-sr-line bg-white px-4 py-2 text-sm font-semibold text-sr-blue-700 shadow-sr-1"
      >
        <ArrowLeftIcon weight="bold" className="transition-transform duration-300 group-hover:-translate-x-1" />
        Kembali
      </Link>

      <div className="relative grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-start xl:gap-12">
        <BrandPanel
          eyebrow={eyebrow}
          title={title}
          description={description}
          highlights={highlights}
          mascotKey={mascotKey}
        />

        <div className="relative mx-auto flex w-full max-w-md flex-col justify-center pt-14 lg:pt-20">
          <motion.div
            className="absolute top-0 left-1/2 z-0 w-32 -translate-x-1/2 lg:w-36"
            animate={{ y: mascotHidden ? 70 : 0, rotate: mascotHidden ? 0 : [0, -4, 4, 0] }}
            transition={
              mascotHidden
                ? { type: "spring", stiffness: 260, damping: 20 }
                : {
                    y: { type: "spring", stiffness: 260, damping: 14 },
                    rotate: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                  }
            }
          >
            <Image src="/avatar/login-avatar.webp" alt="" width={160} height={160} className="h-auto w-full" />
          </motion.div>

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {children}
          </motion.div>

          {footer && (
            <motion.div
              className="mt-5 text-center text-sm text-sr-ink-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {footer}
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}

export function AuthCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-sr-xl border border-white bg-white/95 p-6 shadow-sr-3 backdrop-blur sm:p-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-sr-blue-500 via-sr-sun-400 to-sr-orange-500" />
      {children}
    </div>
  );
}

export function FieldErrors({ errors }: { errors: ReadonlyArray<unknown> }) {
  const messages = errors
    .map((error) => (typeof error === "string" ? error : (error as { message?: string } | undefined)?.message))
    .filter((message): message is string => Boolean(message));

  return (
    <AnimatePresence initial={false}>
      {messages.map((message) => (
        <motion.p
          key={message}
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0 }}
          className="text-xs font-medium text-red-500"
        >
          {message}
        </motion.p>
      ))}
    </AnimatePresence>
  );
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-4 py-4">
      <span className="h-px flex-1 bg-sr-line-2" />
      <span className="shrink-0 text-xs font-medium text-sr-muted uppercase">atau</span>
      <span className="h-px flex-1 bg-sr-line-2" />
    </div>
  );
}
