// app/(your-route)/checkValidate/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import OtpLayout from "@/components/layout/Otp_layout";
import PasswordLayout from "@/components/layout/Password_layout";

const CheckValidate = () => {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="min-w-[400px] min-h-[400px] bg-[#d5e6ff] rounded-full absolute -top-40 -right-[5vw]" />
        <div className="min-w-[400px] min-h-[400px] border-[44px] border-[#FDB131] rounded-full absolute -bottom-40 -left-[5vw]" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen w-full flex items-center justify-center py-6 sm:py-24 px-4">
        {fromParam === "otp" ? (
          <OtpLayout />
        ) : fromParam === "password" ? (
          <PasswordLayout />
        ) : (
          <div className="text-center text-xl font-semibold text-gray-700">
            Invalid or missing `from` query parameter.
          </div>
        )}
      </main>
    </div>
  );
};

export default CheckValidate;
