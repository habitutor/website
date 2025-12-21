import { createContext } from "@habitutor/api/context";
import { appRouter } from "@habitutor/api/routers/index";
import {
  createORPCClient,
  type InferClientBodyOutputs,
  isDefinedError,
} from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { StandardRPCJsonSerializer } from "@orpc/client/standard";
import type { RouterClient } from "@orpc/server";
import { createRouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { toast } from "sonner";

const serializer = new StandardRPCJsonSerializer();

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isDefinedError(error))
        toast.error(`${error}`, {
          action: {
            label: "Retry",
            onClick: () => {
              queryClient.invalidateQueries();
            },
          },
        });
    },
  }),
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      queryKeyHashFn(queryKey) {
        const [json, meta] = serializer.serialize(queryKey);
        return JSON.stringify({ json, meta });
      },
      staleTime: 60 * 1000, // > 0 to prevent immediate refetching on mount
    },
    dehydrate: {
      serializeData(data) {
        const [json, meta] = serializer.serialize(data);
        return { json, meta };
      },
    },
    hydrate: {
      deserializeData(data) {
        return serializer.deserialize(data.json, data.meta);
      },
    },
  },
});

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(appRouter, {
      context: async ({ req }) => {
        return createContext({ context: req });
      },
    })
  )
  .client((): RouterClient<typeof appRouter> => {
    const link = new RPCLink({
      url: `${import.meta.env.VITE_SERVER_URL}/rpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    });

    return createORPCClient(link);
  });

export const client: RouterClient<typeof appRouter> = getORPCClient();

export type BodyOutputs = InferClientBodyOutputs<typeof client>;

export const orpc = createTanstackQueryUtils(client);
