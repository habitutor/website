import { DiscordLogoIcon, InstagramLogoIcon, WhatsappLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import { COMMUNITY_LINKS } from "@/lib/community-links";

export const DATA = {
  testimonials: [
    {
      id: 1,
      name: "Alumni Batch 2025",
      title: "STEI-R ITB",
      desc: "“Habitutor ga cuman bantu aku lolos PTN, tapi juga bantu ngebentuk habit yang bagus”",
      avatar: "/avatar/testi-avatar-1.webp",
    },
    {
      id: 2,
      name: "Alumni Batch 2025",
      title: "Manajemen UI",
      desc: "“Selama aku di Habitutor itu beda banget feelnya sama bimbel lain, karena di sini kita ga cuman ngejar PTN aja tapi juga jadi punya mindset jangka panjang!”",
      avatar: "/avatar/testi-avatar-2.webp",
    },
    {
      id: 3,
      name: "Alumni Batch 2025",
      title: "Ilmu Komunikasi UI",
      desc: "“Keren si Habitutor baru 2 tahun berdiri tapi udah bisa bantu ribuan orang lolos PTN, thanks Habitutor <3”",
      avatar: "/avatar/testi-avatar-3.webp",
    },
    {
      id: 4,
      name: "Alumni Batch 2025",
      title: "Kedokteran UGM",
      desc: "“Berkat Habitutor aku bisa tembus skor LBE 800+! makasih bangetttt kak firah dan Habitutor!! WORTH IT PARAH”",
      avatar: "/avatar/testi-avatar-1.webp",
    },
    {
      id: 5,
      name: "Alumni Batch 2025",
      title: "Hukum UI",
      desc: "“Masuk Habitutor adalah keputusan terbaik selama persiapan PTN. Sistemnya benar-benar melatih disiplin dan konsistensi belajar!”",
      avatar: "/avatar/testi-avatar-2.webp",
    },
    {
      id: 6,
      name: "Alumni Batch 2025",
      title: "Hukum UGM",
      desc: "“Ga nyangka bisa lolos PTN dengan skor di atas 700. Thanks Habitutor yang udah bantu aku membentuk mindset belajar!”",
      avatar: "/avatar/testi-avatar-3.webp",
    },
    {
      id: 7,
      name: "Alumni Batch 2025",
      title: "Sastra UNSOED",
      desc: "“Yang bikin beda dari Habitutor adalah pendekatan holistiknya. Bukan cuman soal, tapi juga habit dan mental yang dibina.”",
      avatar: "/avatar/testi-avatar-1.webp",
    },
    {
      id: 8,
      name: "Alumni Batch 2025",
      title: "Teknik UPNVY",
      desc: "“Dari yang awalnya males belajar, akhirnya jadi punya rutinitas yang konsisten. Hasilnya? Aku lolos PTN incaran!”",
      avatar: "/avatar/testi-avatar-2.webp",
    },
  ],
  mentor: [
    {
      id: 1,
      name: "Kak Naufal",
      major: "Kedokteran",
      university: "Universitas Indonesia",
      score_snbt: null,
      mentor: "LBI",
      image: "/mentor/kak-naufal.webp",
    },
    {
      id: 2,
      name: "Kak Erfan",
      major: "Kedokteran",
      university: "Universitas Gadjah Mada",
      score_snbt: 740,
      mentor: "PK PM",
      image: "/mentor/kak-erfan.webp",
    },
    {
      id: 3,
      name: "Kak Fajar",
      major: "Kedokteran Gigi",
      university: "Universitas Gadjah Mada",
      score_snbt: null,
      mentor: "PK",
      image: "/mentor/kak-fajar.webp",
    },
    {
      id: 4,
      name: "Kak Hanan",
      major: "Teknik Kimia",
      university: "Universitas Indonesia",
      score_snbt: 736,
      mentor: "PBM",
      image: "/mentor/kak-hanan.webp",
    },
    {
      id: 5,
      name: "Kak Qumil",
      major: "Sistem Informasi Geografis",
      university: "Universitas Gadjah Mada",
      score_snbt: null,
      mentor: "PU",
      image: "/mentor/kak-qumil.webp",
    },
    {
      id: 6,
      name: "Kak Nadia",
      major: "Teknik Kimia",
      university: "Universitas Gadjah Mada",
      score_snbt: null,
      mentor: "LBE",
      image: "/mentor/kak-nadia.webp",
    },
    {
      id: 7,
      name: "Kak Fairuz",
      major: "Teknik Fisika",
      university: "Universitas Gadjah Mada",
      score_snbt: null,
      mentor: "PM",
      image: "/mentor/kak-fairuz.webp",
    },
    {
      id: 8,
      name: "Moh. Basofi Muzaky",
      major: "Farmasi",
      university: "Universitas Gadjah Mada",
      score_snbt: 754,
      mentor: "PPU",
      image: "/mentor/moh-basofi-muzaky.webp",
    },
  ],
  footer: {
    contactWhatsapp: "https://wa.me/6281212686307",
    socials: [
      {
        label: "Instagram",
        icon: InstagramLogoIcon,
        url: "https://www.instagram.com/habitutor.id",
      },
      {
        label: "X",
        icon: XLogoIcon,
        url: "https://x.com/habitutor",
      },
      {
        label: "WhatsApp",
        icon: WhatsappLogoIcon,
        url: COMMUNITY_LINKS.whatsapp,
      },
      {
        label: "Discord",
        icon: DiscordLogoIcon,
        url: COMMUNITY_LINKS.discord,
      },
      // {
      // 	label: "TikTok",
      // 	icon: TiktokLogoIcon,
      // 	url: "https://www.tiktok.com/@habitutor",
      // },
      // {
      // 	label: "YouTube",
      // 	icon: YoutubeLogoIcon,
      // 	url: "https://www.youtube.com/@habitutor",
      // },
    ],
  },
  faq: [
    {
      id: 1,
      question: "Apa yang membedakan dengan tempat lain?",
      answer:
        "Kami di sini menggunakan pendekatan habit belajar dan self development, kami tidak hanya ingin siswa fokus lolos ptn tapi juga bisa berkembang kedepannya",
    },
    {
      id: 2,
      question: "Apakah benar try out nya menggunakan soal asli langsung?",
      answer:
        "Benar, kami menggunakan soal asli 2023-2025 untuk membantu siswa memiliki pengetahuan gambaran soal asli nanti",
    },
    {
      id: 3,
      question: "Di mana mengerjakan TryOut?",
      answer:
        "Kami masih menggunakan ekstensi dari platform try out lain karena alasan tertentu, kamu bisa mengerjakan juga secara gratis dari mengeklik bagian &quot;Kerjakan Try Out&quot; di bagian dashboard Habitutor",
    },
    {
      id: 4,
      question: "Metodenya seperti apa?",
      answer:
        "Belajar menggunakan website dan zoom! untuk waktu sekarang ini, kami memfokuskan di bagian materi prioritas dan mendorong siswa untuk melakukan belajar aktif",
    },
  ],
} as const;
