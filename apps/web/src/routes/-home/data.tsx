import { InstagramLogoIcon, WhatsappLogoIcon, XLogoIcon } from "@phosphor-icons/react";

export const DATA = {
	testimone: [
		{
			id: 1,
			name: "Alumni Batch 2025",
			title: "Siswa SMA",
			desc: "“Habitutor ga cuman bantu aku lolos PTN, tapi juga bantu ngebentuk habit yang bagus”",
		},
		{
			id: 2,
			name: "Alumni Batch 2025",
			title: "Peserta Gap Year",
			desc: "“Selama aku di Habitutor itu beda banget feelnya sama bimbel lain, karena di sini kita ga cuman ngejar PTN aja tapi juga jadi punya mindset jangka panjang!”",
		},
		{
			id: 3,
			name: "Alumni Batch 2025",
			title: "Calon Mahasiswa",
			desc: "“Keren si Habitutor baru 2 tahun berdiri tapi udah bisa bantu ribuan orang lolos PTN, thanks Habitutor <3”",
		},
		{
			id: 4,
			name: "Alumni Batch 2025",
			title: "Pengguna Setia",
			desc: "“Berkat Habitutor aku bisa tembus skor LBE 800+! makasih bangetttt kak firah dan Habitutor!! WORTH IT PARAH”",
		},
	],
	pricing: {
		plans: {
			classroom: {
				label: "Classroom",
				price_monthly: "Rp50.000",
				price_full: "Rp119.000",
				suffix: "s.d UTBK",
				features: [
					{ label: "Akses Full Website", status: "excluded" },
					{ label: "Google Classroom", status: "excluded" },
					{ label: "Tugas Harian & Kuis", status: "included" },
					{ label: "1000+ Latihan Soal", status: "included" },
					{ label: "Habit Tracker & Grup", status: "included" },
					{ label: "Matrikulasi Subtest", status: "included" },
					{ label: "Live Class (3x/Minggu)", status: "included" },
					{ label: "Mentor UI, ITB, UGM", status: "excluded" },
					{ label: "Try Out & Pembahasan", status: "limited", value: "3x" },
				],
				cta: {
					label: "Mulai Sekarang",
					url: "http://lynk.id/habitutor/64p096g69747",
				},
			},

			mentoring_perintis: {
				label: "Mentoring Perintis",
				price_monthly: "Rp99.000",
				price_full: "Rp179.000",
				suffix: "s.d UTBK",
				features: [
					{ label: "Akses Full Website", status: "excluded" },
					{ label: "Google Classroom", status: "excluded" },
					{ label: "Tugas Harian & Kuis", status: "excluded" },
					{ label: "1000+ Latihan Soal", status: "excluded" },
					{ label: "Habit Tracker & Grup", status: "excluded" },
					{ label: "Matrikulasi Subtest", status: "excluded" },
					{ label: "Live Class (3x/Minggu)", status: "included" },
					{ label: "Mentor UI, ITB, UGM", status: "included" },
					{ label: "Try Out & Pembahasan", status: "excluded" },
				],
				cta: {
					label: "Mulai Sekarang",
					url: "http://lynk.id/habitutor/z19qjzqr0ln9",
				},
			},

			mentoring_privilege: {
				label: "Mentoring Privilege",
				price_full: "Rp225.000",
				suffix: "s.d UTBK",
				features: [
					{ label: "Akses Full Website", status: "excluded" },
					{ label: "Google Classroom", status: "excluded" },
					{ label: "Tugas Harian & Kuis", status: "included" },
					{ label: "1000+ Latihan Soal", status: "included" },
					{ label: "Habit Tracker & Grup", status: "included" },
					{ label: "Matrikulasi Subtest", status: "included" },
					{ label: "Live Class (3x/Minggu)", status: "included" },
					{ label: "Mentor UI, ITB, UGM", status: "included" },
					{ label: "Try Out & Pembahasan", status: "limited", value: "3x" },
				],
				cta: {
					label: "Mulai Sekarang",
					url: "http://lynk.id/habitutor/y2rjxkq02d13",
				},
			},

			ultimate_bundling: {
				label: "Ultimate Bundling",
				badge: "Paling Lengkap",
				price_now: "Rp199.000",
				original_price: "Rp1.000.000",
				suffix: "s.d UTBK",
				features: [
					{ label: "Akses Full Website", status: "included" },
					{ label: "1000+ Soal Dasar SNBT", status: "included" },
					{ label: "250+ Video Materi", status: "included" },
					{ label: "1000+ Latihan Soal", status: "included" },
					{ label: "Habit Tracker & Grup", status: "included" },
					{ label: "Matrikulasi Subtest", status: "included" },
					{ label: "Live Class (3x/Minggu)", status: "included" },
					{ label: "Mentor UI, ITB, UGM", status: "included" },
					{ label: "Try Out & Pembahasan", status: "limited", value: "15x" },
				],
				cta: {
					label: "Langganan Sekarang",
					url: "/pricing",
				},
			},
		},
	},
	pricing_tryout: {
		one: {
			label: "1x Try Out UTBK Habitutor",
			price: "Rp15.000",
			features: ["Try Out SNBT-UTBK 1 Kali", "Pembahasan & Analisis", "Penilaian IRT", "Dapat dilakukan kapan saja"],
			cta: {
				label: "Mulai Sekarang",
				url: "http://lynk.id/habitutor/y2rjxkq02d13",
			},
		},
		two: {
			label: "10x Try Out UTBK Habitutor",
			price: "Rp99.000",
			features: ["Try Out SNBT-UTBK 10 Kali", "Pembahasan & Analisis", "Penilaian IRT", "Dapat dilakukan kapan saja"],
			cta: {
				label: "Mulai Sekarang",
				url: "http://lynk.id/habitutor/dzon2p8qgx9n",
			},
		},
		three: {
			label: "15x Try Out UTBK Habitutor",
			price: "Rp120.000",
			features: ["Try Out SNBT-UTBK 15 Kali", "Pembahasan & Analisis", "Penilaian IRT", "Dapat dilakukan kapan saja"],
			cta: {
				label: "Mulai Sekarang",
				url: "http://lynk.id/habitutor/xw1ov34dg98g",
			},
		},
	},
	footer: {
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
				url: "https://wa.me/6283854264330",
			},
			// {
			// 	label: "Discord",
			// 	icon: DiscordLogoIcon,
			// 	url: "https://discord.gg/habitutor",
			// },
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
} as const;
