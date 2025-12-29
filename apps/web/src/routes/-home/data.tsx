import {
  DiscordLogoIcon,
  InstagramLogoIcon,
  TiktokLogoIcon,
  TwitterLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react";

export const DATA = {
  pricing: {
    title: "Investasi Belajar yang Bikin Kamu Bertumbuh",
    subtitle: "Mulai gratis. Upgrade kalau mau kebiasaan yang lebih kuat.",
    starter: {
      label: "Starter",
      price: "Gratis",
      features: [
        "Tracking Progress & Streak",
        "Akses Materi Dasar",
        "Flashcard Harian",
        "Komunitas Dasar",
      ],
      cta: "Mulai Gratis Sekarang",
    },
    premium: {
      label: "Premium",
      price: "Rp100.000",
      suffix: "/bulan",
      features: [
        "Ratusan Video Pembahasan",
        "Tryout & Analisis Kedalaman",
        "Tips & Tricks Materi",
        "Semua Fitur Gratis",
      ],
      cta: "Langganan Sekarang",
    },
  },
  footer: {
    socials: [
      {
        label: "Instagram",
        icon: InstagramLogoIcon,
        url: "https://www.instagram.com/habitutor",
      },
      {
        label: "Twitter",
        icon: TwitterLogoIcon,
        url: "https://www.twitter.com/habitutor",
      },
      {
        label: "Discord",
        icon: DiscordLogoIcon,
        url: "https://discord.gg/habitutor",
      },
      {
        label: "TikTok",
        icon: TiktokLogoIcon,
        url: "https://www.tiktok.com/@habitutor",
      },
      {
        label: "YouTube",
        icon: YoutubeLogoIcon,
        url: "https://www.youtube.com/@habitutor",
      },
    ],
  },
} as const;
