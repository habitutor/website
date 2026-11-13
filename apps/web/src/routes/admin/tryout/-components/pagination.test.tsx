import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { getTryoutPagination, TRYOUT_PAGE_SIZE, TryoutPagination } from "./pagination";

describe("admin Try Out pagination", () => {
  test("empty list stays on page one with a zero range", () => {
    expect(getTryoutPagination(1, 0)).toEqual({ currentPage: 1, totalPages: 1, start: 0, end: 0 });
  });

  test("twenty items fit on one page; the twenty-first creates a second page", () => {
    expect(getTryoutPagination(1, 20).totalPages).toBe(1);
    expect(getTryoutPagination(2, 21)).toEqual({ currentPage: 2, totalPages: 2, start: 21, end: 21 });
  });

  test("middle and final page ranges use the server total", () => {
    expect(getTryoutPagination(2, 45)).toEqual({ currentPage: 2, totalPages: 3, start: 21, end: 40 });
    expect(getTryoutPagination(3, 45)).toEqual({ currentPage: 3, totalPages: 3, start: 41, end: 45 });
  });

  test("deleting the last item on the last page returns to a valid page", () => {
    expect(getTryoutPagination(3, 40).currentPage).toBe(2);
    expect(getTryoutPagination(2, 0).currentPage).toBe(1);
  });

  test("pagination renders accessible controls and disables boundaries", () => {
    const render = (page: number, total: number, isLoading = false) =>
      renderToStaticMarkup(
        <TryoutPagination page={page} total={total} isLoading={isLoading} onPageChange={() => {}} />,
      );
    const first = render(1, 45);
    expect(first).toContain('aria-label="Pagination Try Out"');
    expect(first).toContain("Menampilkan 1–20 dari 45 Try Out");
    expect(first.match(/disabled=""/g)?.length).toBe(2);
    expect(render(2, 45)).not.toContain('disabled=""');
    expect(render(3, 45)).toContain("Halaman 3 dari 3");
    expect(render(3, 45).match(/disabled=""/g)?.length).toBe(2);
    expect(render(1, 0).match(/disabled=""/g)?.length).toBe(4);
    expect(render(2, 45, true).match(/disabled=""/g)?.length).toBe(4);
  });

  test("page queries have separate caches and list invalidation covers all pages", async () => {
    const cache = new QueryClient();
    const rows = Array.from({ length: 45 }, (_, index) => ({ id: String(index + 1) }));
    const seen: string[] = [];
    for (let page = 1; page <= 3; page++) {
      const options = orpc.admin.tryout.list.tryout.queryOptions({ input: { page, limit: TRYOUT_PAGE_SIZE } });
      const items = await cache.fetchQuery({
        queryKey: options.queryKey,
        staleTime: Infinity,
        queryFn: async () => rows.slice((page - 1) * TRYOUT_PAGE_SIZE, page * TRYOUT_PAGE_SIZE),
      });
      seen.push(...items.map((item) => item.id));
    }
    expect(new Set(seen).size).toBe(45);
    expect(seen).toEqual(rows.map((item) => item.id));
    expect(cache.getQueryCache().getAll().length).toBe(3);
    await cache.invalidateQueries({ queryKey: orpc.admin.tryout.list.tryout.key() });
    expect(
      cache
        .getQueryCache()
        .getAll()
        .every((query) => query.state.isInvalidated),
    ).toBe(true);
    cache.clear();
  });
});
