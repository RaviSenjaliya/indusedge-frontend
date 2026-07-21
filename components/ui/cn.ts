/**
 * Tiny className joiner. Flattens nested arrays and drops falsy values.
 * Kept dependency-free (no clsx / tailwind-merge) to stay compatible with the
 * CDN import-map setup. Put consumer overrides last so they win by source order.
 */
export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue) => {
    if (v === null || v === undefined || v === false || v === "") return;
    if (Array.isArray(v)) v.forEach(walk);
    else out.push(String(v));
  };
  inputs.forEach(walk);
  return out.join(" ");
}
