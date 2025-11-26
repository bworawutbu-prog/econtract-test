export const locales = ["th", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "th";

export const isLocale = (value: string | undefined): value is Locale =>
  !!value && locales.includes(value as Locale);

