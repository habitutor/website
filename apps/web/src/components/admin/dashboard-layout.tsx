import { Link, useLocation, useMatches } from "@tanstack/react-router";
import { Fragment } from "react";

const ROUTE_LABELS: Record<string, string> = {
	dashboard: "Dashboard",
	"practice-packs": "Practice Packs",
	questions: "Question Bank",
	classes: "Classes",
	create: "Create",
};

function generateBreadcrumbs(pathname: string, matches: ReturnType<typeof useMatches>) {
	const segments = pathname.split("/").filter(Boolean);
	const breadcrumbs: Array<{ label: string; href?: string }> = [{ label: "Admin", href: "/admin/dashboard" }];

	let currentPath = "/admin";
	for (let i = 1; i < segments.length; i++) {
		const segment = segments[i];
		if (!segment) continue;

		currentPath += `/${segment}`;

		// Check if it's a parameter (starts with $ or contains numbers)
		const isParam = segment.startsWith("$") || /^\d+$/.test(segment);
		const cleanSegment = segment.replace(/^\$/, "");

		if (isParam) {
			// For parameters, try to get title from route match
			const match = matches.find((m) => m.pathname === currentPath);
			const routeId = match?.routeId;
			if (routeId && routeId.includes("contentId")) {
				breadcrumbs.push({ label: "Content" });
			} else if (routeId && routeId.includes("shortName")) {
				breadcrumbs.push({ label: cleanSegment.toUpperCase() });
			} else {
				// For numeric IDs or other params, show shortened version
				breadcrumbs.push({ label: `#${cleanSegment.slice(0, 6)}` });
			}
		} else {
			const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
			const isLast = i === segments.length - 1;
			breadcrumbs.push({ label, href: isLast ? undefined : currentPath });
		}
	}

	return breadcrumbs;
}

export function AdminBreadcrumbs() {
	const location = useLocation();
	const matches = useMatches();
	const breadcrumbs = generateBreadcrumbs(location.pathname, matches);

	return (
		<nav className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
			<Link to="/admin/dashboard" className="hover:text-foreground">
				Admin
			</Link>
			{breadcrumbs.slice(1).map((crumb) => (
				<Fragment key={`${crumb.label}-${crumb.href || "current"}`}>
					<span className="text-muted-foreground/50">/</span>
					{crumb.href ? (
						<Link to={crumb.href} className="hover:text-foreground">
							{crumb.label}
						</Link>
					) : (
						<span className="text-foreground">{crumb.label}</span>
					)}
				</Fragment>
			))}
		</nav>
	);
}

interface AdminHeaderProps {
	title: string;
	description?: string;
	children?: React.ReactNode;
}

export function AdminHeader({ title, description, children }: AdminHeaderProps) {
	return (
		<div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<h1 className="font-bold text-2xl tracking-tight sm:text-3xl">{title}</h1>
				{description && <p className="mt-1 text-muted-foreground text-sm">{description}</p>}
			</div>
			{children && <div className="flex items-center gap-2">{children}</div>}
		</div>
	);
}

export function AdminContent({ children }: { children: React.ReactNode }) {
	return <div className="flex-1">{children}</div>;
}

interface AdminContainerProps {
	children: React.ReactNode;
}

export function AdminContainer({ children }: AdminContainerProps) {
	return <main className="flex-1 p-4 pt-0">{children}</main>;
}
