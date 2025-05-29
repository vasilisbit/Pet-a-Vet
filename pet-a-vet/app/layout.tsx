import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/theme-context";
import { PreferencesProvider } from "@/contexts/preferences-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pet-à-Vet",
  description:
    "Comprehensive veterinary management platform for pet owners and clinics",
  icons: {
    icon: "/Pet-a-vet-logo-transparent.png",
    apple: "/Pet-a-vet-logo-transparent.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <PreferencesProvider>{children}</PreferencesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
