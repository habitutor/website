import {
  ArrowLeftIcon,
  BooksIcon,
  Broadcast,
  House,
  Megaphone,
  Package,
  Question,
  ReceiptIcon,
  TagIcon,
  TicketIcon,
  User,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { Link, useLocation, useMatches } from "@tanstack/react-router";
import { Fragment } from "react";
import type { TRoutes } from "@/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "practice-packs": "Practice Packs",
  questions: "Bank Soal",
  classes: "Kelas",
  users: "Users",
  create: "Buat Baru",
  tryout: "Try Out",
  "passing-grade": "Passing Grade",
  "live-class": "Live Class",
  announcement: "Pengumuman",
  "dashboard-content": "Live Class",
  recordings: "Recordings",
  referrals: "Referral Transactions",
  transactions: "Transactions",
  promos: "Promo Codes",
};

// Ikon header mengikuti ikon menu samping, jadi semua halaman admin punya header yang seragam.
const SECTION_ICONS: Record<string, Icon> = {
  dashboard: House,
  tryout: TicketIcon,
  "practice-packs": Package,
  questions: Question,
  classes: BooksIcon,
  "live-class": Broadcast,
  announcement: Megaphone,
  "dashboard-content": Megaphone,
  recordings: VideoCameraIcon,
  users: User,
  referrals: TicketIcon,
  transactions: ReceiptIcon,
  promos: TagIcon,
};

type BreadcrumbRouteMatch = {
  pathname: string;
  routeId?: string;
  loaderData?: unknown;
};

export function generateBreadcrumbs(pathname: string, matches: BreadcrumbRouteMatch[]) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Array<{ label: string; href?: string }> = [{ label: "Admin", href: "/admin/dashboard" }];

  let currentPath = "/admin";
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    if (!segment) continue;

    currentPath += `/${segment}`;

    // Check if it's a parameter (starts with $ or contains numbers or is a UUID)
    const isParam =
      segment.startsWith("$") ||
      /^\d+$/.test(segment) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
    const cleanSegment = segment.replace(/^\$/, "");

    if (isParam) {
      // For parameters, try to get title from route match
      const match = matches.find((m) => m.pathname === currentPath);
      const loaderData = match?.loaderData as { breadcrumbTitle?: string } | undefined;

      if (loaderData?.breadcrumbTitle) {
        breadcrumbs.push({ label: loaderData.breadcrumbTitle });
      } else {
        const routeId = match?.routeId;
        if (routeId?.includes("contentId")) {
          breadcrumbs.push({ label: "Content" });
        } else if (routeId?.includes("shortName")) {
          breadcrumbs.push({ label: cleanSegment.toUpperCase() });
        } else {
          // For numeric IDs or other params, show shortened version
          breadcrumbs.push({ label: `#${cleanSegment.slice(0, 6)}` });
        }
      }
    } else {
      const label =
        ROUTE_LABELS[segment] ||
        (segments[i - 1] === "classes" ? segment.toUpperCase() : segment.charAt(0).toUpperCase() + segment.slice(1));
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
    <nav className="flex items-center gap-2 text-sm font-medium text-sr-muted">
      <Link to="/admin/dashboard" className="hover:text-foreground">
        Admin
      </Link>
      {breadcrumbs.slice(1).map((crumb) => (
        <Fragment key={`${crumb.label}-${crumb.href || "current"}`}>
          <span className="text-sr-line">/</span>
          {crumb.href ? (
            <Link to={crumb.href} className="hover:text-sr-blue-600">
              {crumb.label}
            </Link>
          ) : (
            <span className="font-bold text-sr-ink">{crumb.label}</span>
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
  backTo?: TRoutes;
}

export function AdminHeader({ title, description, children, backTo }: AdminHeaderProps) {
  const location = useLocation();
  const HeaderIcon = SECTION_ICONS[location.pathname.split("/")[2] ?? ""] ?? House;

  return (
    <div className="relative mb-6 flex flex-col gap-4 overflow-hidden rounded-sr-xl sr-card-blue p-5 shadow-sr-2 transition-shadow duration-300 hover:shadow-sr-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:p-7">
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-12 size-56 rounded-full bg-white/10" />
      <div className="relative z-10 min-w-0">
        {backTo && (
          <Link
            to={backTo}
            className="mb-3 inline-flex sr-action items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/25 hover:bg-white/25"
          >
            <ArrowLeftIcon size={14} weight="bold" />
            Kembali
          </Link>
        )}
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-sr-md bg-white/15 text-sr-sun-400 ring-1 ring-white/20">
            <HeaderIcon weight="fill" className="size-6" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
            {description && <p className="mt-1 text-sm leading-relaxed text-white/80">{description}</p>}
          </div>
        </div>
      </div>
      {children && (
        <div className="relative z-10 flex flex-wrap items-center gap-2 [&_[data-slot=button]]:border-transparent [&_[data-slot=button]]:text-sr-ink [&_[data-slot=button]]:shadow-sr-sun [&_[data-slot=button]]:[background:var(--sr-grad-sun)]">
          {children}
        </div>
      )}
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
  return (
    <main className="[&_[data-slot=card]]:to-sr-sun-50 min-w-0 flex-1 p-4 pt-0 [&_[data-slot=card]]:sr-card-hover [&_[data-slot=card]]:border-sr-sun-200/70 [&_[data-slot=card]]:bg-gradient-to-br [&_[data-slot=card]]:from-white [&_[data-slot=card]]:via-sr-ivory [&_[data-slot=card]]:shadow-sr-1 [&_[data-slot=table-cell]]:py-3.5 [&_[data-slot=table-head]]:h-11 [&_[data-slot=table-head]]:bg-sr-ivory/80 [&_[data-slot=table-head]]:text-[11px] [&_[data-slot=table-head]]:font-extrabold [&_[data-slot=table-head]]:tracking-wider [&_[data-slot=table-head]]:text-sr-muted [&_[data-slot=table-head]]:uppercase [&_[data-slot=table-row]]:border-sr-line [&_[data-slot=table-row]]:transition-colors [&_[data-slot=table-row]]:duration-200 [&_tbody_[data-slot=table-row]:hover]:bg-sr-blue-50/60">
      {children}
    </main>
  );
}

/** Kolom pertama menempel di HP supaya tabel lebar tetap terbaca saat digeser. */
export const STICKY_FIRST_COLUMN =
  "max-md:[&_td:first-child]:sticky max-md:[&_td:first-child]:left-0 max-md:[&_td:first-child]:z-10 max-md:[&_td:first-child]:bg-white max-md:[&_th:first-child]:sticky max-md:[&_th:first-child]:left-0 max-md:[&_th:first-child]:z-10 max-md:[&_th:first-child]:bg-sr-ivory";
