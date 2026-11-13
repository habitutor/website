import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Cari + saring + paginasi di sisi klien untuk daftar kecil yang sudah dimuat penuh. */
export function usePagedList<T>(
  items: T[] | undefined,
  {
    pageSize,
    matches,
  }: {
    pageSize: number;
    matches: (item: T, query: string) => boolean;
  },
) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (items ?? []).filter((item) => normalized === "" || matches(item, normalized)),
    [items, normalized, matches],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [normalized]);

  return { query, setQuery, page: currentPage, setPage, pageItems, total: filtered.length, pageSize };
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <MagnifyingGlassIcon
        className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-sr-muted"
        aria-hidden="true"
      />
      <Input
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}

export function FilterChips<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex w-full items-center gap-1 overflow-x-auto rounded-full border border-sr-line bg-sr-ivory p-1 sm:w-auto"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
            value === option.value ? "bg-sr-blue-500 text-white shadow-sr-1" : "text-sr-muted hover:text-sr-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Baris daftar: terangkat saat disorot di desktop, berubah warna saat disentuh di HP, muncul halus saat dimuat. */
export const ADMIN_ROW_CLASS =
  "group animate-sr-rise rounded-sr-md border border-sr-line bg-white/70 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-sr-blue-200 hover:bg-sr-blue-50/40 hover:shadow-sr-1 active:bg-sr-blue-50/60";

export const rowDelay = (index: number) => ({ animationDelay: `${Math.min(index, 8) * 50}ms` });
