import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PremiumPackageSlug } from "@/lib/premium-packages";
import type { PromoQuote } from "@/routes/home-premium/-components/pricing";
import { usePremiumPackages } from "@/routes/home-premium/-components/use-premium-packages";
import { client } from "@/utils/orpc";

export type PromoQuotes = Partial<Record<PremiumPackageSlug, PromoQuote>>;

const FALLBACK_ERROR = "Kode promo tidak bisa dipakai. Coba lagi sebentar lagi.";

// The server decides which packages accept a code; asking about every package avoids a second list to keep in sync.
function usePromoPreview(slugs: PremiumPackageSlug[]) {
  return useMutation({
    mutationFn: async (code: string) => {
      const results = await Promise.allSettled(
        slugs.map(async (slug) => ({ slug, quote: await client.transaction.promoPreview({ code, name: slug }) })),
      );

      const quotes: PromoQuotes = {};
      let firstError: string | undefined;
      for (const result of results) {
        if (result.status === "fulfilled") {
          quotes[result.value.slug] = { code, ...result.value.quote };
        } else {
          firstError ??= result.reason instanceof Error ? result.reason.message : undefined;
        }
      }

      if (Object.keys(quotes).length === 0) throw new Error(firstError ?? FALLBACK_ERROR);
      return quotes;
    },
  });
}

export function PromoCodeForm({ quotes, onChange }: { quotes: PromoQuotes; onChange: (quotes: PromoQuotes) => void }) {
  const { packages } = usePremiumPackages();
  const preview = usePromoPreview(packages.map((pkg) => pkg.slug));
  const [input, setInput] = useState("");
  const appliedCount = Object.keys(quotes).length;
  const appliedCode = Object.values(quotes)[0]?.code;

  const apply = () => {
    const code = input.trim().toUpperCase();
    if (!code || preview.isPending) return;
    preview.mutate(code, {
      onSuccess: (result) => onChange(result),
      onError: () => onChange({}),
    });
  };

  const clear = () => {
    setInput("");
    preview.reset();
    onChange({});
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
      className="mb-6 rounded-sr-md border border-sr-line bg-white p-4 shadow-sr-1"
    >
      <Label htmlFor="promo-code" className="text-sm font-extrabold text-sr-ink">
        Punya kode promo?
      </Label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Input
          id="promo-code"
          value={input}
          onChange={(event) => {
            setInput(event.target.value.toUpperCase());
            if (appliedCount > 0) onChange({});
            if (preview.isError) preview.reset();
          }}
          placeholder="Masukkan kode promo"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="promo-code-status"
          aria-invalid={preview.isError}
          className="h-11 font-mono tracking-wide uppercase sm:flex-1"
        />
        <Button
          type="submit"
          variant="outline"
          size="lg"
          isPending={preview.isPending}
          disabled={!input.trim() || preview.isPending}
          className="sm:w-auto"
        >
          {preview.isPending ? "Mengecek..." : "Pakai kode"}
        </Button>
      </div>
      <div id="promo-code-status" aria-live="polite" className="mt-2 min-h-5 text-sm">
        {preview.isError && (
          <p role="alert" className="font-semibold text-destructive">
            {preview.error.message}
          </p>
        )}
        {appliedCount > 0 && (
          <p className="font-semibold text-sr-ink">
            Kode {appliedCode} berlaku untuk {appliedCount} paket, harga barunya sudah tampil di kartu.{" "}
            <button
              type="button"
              onClick={clear}
              className="cursor-pointer font-semibold text-sr-blue-600 underline underline-offset-4"
            >
              Hapus kode
            </button>
          </p>
        )}
      </div>
    </form>
  );
}
