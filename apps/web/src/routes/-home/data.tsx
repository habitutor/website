import { InstagramLogoIcon, WhatsappLogoIcon, XLogoIcon } from "@phosphor-icons/react";

export const DATA = {
	testimone: [
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
	pricing: {
		plans: {
			classroom: {
				label: "Classroom",
				price_monthly: "Rp50.000",
				price_full: "Rp99.000",
				suffix: "sampai SNBT",
				features: [
					{ label: "Akses Full Website", status: "excluded" },
					{ label: "Google Classroom", status: "included" },
					{ label: "Tugas Harian & Kuis", status: "included" },
					{ label: "1000+ Latihan Soal", status: "included" },
					{ label: "Habit Tracker & Grup", status: "included" },
					{ label: "Matrikulasi Subtest", status: "included" },
					{ label: "Live Class (3x/Minggu)", status: "excluded" },
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
				price_full: "Rp119.000",
				suffix: "sampai SNBT",
				features: [
					{ label: "Akses Full Website", status: "excluded" },
					{ label: "Google Classroom", status: "excluded" },
					{ label: "Tugas Harian & Kuis", status: "excluded" },
					{ label: "1000+ Latihan Soal", status: "excluded" },
					{ label: "Habit Tracker & Grup", status: "excluded" },
					{ label: "Matrikulasi Subtest", status: "excluded" },
					{ label: "Live Class (5x/Minggu)", status: "included" },
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
				price_full: "Rp149.000",
				suffix: "sampai SNBT",
				features: [
					{ label: "Akses Full Website", status: "excluded" },
					{ label: "Google Classroom", status: "included" },
					{ label: "Tugas Harian & Kuis", status: "included" },
					{ label: "1000+ Latihan Soal", status: "included" },
					{ label: "Habit Tracker & Grup", status: "included" },
					{ label: "Matrikulasi Subtest", status: "included" },
					{ label: "Live Class (5x/Minggu)", status: "included" },
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
				price_now: "Rp249.000",
				original_price: "Rp1.000.000",
				suffix: "sampai SNBT",
				features: [
					{ label: "Akses Full Website", status: "included" },
					{ label: "1000+ Soal Dasar SNBT", status: "included" },
					{ label: "250+ Video Materi", status: "included" },
					{ label: "1000+ Latihan Soal", status: "included" },
					{ label: "Habit Tracker & Grup", status: "included" },
					{ label: "Matrikulasi Subtest", status: "included" },
					{ label: "Live Class (5x/Minggu)", status: "included" },
					{ label: "Mentor UI, ITB, UGM", status: "included" },
					{ label: "Try Out & Pembahasan", status: "limited", value: "15x" },
				],
				cta: {
					label: "Langganan Sekarang",
					url: "/premium",
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
	faq: [
		{	
			id: 1,
			question: "Bagaimana cara akses TryOut UTBK?",
			answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
		},
		{
			id: 2,
			question: "Bagaimana cara akses TryOut UTBK?",
			answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
		},
		{
			id: 3,
			question: "Berapa kali bisa mengerjakan TryOut?",
			answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
		},
		{
			id: 4,
			question: "Di mana lihat hasil TryOut?",
			answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
		},
		{
			id: 5,
			question: "Bagaimana cara akses TryOut UTBK?",
			answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
		}
	],
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
