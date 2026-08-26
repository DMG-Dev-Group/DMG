import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Grain } from "@/components/grain";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ScrollProgress } from "@/components/scroll-progress";

// Display + body: one geometric sans with tech character (brief §3).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

// HUD / technical labels, counters, coordinates.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // TODO(DMG): placeholder. A DMG ainda não fechou o domínio, e não há deploy
  // ativo — mas Open Graph e imagens absolutas saem com esta URL, então ela
  // precisa virar a real antes de publicar.
  metadataBase: new URL("https://damage.group"),
  title: {
    default: "DMG — Damage Group · Software de alto padrão",
    template: "%s · DMG",
  },
  description:
    "Damage Group. Construímos software de alto nível e quebramos o padrão de propósito. Sistemas web, SaaS, e-commerce e produtos com acabamento de agência.",
  keywords: [
    "DMG",
    "Damage Group",
    "desenvolvimento de software",
    "SaaS",
    "e-commerce",
    "sistemas web",
    "UI/UX",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "DMG — Damage Group",
    title: "DMG — Damage Group · Software de alto padrão",
    description:
      "Construímos coisas de alto nível e não temos medo de quebrar o padrão. Dano controlado.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DMG — Damage Group",
    description: "Software de alto padrão. Dano controlado.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${spaceGrotesk.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-[100dvh] bg-void text-bone">
        <SmoothScroll />
        <ScrollProgress />
        {children}
        <Grain />
      </body>
    </html>
  );
}
