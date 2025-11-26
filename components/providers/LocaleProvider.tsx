"use client";

import React, { createContext, useContext, useMemo } from "react";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type LocaleContextValue = {
  locale: Locale;
  dictionary: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

type LocaleProviderProps = {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
};

export const LocaleProvider: React.FC<LocaleProviderProps> = ({
  locale,
  dictionary,
  children,
}) => {
  const value = useMemo(
    () => ({
      locale,
      dictionary,
    }),
    [locale, dictionary],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};

const getNestedValue = (
  dictionary: Dictionary,
  path: string,
): string => {
  const segments = path.split(".");
  let current: any = dictionary;

  for (const segment of segments) {
    if (current && typeof current === "object" && segment in current) {
      current = current[segment];
    } else {
      return "";
    }
  }

  return typeof current === "string" ? current : "";
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }

  return context;
};

export const useTranslations = () => {
  const { dictionary } = useLocale();

  return React.useCallback(
    (key: string, fallback?: string) =>
      getNestedValue(dictionary, key) || fallback || key,
    [dictionary],
  );
};

