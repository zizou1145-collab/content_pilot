import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Content Pilot | بايلوت المحتوى",
  description: "AI-powered social media content creation",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  // Locale from next-intl middleware; fallback for SSG/edge cases
  const locale =
    headersList.get("x-next-intl-locale") ?? routing.defaultLocale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("content_pilot_theme");if(t==="dark")document.documentElement.classList.add("dark");else if(t==="light")document.documentElement.classList.add("light");})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
