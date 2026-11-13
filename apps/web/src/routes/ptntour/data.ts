export type EventCategory = "Masterclass" | "Kelas Gratis PTN Tour" | "Intensif";

export type PtnTourEvent = {
  id?: number;
  slug: string;
  title: string;
  category: EventCategory;
  description: string;
  date: string;
  time: string;
  tutor: string;
  campus: string;
  poster: string;
  bonus: string[];
  status: "Akan datang" | "Selesai";
  registered?: boolean;
  spotsLeft?: number;
  whatsappGroupUrl?: string | null;
  zoomUrl?: string | null;
  recordingUrl?: string | null;
};

export const PTN_TOUR_EVENTS: PtnTourEvent[] = [
  {
    slug: "bedah-tka-gel-2",
    title: "Bedah Pola Soal TKA Gel 2",
    category: "Masterclass",
    description: "Bedah pola soal TKA dan teknik nembak MTK, B. Indo, dan B. Ing biar gel 2 lebih aman.",
    date: "20 Nov 2026",
    time: "19.30 WIB",
    tutor: "Kak Zhafir",
    campus: "UI · Pendidikan",
    poster: "/event-placeholder.svg",
    bonus: ["PDF Cheatsheet", "Latsol 20 soal"],
    status: "Akan datang",
    spotsLeft: 42,
  },
  {
    slug: "ptn-tour-5",
    title: "PTN Tour #5",
    category: "Kelas Gratis PTN Tour",
    description: "Kenalan dengan strategi masuk PTN dan dengarkan pengalaman langsung dari mahasiswa.",
    date: "27 Nov 2026",
    time: "19.30 WIB",
    tutor: "Tutor Habitutor",
    campus: "Mahasiswa PTN",
    poster: "/event-placeholder.svg",
    bonus: ["Materi sesi"],
    status: "Akan datang",
    spotsLeft: 88,
  },
  {
    slug: "masterclass-pk-pm",
    title: "Masterclass PK & PM",
    category: "Masterclass",
    description: "Tonton ulang pembahasan PK dan PM yang bisa kamu pelajari kapan saja.",
    date: "2 Mar 2026",
    time: "19.30 WIB",
    tutor: "Tutor Habitutor",
    campus: "SNBT Specialist",
    poster: "/event-placeholder.svg",
    bonus: ["PDF Cheatsheet"],
    status: "Selesai",
    registered: true,
  },
];

export const EVENT_CATEGORIES = ["Semua", "Masterclass", "Kelas Gratis PTN Tour", "Intensif"] as const;
