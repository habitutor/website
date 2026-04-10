import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Link, useMatches } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn, type TRoutes } from "@/lib/utils";

type BreadcrumbEntry = { label: string; href: string };

function normalizeBreadcrumb(raw: string | BreadcrumbEntry[]): BreadcrumbEntry[] {
  if (typeof raw === "string") return [{ label: raw, href: "" }];
  return raw;
}

export function AdminBreadcrumbs() {
  const matches = useMatches();
  const crumbs: BreadcrumbEntry[] = [];

  for (const match of matches) {
    if (!match.staticData?.breadcrumb) continue;
    for (const entry of normalizeBreadcrumb(match.staticData.breadcrumb)) {
      crumbs.push(entry);
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/admin/dashboard">Admin</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <BreadcrumbItem key={`${crumb.label}-${index}`}>
              <BreadcrumbSeparator />
              {isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.href as TRoutes}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

interface AdminHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  backTo?: TRoutes;
}

export function AdminHeader({ title, description, children, backTo }: AdminHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {backTo && (
          <Link
            to={backTo}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mb-4 inline-flex items-center gap-1")}
          >
            <ArrowLeftIcon size={20} weight="bold" />
            Kembali
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
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
