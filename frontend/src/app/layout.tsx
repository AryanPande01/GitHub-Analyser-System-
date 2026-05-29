import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { Providers } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GitHub Career Analyzer",
  description: "AI-powered GitHub profile analysis for developers and recruiters",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <Providers>
          <div className="gradient-mesh min-h-screen">
            <Sidebar />
            <div className="md:pl-64">
              <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:pb-8">{children}</main>
            </div>
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
