import { useQuery } from "@tanstack/react-query";
import { client, orpc } from "@/utils/orpc";
import { PERINTIS_FALLBACK_PRICING } from "./data";

export function usePerintisPricing() {
  const { data, isPending } = useQuery({
    queryKey: orpc.transaction.perintisAvailability.queryKey(),
    // Public landing page: fall back to default pricing instead of surfacing
    // a global error toast when the API is unreachable.
    queryFn: () => client.transaction.perintisAvailability().catch(() => null),
  });

  return {
    isPending,
    originalPrice: data?.originalPrice ?? PERINTIS_FALLBACK_PRICING.originalPrice,
    earlyBirdPrice: data?.earlyBirdPrice ?? PERINTIS_FALLBACK_PRICING.earlyBirdPrice,
    regularPrice: data?.regularPrice ?? PERINTIS_FALLBACK_PRICING.regularPrice,
    currentPrice: data?.currentPrice ?? PERINTIS_FALLBACK_PRICING.earlyBirdPrice,
    earlyBirdRemaining: data?.earlyBirdRemaining ?? PERINTIS_FALLBACK_PRICING.earlyBirdQuota,
    isEarlyBird: data?.isEarlyBird ?? true,
  };
}
