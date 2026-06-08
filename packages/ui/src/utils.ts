import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Utility to merge tailwind classes safely */
export function mergeClasses(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isUrlExternal(url: string) {
  if (!url) return false
  return url.startsWith("http") || url.startsWith("//")
}
