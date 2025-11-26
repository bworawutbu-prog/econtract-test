import { NextResponse } from "next/server";

import { isLocale } from "@/lib/i18n/config";
import { setLocaleCookie } from "@/lib/i18n/get-locale";

export async function POST(request: Request) {
  try {
    const { locale } = await request.json();

    if (!isLocale(locale)) {
      return NextResponse.json(
        { error: "Unsupported locale" },
        { status: 400 },
      );
    }

    await setLocaleCookie(locale);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update locale", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

