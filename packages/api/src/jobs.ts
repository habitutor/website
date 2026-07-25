import { logger } from "@habitutor/shared/logger";
import { reconcileStalePendingTransactions } from "./routers/transaction/sync";

const RECONCILIATION_INTERVAL_MS = 5 * 60 * 1000;

let reconciliationTimer: ReturnType<typeof setInterval> | null = null;
let isSweepRunning = false;

async function runReconciliationSweep() {
  if (isSweepRunning) return;
  isSweepRunning = true;

  try {
    await reconcileStalePendingTransactions();
  } catch (error) {
    logger.error("Transaction reconciliation sweep failed", { error });
  } finally {
    isSweepRunning = false;
  }
}

export function startTransactionReconciliationJob() {
  if (reconciliationTimer) return;

  reconciliationTimer = setInterval(runReconciliationSweep, RECONCILIATION_INTERVAL_MS);
  // Run immediately so transactions stuck during a deploy are repaired at startup.
  void runReconciliationSweep();
}

export function stopTransactionReconciliationJob() {
  if (!reconciliationTimer) return;

  clearInterval(reconciliationTimer);
  reconciliationTimer = null;
}
