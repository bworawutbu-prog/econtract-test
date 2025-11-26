import "server-only";

import type { Locale } from "./config";

const dictionaries = {
  th: () => import("./dictionaries/th.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
} satisfies Record<Locale, () => Promise<Record<string, any>>>;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)[Locale]>>;

export const getDictionary = async (locale: Locale) => {
  if (!dictionaries[locale]) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  return dictionaries[locale]();
};

