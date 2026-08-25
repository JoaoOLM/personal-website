import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

import { PHProvider } from "./providers";

export const metadata: Metadata = {
  title: "João Otávio — Engenheiro de Software & Pesquisador",
  description: "Terminal pessoal de João Otávio. Engenheiro de Software, pesquisador em Ciência da Computação na UFSCar, especialista em IAM e arquitetura de sistemas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <PHProvider>{children}</PHProvider>
      </body>
    </html>
  );
}
