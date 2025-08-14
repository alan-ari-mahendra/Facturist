import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hoursToDecimal = (hoursStr: string): number => {
  if (!hoursStr) return 0;
  const parts = hoursStr.split(":");
  const hours = Number.parseInt(parts[0] || "0");
  const minutes = Number.parseInt(parts[1] || "0");
  return hours + minutes / 60;
};
