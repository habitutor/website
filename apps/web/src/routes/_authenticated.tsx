import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Container } from "@/components/ui/container";
import { getUser } from "@/lib/get-user";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
  beforeLoad: async () => {
    const session = await getUser();

    return { session };
  },
  loader: ({ context }) => {
    if (!context.session)
      throw redirect({
        to: "/login",
      });
  },
});

function AuthLayout() {
  return (
    <Container className="pt-20">
      <Outlet />
    </Container>
  );
}
