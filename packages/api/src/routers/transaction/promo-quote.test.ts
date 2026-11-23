import { beforeEach, describe, expect, it, mock } from "bun:test";

type Promo = { id: string; discountType: "fixed_price" | "percentage"; discountValue: string };

let product: { id: string } | undefined;
let validation: { ok: true; promo: Promo } | { ok: false; reason: string };

mock.module("./repo", () => ({ transactionRepo: { getProductBySlug: async () => product } }));
mock.module("./promo-repo", () => ({ promoRepo: { validate: async () => validation } }));

const { quotePromo } = await import("./promo-quote");

const base = { code: "HABIT70", userId: "u1" } as const;

describe("quotePromo", () => {
  beforeEach(() => {
    product = { id: "p1" };
    validation = { ok: true, promo: { id: "promo1", discountType: "percentage", discountValue: "70" } };
  });

  it("prices off NORMAL_PRICE", async () => {
    expect(await quotePromo({ ...base, slug: "paketutbk2027nolive" })).toEqual({
      ok: true,
      promoId: "promo1",
      originalPrice: 200_000,
      finalPrice: 60_000,
    });
    expect(await quotePromo({ ...base, slug: "paketmandiri2027" })).toMatchObject({ finalPrice: 105_000 });
  });

  it("maps rejection reasons to Indonesian messages", async () => {
    validation = { ok: false, reason: "usage_limit_reached" };
    expect(await quotePromo({ ...base, slug: "paketutbk2027" })).toEqual({
      ok: false,
      message: "Kuota kode promo untuk paket ini sudah habis.",
    });
  });

  it("rejects when the final price is below 1", async () => {
    validation = { ok: true, promo: { id: "promo1", discountType: "percentage", discountValue: "100" } };
    expect(await quotePromo({ ...base, slug: "paketutbk2027" })).toEqual({
      ok: false,
      message: "Kode promo tidak bisa digunakan untuk paket ini.",
    });
  });

  it("rejects when the product is missing", async () => {
    product = undefined;
    expect(await quotePromo({ ...base, slug: "paket1bulan" })).toMatchObject({ ok: false });
  });
});
