import { useQuery } from "@tanstack/react-query";
import { getFallbackPremiumPackages } from "@/lib/premium-packages";
import { client, orpc } from "@/utils/orpc";

export function usePremiumPackages() {
  const { data, isPending } = useQuery({
    queryKey: orpc.transaction.packages.queryKey(),
    // Public landing page: fall back to default pricing instead of surfacing
    // a global error toast when the API is unreachable.
    queryFn: () => client.transaction.packages().catch(() => null),
  });

  const packages = data ?? getFallbackPremiumPackages();
  const cheapestPrice = Math.min(...packages.map((pkg) => pkg.currentPrice));

  return { isPending, packages, cheapestPrice, isPromo: packages[0]?.isPromo ?? false };
}
