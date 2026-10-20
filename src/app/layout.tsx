import { QueryProvider, ThemeProvider } from "@/providers";
import React from "react";
import "@/styles/index.css";
import { Inter, Lora, Montserrat, Poppins } from "next/font/google";
import { TooltipProvider } from "@/components/ui";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/shared";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-poppins" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: {
    default: "muCitizen | Swift County Services",
    template: "%s | muCitizen"
  },
  description: "Report local service issues, get a reference number, and follow progress from submission to resolution.",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    siteName: "muCitizen",
    type: "website",
    locale: "en_KE",
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(poppins.variable, montserrat.variable, lora.variable, "font-sans", inter.variable)}
      suppressHydrationWarning
    >
      <body
        className="antialiased bg-background text-foreground transition-colors duration-300"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </QueryProvider>

          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
