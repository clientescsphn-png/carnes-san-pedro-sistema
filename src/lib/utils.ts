import { type ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}

export function formatLempira(valor: number) {
  return `L ${Number(valor || 0).toLocaleString("es-HN", {
    minimumFractionDigits: 2,
  })}`;
}
