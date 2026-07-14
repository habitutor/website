import { type } from "arktype";
import { admin } from "../../../index";
import { transactionRepo } from "../../transaction/repo";
import { markTransactionAsSuccess } from "../../transaction/sync";
import { adminUserRepo } from "../users/repo";
import { adminTransactionRepo } from "./repo";

const listTransactions = admin
  .route({
    path: "/admin/transactions",
    method: "GET",
    tags: ["Admin - Transactions"],
  })
  .input(
    type({
      "page?": "number",
      "limit?": "number",
      "search?": "string",
      "status?": "string",
      "paymentType?": "string",
      "from?": "string",
      "to?": "string",
      "sortBy?": "'date' | 'amount' | 'status' | 'paymentType' | 'user' | 'package'",
      "sortDirection?": "'asc' | 'desc'",
    }),
  )
  .handler(async ({ input, errors }) => {
    const page = Math.max(1, Math.floor(input.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(input.limit ?? 25)));
    const from = input.from ? new Date(input.from) : undefined;
    const to = input.to ? new Date(input.to) : undefined;
    if (from && Number.isNaN(from.getTime())) throw errors.BAD_REQUEST({ message: "Invalid start date" });
    if (to && Number.isNaN(to.getTime())) throw errors.BAD_REQUEST({ message: "Invalid end date" });

    const result = await adminTransactionRepo.list({
      limit,
      offset: (page - 1) * limit,
      search: input.search?.trim() || undefined,
      status: input.status,
      paymentType: input.paymentType,
      from,
      to,
      sortBy: input.sortBy ?? "date",
      sortDirection: input.sortDirection ?? "desc",
    });

    return {
      data: result.rows,
      total: result.total,
      page,
      pageCount: Math.ceil(result.total / limit),
    };
  });

const filterOptions = admin
  .route({
    path: "/admin/transactions/filter-options",
    method: "GET",
    tags: ["Admin - Transactions"],
  })
  .handler(() => adminTransactionRepo.filterOptions());

const simulate = admin
  .route({
    path: "/admin/transactions/simulate",
    method: "POST",
    tags: ["Admin - Transactions"],
  })
  .input(
    type({
      userId: "string",
      productSlug: "string",
      status: "'success' | 'pending' | 'failed'",
    }),
  )
  .handler(async ({ input, errors }) => {
    if (process.env.NODE_ENV === "production" || process.env.ENABLE_ADMIN_PAYMENT_SIMULATION !== "true") {
      throw errors.FORBIDDEN({ message: "Payment simulation is disabled in this environment." });
    }

    const [selectedUser, product] = await Promise.all([
      adminUserRepo.getById({ id: input.userId }),
      transactionRepo.getProductBySlug({ slug: input.productSlug }),
    ]);
    if (!selectedUser) throw errors.NOT_FOUND({ message: "User not found" });
    if (!product) throw errors.NOT_FOUND({ message: "Product not found" });

    const orderId = `sim_${crypto.randomUUID()}`;
    await transactionRepo.createTransaction({
      id: orderId,
      productId: product.id,
      grossAmount: product.price,
      userId: selectedUser.id,
      isSimulation: true,
    });
    await transactionRepo.updateGatewayMetadata({
      orderId,
      gatewayTransactionId: orderId,
      gatewayStatus: `simulated_${input.status}`,
      paymentType: "admin_simulation",
      fraudStatus: input.status === "success" ? "accept" : undefined,
      statusCode: input.status === "success" ? "200" : "201",
    });

    if (input.status === "success") {
      await markTransactionAsSuccess(orderId);
    } else if (input.status === "failed") {
      await transactionRepo.updateTransactionStatus({ orderId, status: "failed" });
    }

    return { orderId, status: input.status };
  });

const simulationConfig = admin
  .route({
    path: "/admin/transactions/simulation-config",
    method: "GET",
    tags: ["Admin - Transactions"],
  })
  .handler(() => ({
    enabled: process.env.NODE_ENV !== "production" && process.env.ENABLE_ADMIN_PAYMENT_SIMULATION === "true",
  }));

export const adminTransactionRouter = {
  list: listTransactions,
  filterOptions,
  simulate,
  simulationConfig,
};
