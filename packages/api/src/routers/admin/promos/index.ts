import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { admin } from "../../../index";
import { transactionRepo } from "../../transaction/repo";
import { adminUserRepo } from "../users/repo";
import { adminPromoRepo } from "./repo";

const promoInput = type({
  "code?": "string",
  discountType: "'fixed_price' | 'percentage'",
  discountValue: "number",
  "expiresAt?": "string | null",
  "perUserLimit?": "number",
  "isActive?": "boolean",
  packages: type({ productId: "string", usageLimit: "number | null" }).array(),
});

function normalizeCode(code?: string) {
  return (code?.trim() || `PROMO-${crypto.randomUUID().slice(0, 8)}`).toUpperCase();
}

function validateValues(values: {
  code: string;
  discountType: "fixed_price" | "percentage";
  discountValue: number;
  perUserLimit: number;
  expiresAt: Date | null;
}) {
  if (!/^[A-Z0-9_-]{3,32}$/.test(values.code)) {
    throw new ORPCError("BAD_REQUEST", { message: "Code must be 3-32 letters, numbers, underscores, or dashes." });
  }
  if (
    !Number.isFinite(values.discountValue) ||
    values.discountValue <= 0 ||
    (values.discountType === "percentage" && values.discountValue > 100)
  ) {
    throw new ORPCError("BAD_REQUEST", { message: "Invalid discount value." });
  }
  if (!Number.isInteger(values.perUserLimit) || values.perUserLimit < 1) {
    throw new ORPCError("BAD_REQUEST", { message: "Per-user limit must be a positive integer." });
  }
  if (values.expiresAt && Number.isNaN(values.expiresAt.getTime())) {
    throw new ORPCError("BAD_REQUEST", { message: "Invalid expiration date." });
  }
}

type PackageInput = { productId: string; usageLimit: number | null };

async function validatePackages(
  packages: PackageInput[],
  discount: { discountType: "fixed_price" | "percentage"; discountValue: number },
) {
  if (packages.length === 0) {
    throw new ORPCError("BAD_REQUEST", { message: "Select at least one package." });
  }
  if (new Set(packages.map((pkg) => pkg.productId)).size !== packages.length) {
    throw new ORPCError("BAD_REQUEST", { message: "Each package can only be added once." });
  }
  for (const pkg of packages) {
    if (pkg.usageLimit !== null && (!Number.isInteger(pkg.usageLimit) || pkg.usageLimit < 1)) {
      throw new ORPCError("BAD_REQUEST", { message: "Usage limit must be a positive integer." });
    }
    const product = await transactionRepo.getProductById({ id: pkg.productId });
    if (!product || product.type !== "subscription") {
      throw new ORPCError("NOT_FOUND", { message: "Product not found." });
    }
    if (discount.discountType === "fixed_price" && discount.discountValue > Number(product.price)) {
      throw new ORPCError("BAD_REQUEST", { message: "Fixed promo price cannot exceed the package price." });
    }
  }
}

const list = admin
  .route({ path: "/admin/promos", method: "GET", tags: ["Admin - Promos"] })
  .handler(() => adminPromoRepo.list());

const products = admin
  .route({ path: "/admin/promos/products", method: "GET", tags: ["Admin - Promos"] })
  .handler(() => adminUserRepo.listSubscriptionProducts());

const create = admin
  .route({ path: "/admin/promos", method: "POST", tags: ["Admin - Promos"] })
  .input(promoInput)
  .handler(async ({ input, errors }) => {
    const values = {
      code: normalizeCode(input.code),
      discountType: input.discountType,
      discountValue: input.discountValue,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      perUserLimit: input.perUserLimit ?? 1,
      isActive: input.isActive ?? true,
    };
    validateValues(values);
    await validatePackages(input.packages, values);

    try {
      return await adminPromoRepo.create({
        values: { ...values, discountValue: String(values.discountValue) },
        packages: input.packages,
      });
    } catch (error) {
      if (error instanceof Error && "code" in error && (error as { code: string }).code === "23505") {
        throw errors.CONFLICT({ message: "Promo code already exists." });
      }
      throw error;
    }
  });

const update = admin
  .route({ path: "/admin/promos/{id}", method: "PUT", tags: ["Admin - Promos"] })
  .input(promoInput.and(type({ id: "string" })))
  .handler(async ({ input, errors }) => {
    const existing = await adminPromoRepo.getById({ id: input.id });
    if (!existing) throw errors.NOT_FOUND({ message: "Promo code not found." });

    const values = {
      code: normalizeCode(input.code ?? existing.code),
      discountType: input.discountType,
      discountValue: input.discountValue,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      perUserLimit: input.perUserLimit ?? existing.perUserLimit,
      isActive: input.isActive ?? existing.isActive,
    };
    validateValues(values);
    await validatePackages(input.packages, values);

    try {
      return await adminPromoRepo.update({
        id: input.id,
        values: { ...values, discountValue: String(values.discountValue) },
        packages: input.packages,
      });
    } catch (error) {
      if (error instanceof Error && "code" in error && (error as { code: string }).code === "23505") {
        throw errors.CONFLICT({ message: "Promo code already exists." });
      }
      throw error;
    }
  });

export const adminPromoRouter = { list, products, create, update };
