"use client";
import { memo } from "react";
import Image, { type StaticImageData } from "next/image";
import ImageLogo from "@/assets/webp/digitractLogo/logo digitract.webp";
// import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
// import { useTranslations } from "@/components/providers/LocaleProvider";
import backgroundLogin from "@/assets/image/login/Loginver_1.webp";
interface LoginLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  contentWidth?: string; // Optional width for the main content container
  // Optional props kept for backward compatibility with existing usages
  showBackButton?: boolean;
  backUrl?: string;
  leftImage?: StaticImageData;
}

const LoginLayout: React.FC<LoginLayoutProps> = memo(({
  children,
  title,
  subtitle,
  contentWidth = "w-full max-w-[580px]", // Default width if not specified
}) => {

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={backgroundLogin}
          alt="Background Login"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          aria-hidden="true"
        />
      </div>
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="min-w-[400px] min-h-[400px] bg-[#d5e6ff] rounded-full absolute -top-40 -right-[5vw]" />
        <div className="min-w-[400px] min-h-[400px] border-[44px] border-[#FDB131] rounded-full absolute -bottom-40 -left-[5vw]" />
      </div> */}

      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen w-full items-center justify-center py-6 sm:py-24 px-4">
        {/* Main card container */}
        <div
          className={`${contentWidth} w-full max-w-[580px] sm:max-w-[540px] md:max-w-[560px] lg:max-w-[580px] max-h-[700px] grid grid-cols-1 shadow-[0px_-0px_24px_#e2e9f1] md:rounded-3xl bg-white overflow-hidden bg-white/30 rounded-xl p-4`}
        >
          {/* Right side - Form */}
          <div className="h-full overflow-y-auto">
              <div className="min-h-full flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-[60px] py-6 sm:py-10">
                <div className="w-full">
                  <div className="flex justify-end">
                    {/* <LocaleSwitcher size="small" /> */}
                  </div>
                  {/* Logo Section */}
                  <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
                    <div className="relative w-8 sm:w-10 h-8 sm:h-10">
                      <Image
                        src={ImageLogo}
                        alt="DigiTrust Logo"
                        fill
                        priority
                        className="object-contain"
                      />
                    </div>
                    <p className="text-theme font-bold text-base sm:text-lg">
                      DigiTract
                    </p>
                  </div>

                  <h1 className="text-center sm:mb-4 font-extrabold text-2xl sm:text-3xl text-theme">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-center mb-6 text-sm sm:text-base text-gray-600">
                      {subtitle}
                    </p>
                  )}

                  {/* Form content will be injected here */}
                  {children}
                </div>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
});

LoginLayout.displayName = 'LoginLayout';

export default LoginLayout;
