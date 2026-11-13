import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";
import { ReferralsAdminPage } from "./-components/referrals-admin";

const referralSearchSchema = type({
  "search?": "string",
  "page?": "number",
});

export const Route = createFileRoute("/admin/referrals")({
  component: RouteComponent,
  validateSearch: referralSearchSchema,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const searchParam = Route.useSearch({ select: (s) => s.search ?? "" });
  const page = Route.useSearch({ select: (s) => s.page ?? 1 });

  const handleSearchChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: value || undefined,
        page: undefined,
      }),
      replace: true,
    });
  };

  const handlePageChange = (next: number) => {
    navigate({ search: (prev) => ({ ...prev, page: next > 1 ? next : undefined }) });
  };

  return (
    <ReferralsAdminPage
      page={page}
      searchParam={searchParam}
      onSearchChange={handleSearchChange}
      onPageChange={handlePageChange}
    />
  );
}
