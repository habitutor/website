import { PERINTIS_2027 } from "../../lib/constants";
import { transactionRepo } from "./repo";

export async function getPerintisPricing() {
  const soldCount = await transactionRepo.countSuccessfulTransactionsBySlug({ slug: PERINTIS_2027.SLUG });
  const earlyBirdRemaining = Math.max(PERINTIS_2027.EARLY_BIRD_QUOTA - soldCount, 0);
  const isEarlyBird = earlyBirdRemaining > 0;

  return {
    soldCount,
    earlyBirdRemaining,
    isEarlyBird,
    currentPrice: isEarlyBird ? PERINTIS_2027.EARLY_BIRD_PRICE : PERINTIS_2027.REGULAR_PRICE,
  };
}
