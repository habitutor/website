import { db } from "../index";
import { ptnTourEvent } from "../schema/ptn-tour";

const events = [
  {
    slug: "bedah-tka-gel-2",
    title: "Bedah Pola Soal TKA Gel 2",
    category: "Masterclass",
    description: "Bedah pola soal TKA dan teknik nembak MTK, B. Indo, dan B. Ing biar gel 2 lebih aman.",
    tutor: "Kak Zhafir",
    campus: "UI · Pendidikan",
    posterUrl: "/event-placeholder.svg",
    startsAt: new Date("2026-11-20T19:30:00+07:00"),
    quota: 100,
    isPublished: true,
  },
  {
    slug: "ptn-tour-5",
    title: "PTN Tour #5",
    category: "Kelas Gratis PTN Tour",
    description: "Kenalan dengan strategi masuk PTN dan dengarkan pengalaman langsung dari mahasiswa.",
    tutor: "Tutor Habitutor",
    campus: "Mahasiswa PTN",
    posterUrl: "/event-placeholder.svg",
    startsAt: new Date("2026-11-27T19:30:00+07:00"),
    quota: 100,
    isPublished: true,
  },
].map((event) => ({ ...event, updatedAt: new Date() }));

await db.insert(ptnTourEvent).values(events).onConflictDoNothing({ target: ptnTourEvent.slug });
console.log(`Seeded ${events.length} PTN Tour events.`);
