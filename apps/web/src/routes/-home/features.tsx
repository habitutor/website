import {
  BookOpenTextIcon,
  BrainIcon,
  ExamIcon,
  FireIcon,
  PlayCircleIcon,
  TargetIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { COMMUNITY_LINKS } from "@/lib/community-links";
import { FeatureCard } from "./feature-card";
import { Mentors } from "./mentors";
import { Float, SectionHeading, TiltCard } from "./motion-bits";

const accent = "font-bold text-sr-blue-600";

const COMMUNITY_CHANNELS = [
  {
    href: COMMUNITY_LINKS.discord,
    label: "Join Discord Habitutor",
    name: "Discord",
    icon: "/icons/discord.svg",
    ring: "border-primary-300 bg-primary-200",
    iconClassName: "w-14 -rotate-12 sm:w-16 md:w-20",
  },
  {
    href: COMMUNITY_LINKS.whatsappChannel,
    label: "Ikuti Channel WhatsApp Habitutor",
    name: "WhatsApp",
    icon: "/icons/whatsapp.svg",
    ring: "border-fourtiary-300 bg-green-200",
    iconClassName: "w-12 rotate-10 sm:w-14 md:w-16",
  },
];

function CommunityCard() {
  return (
    <motion.div
      className="h-full md:col-span-2"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <TiltCard
        maxTilt={6}
        whileHover={{ y: -6 }}
        className="group flex h-full min-h-88 flex-col overflow-hidden rounded-sr-lg border border-white bg-linear-to-br from-white via-sr-blue-50 to-sr-blue-100 p-5 shadow-sr-1 transition-shadow duration-500 hover:shadow-sr-3 sm:min-h-96 md:min-h-112 md:p-8"
      >
        <div className="relative z-10 space-y-3 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sr-live px-3 py-1 text-xs font-semibold text-white shadow-sr-1">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
            Komunitas aktif
          </span>
          <h3 className="text-xl font-bold text-sr-ink md:text-3xl">
            Jangan <span className="text-sr-blue-600">Melangkah</span> Sendiri
          </h3>
          <p className="text-sm leading-relaxed text-sr-ink-2 md:text-lg">
            Temukan <span className={accent}>komunitas sesama pembelajar</span> dalam perjalanan belajar yang didukung
            penuh.
          </p>
        </div>

        <div className="relative z-10 mt-auto flex min-h-44 items-end justify-center gap-4 pt-4 sm:min-h-48 md:min-h-52">
          <motion.div
            className="pointer-events-none absolute bottom-6 left-1/2 size-52 -translate-x-1/2 rounded-full border-2 border-dashed border-sr-blue-200 md:size-60"
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <motion.span
              className="absolute -top-4 left-1/2 -ml-4 flex size-8 items-center justify-center rounded-full bg-white text-sr-blue-600 shadow-sr-1"
              animate={{ rotate: -360 }}
              transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <UsersThreeIcon weight="fill" className="size-4" />
            </motion.span>
          </motion.div>
          {COMMUNITY_CHANNELS.map((channel, i) => (
            <Float key={channel.name} distance={8} duration={3 + i * 0.6} delay={i * 0.4}>
              <motion.a
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={channel.label}
                className={`relative flex size-26 items-center justify-center rounded-full border-4 shadow-sr-2 sm:size-30 md:size-34 ${channel.ring}`}
                whileHover={{ scale: 1.1, rotate: i ? 8 : -8 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Image
                  src={channel.icon}
                  alt={channel.name}
                  width={120}
                  height={120}
                  className={`h-auto object-contain ${channel.iconClassName}`}
                />
              </motion.a>
            </Float>
          ))}
        </div>
      </TiltCard>
    </motion.div>
  );
}

export function Features() {
  return (
    <section className="relative overflow-x-hidden bg-linear-to-b from-sr-blue-50 via-tertiary-100 to-sr-blue-50 py-16 md:py-24">
      <Float
        distance={14}
        duration={5}
        rotate={-8}
        className="pointer-events-none absolute top-10 -left-10 hidden w-48 md:block lg:left-4"
      >
        <Image
          src="/decorations/graduation-cap.webp"
          alt=""
          width={400}
          height={400}
          className="h-auto w-full drop-shadow-xl"
        />
      </Float>
      <Float
        distance={12}
        duration={4.4}
        delay={0.8}
        rotate={10}
        className="pointer-events-none absolute top-1/3 -right-12 hidden w-44 md:block lg:right-2"
      >
        <Image src="/decorations/acorn.webp" alt="" width={400} height={400} className="h-auto w-full drop-shadow-xl" />
      </Float>
      <Float
        distance={10}
        duration={4.8}
        delay={0.4}
        rotate={-6}
        className="pointer-events-none absolute bottom-1/4 -left-8 hidden w-36 md:block"
      >
        <Image
          src="/decorations/book-mirror.webp"
          alt=""
          width={400}
          height={400}
          className="h-auto w-full drop-shadow-xl"
        />
      </Float>

      <div className="relative container mx-auto flex flex-col gap-10 px-4 md:gap-14">
        <SectionHeading
          eyebrow="Kenapa Habitutor?"
          title={
            <>
              Kenapa Harus Berjuang Bareng <span className="font-sr-serif text-sr-blue-600 italic">Habitutor</span>?
            </>
          }
          description="Bukan cuma kejar skor, tapi bangun kebiasaan yang bikin kamu siap sampai dunia kampus."
        />

        <div className="flex w-full flex-col gap-4 md:grid md:grid-cols-6 md:gap-5">
          <FeatureCard
            className="md:col-span-3"
            tone="blue"
            icon={FireIcon}
            badge="Streak harian"
            imageSrc="/images/dashboard-page.webp"
            imageAlt="Habitutor Dashboard"
            title={
              <>
                Bersama <span className="text-sr-blue-600">Habitutor</span>
              </>
            }
            description={
              <>
                Mulai dari 3 menit sehari. Habitutor <span className={accent}>membangun kebiasaan</span> lewat streak
                dan latihan mini yang ringan.
              </>
            }
          />

          <FeatureCard
            className="md:col-span-3"
            tone="sun"
            icon={PlayCircleIcon}
            badge="250+ video"
            motionProps={{ transition: { duration: 0.5, delay: 0.1 } }}
            imageSrc="/images/kelas-page.webp"
            imageAlt="Video Bahas Soal"
            title={
              <>
                <span className="text-sr-blue-600">250+ Video</span> Bahas Soal
              </>
            }
            description={
              <>
                Contoh <span className={accent}>cara mengerjakan soal</span> dari mahasiswa UI, ITB, dan UGM
              </>
            }
          />

          <div className="md:col-span-6">
            <Mentors />
          </div>

          <FeatureCard
            className="md:col-span-2"
            tone="orange"
            icon={TargetIcon}
            badge="YKKA"
            imageSrc="/images/quiz-page.webp"
            imageAlt="BAB Prioritas"
            title="Kejar BAB Prioritas"
            description={
              <>
                Udah ga sempet belajar semua, <span className={accent}>Belajar YKKA</span> (Yang Keluar Keluar Aja)
              </>
            }
            imageClassName="max-w-52 sm:max-w-60 md:max-w-64"
          />

          <CommunityCard />

          <FeatureCard
            className="md:col-span-2"
            tone="sky"
            icon={BookOpenTextIcon}
            badge="Literasi"
            motionProps={{ transition: { duration: 0.5, delay: 0.2 } }}
            imageSrc="/images/classroom-page.webp"
            imageAlt="Reading Habits"
            title={
              <>
                <span className="text-sr-blue-600">Reading Habits</span> dan{" "}
                <span className="text-sr-blue-600">Mabok Vocab</span>
              </>
            }
            description="Buat ningkatin literasi dan vocabulary!"
            imageClassName="max-w-52 sm:max-w-60 md:max-w-64"
          />

          <FeatureCard
            className="md:col-span-3"
            tone="blue"
            icon={BrainIcon}
            badge="Games"
            imageSrc="/images/braingym-page.webp"
            imageAlt="Brain Gym"
            title={
              <>
                Asah Skill SNBT di <span className="text-sr-blue-600">Brain Gym</span>.
              </>
            }
            description={
              <>
                Tes kemampuan basic pakai ribuan soal dalam bentuk <span className={accent}>games</span>!
              </>
            }
          />

          <FeatureCard
            className="md:col-span-3"
            tone="sun"
            icon={ExamIcon}
            badge="Gratis"
            motionProps={{ transition: { duration: 0.5, delay: 0.1 } }}
            imageSrc="/images/try-out.webp"
            imageAlt="Tryout"
            title={
              <>
                Simulasi dengan <span className="text-sr-blue-600">Tryout</span> Rutin.
              </>
            }
            description={
              <>
                <span className={accent}>70% snbt mirip tahun lalu</span>, cobain try out Habitutor{" "}
                <span className={accent}>gratis</span> sekarang!
              </>
            }
          />
        </div>
      </div>
    </section>
  );
}
