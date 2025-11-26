"use client";

import React from "react";
import { useTransition } from "react";
import { Select } from "antd";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

import {
  useLocale,
  useTranslations,
} from "@/components/providers/LocaleProvider";
import type { Locale } from "@/lib/i18n/config";

const localeOptions: { value: Locale; labelKey: string; icon: string }[] = [
  { value: "th", labelKey: "common.th", icon: "/assets/flags/th.svg" },
  { value: "en", labelKey: "common.en", icon: "/assets/flags/us.svg" },
];

export const LocaleSwitcher: React.FC<{
  size?: "small" | "middle" | "large";
  className?: string;
}> = ({ size = "middle", className }) => {
  const { locale } = useLocale();
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  const selectClassName = [
    className,
    "pa-5 h-9 shadow w-[115px] md:w-[115px] max-w-[115px] [&_.ant-select-selector]:!bg-[#F5F5F5]/20 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!rounded-xl",
  ]
    .filter(Boolean)
    .join(" ");

  const handleChange = (value: Locale) => {
    if (value === locale) return;
    startTransition(async () => {
      try {
        await fetch("/api/locale", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ locale: value }),
        });
      } catch (error) {
        console.error("Failed to switch locale", error);
      } finally {
        // Refresh to pick up new locale cookie
        window.location.reload();
      }
    });
  };

  return (
    <Select
      value={locale}
      onChange={handleChange}
      className={selectClassName}
      style={{ borderRadius: "0.55rem" }}
      size={size}
      suffixIcon={<ChevronDown size={16} color="#0153BD" className="mr-2" />}
      disabled={isPending}
      aria-label={t("common.language")}
      options={localeOptions.map((option) => ({
        value: option.value,
        label: (
          <div className="flex items-center gap-2">
            <Image
              src={option.icon}
              alt={`${option.value} flag`}
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-cover"
            />
            <span className="text-xs sm:text-sm">{t(option.labelKey)}</span>
          </div>
        ),
      }))}
      classNames={{
        popup: {
          root: "locale-switcher-dropdown",
        },
      }}
    />
  );
};

export default LocaleSwitcher;

