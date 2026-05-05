import type { Metadata, Viewport } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "Ari-ICU | Professional Teaching System",
    template: "%s | Ari-ICU"
  },
  description: "A premium, interactive curriculum management and learning platform for modern technical education.",
  keywords: ["learning management system", "interactive slides", "programming course", "technical education"],
  authors: [{ name: "Ari-ICU Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${jetbrains.variable} antialiased min-h-screen bg-slate-50`} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
