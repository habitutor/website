import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type } from "arktype";

const getHello = createServerFn()
  .inputValidator(type("string"))
  .handler(({ data }) => {
    return {
      message: `Hello ${data}`,
    };
  });

export const Route = createFileRoute("/load")({
  component: RouteComponent,
  loader: async () => {
    const { message } = await getHello({ data: "Devin" });

    return { message };
  },
});

function RouteComponent() {
  const { message } = Route.useLoaderData();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 pt-20">
      <h1 className="font-bold text-lg">Server Loader (with createServerFn)</h1>
      <div className="flex flex-col gap-2 rounded-md border bg-background p-4">
        <h2 className="font-bold">Message</h2>
        {message}
      </div>
    </div>
  );
}
