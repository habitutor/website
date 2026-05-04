import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";
import { ReferralsAdminPage } from "./-components/referrals-admin";

const referralSearchSchema = type({
  "search?": "string",
  "after?": "string",
  "before?": "string",
});

export const Route = createFileRoute("/admin/referrals")({
  staticData: { breadcrumb: "Referrals" },
  component: RouteComponent,
  validateSearch: referralSearchSchema,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const after = Route.useSearch({ select: (s) => s.after ?? null });
  const before = Route.useSearch({ select: (s) => s.before ?? null });
  const searchParam = Route.useSearch({ select: (s) => s.search ?? "" });

  const handleSearchChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: value || undefined,
        after: undefined,
        before: undefined,
      }),
      replace: true,
    });
  };

  const handleNext = (nextAfter: string) => {
    navigate({
      search: (prev) => ({ ...prev, after: nextAfter, before: undefined }),
    });
  };

  const handlePrevious = (prevCursor: string) => {
    navigate({
      search: (prev) => ({ ...prev, before: prevCursor, after: undefined }),
    });
  };

  return (
    <ReferralsAdminPage
      after={after}
      before={before}
      searchParam={searchParam}
      onSearchChange={handleSearchChange}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />
  );
}
