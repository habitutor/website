import { createFileRoute } from "@tanstack/react-router";
import { type } from "arktype";
import { ReferralsAdminPage } from "./-components/referrals-admin";

const referralSearchSchema = type({
  "search?": "string",
  "cursor?": "string",
  "cursorHistory?": "string[]",
});

export const Route = createFileRoute("/admin/referrals")({
  component: RouteComponent,
  validateSearch: referralSearchSchema,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const cursor = Route.useSearch({ select: (s) => s.cursor ?? null });
  const searchParam = Route.useSearch({ select: (s) => s.search ?? "" });
  const hasPrevious = Route.useSearch({ select: (s) => Boolean(s.cursor) || (s.cursorHistory?.length ?? 0) > 0 });

  const handleSearchChange = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: value || undefined,
        cursor: undefined,
        cursorHistory: undefined,
      }),
      replace: true,
    });
  };

  const handleNext = (nextCursor: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        cursorHistory: prev.cursor ? [...(prev.cursorHistory ?? []), prev.cursor] : (prev.cursorHistory ?? []),
        cursor: nextCursor,
      }),
    });
  };

  const handlePrevious = () => {
    navigate({
      search: (prev) => {
        const history = prev.cursorHistory ?? [];
        if (history.length > 0) {
          return {
            ...prev,
            cursor: history[history.length - 1],
            cursorHistory: history.slice(0, -1),
          };
        }
        return { ...prev, cursor: undefined, cursorHistory: undefined };
      },
    });
  };

  return (
    <ReferralsAdminPage
      cursor={cursor}
      searchParam={searchParam}
      hasPrevious={hasPrevious}
      onSearchChange={handleSearchChange}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />
  );
}
