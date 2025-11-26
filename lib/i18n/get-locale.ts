import { cookies, headers } from "next/headers";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { defaultLocale, isLocale, locales, type Locale } from "./config";

const LOCALE_COOKIE_NAME = "locale";

export const getLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  if (acceptLanguage) {
    const languages = new Negotiator({
      headers: { "accept-language": acceptLanguage },
    }).languages();

    try {
      const matched = match(languages, locales, defaultLocale);
      if (isLocale(matched)) {
        return matched;
      }
    } catch (error) {
      console.warn("Failed to match locale from Accept-Language", error);
    }
  }

  return defaultLocale;
};

export const setLocaleCookie = async (locale: Locale) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: LOCALE_COOKIE_NAME,
    value: locale,
    path: "/",
  });
};

