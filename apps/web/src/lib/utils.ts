import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FileRoutesByTo } from "@/routeTree.gen";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TRoutes = keyof FileRoutesByTo;
