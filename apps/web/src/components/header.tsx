"use client";

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { DATA } from "@/routes/-home/data";
import { WhatsappLogoIcon, List } from "@phosphor-icons/react";
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";

export default function Header() {
	const session = authClient.useSession();
	const [isOpen, setIsOpen] = useState(false);
	const isMobile = useIsBreakpoint("max", 768);

	const menuItems = session.data?.user ? (
		<>
			<Button variant={"outline"} className="border-0 w-full md:w-auto" asChild>
				<Link to="/home-premium">Premium</Link>
			</Button>
			{session.data.user.role === "admin" && (
				<Button variant={"default"} className="w-full md:w-auto" asChild>
					<Link to="/admin/dashboard">Admin</Link>
				</Button>
			)}
			<Button variant={"outline"} className="w-full md:w-auto" asChild>
				<Link to="/dashboard">Lanjut Belajar</Link>
			</Button>
		</>
	) : (
		<>
			<Button variant={"outline"} className="border-0 w-full md:w-auto " asChild>
				<Link to="/home-premium">Premium</Link>
			</Button>
			<Button variant={"outline"} className="w-full md:w-auto " asChild>
				<a href={DATA.footer.socials[2].url}>
					<WhatsappLogoIcon />Hubungi Kami</a>
			</Button>
			<Button variant={"default"} className="w-full md:w-auto " asChild>
				<Link to="/login">Coba Gratis</Link>
			</Button>
		</>
	);

	return (
		<>
			<div className="fixed inset-x-0 top-0 z-50 flex h-20 flex-row items-center justify-between gap-8 md:rounded-lg border-neutral-300 border-b bg-white px-6 backdrop-blur-lg md:px-8">
				<Link to="/" className="relative size-12 text-primary">
					<Image src={"/logo.svg"} alt="Logo Habitutor" layout="fullWidth" className="pointer-events-none select-none" />
				</Link>

				{/* Desktop Menu */}
				<div className="hidden items-center gap-2 md:flex">
					{menuItems}
				</div>

				{/* Mobile Menu Button */}
				{isMobile && (
					<Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
						<List weight="bold" className="size-6" />
					</Button>
				)}
			</div>

			{/* Mobile Dropdown Menu */}
			{isMobile && isOpen && (
				<div className="fixed inset-x-0 top-20 z-40 bg-white mx-1 shadow-lg border border-t-0 border-neutral-300 rounded-b-lg animate-in fade-in slide-in-from-top-2 duration-300">
					<div className="flex flex-col text-center gap-2 p-4">
						{menuItems}
					</div>
				</div>
			)}
		</>
	);
}