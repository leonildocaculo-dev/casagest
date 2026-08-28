import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CasaGest — Sistema Inteligente de Gestão Imobiliária em Angola",
  description: "Arrendamento, compra e gestão transparente de imóveis com geração automática de contratos de arrendamento.",
  keywords: "imobiliária, angola, luanda, arrendamento, compra, venda, contratos, gestão imobiliária, casagest",
  openGraph: {
    type: "website",
    locale: "pt_AO",
    url: "https://casagest.ao", // Dominio ficticio/futuro
    siteName: "CasaGest",
    title: "CasaGest — Sistema Inteligente de Gestão Imobiliária",
    description: "Arrendamento, compra e gestão transparente de imóveis em Angola.",
    images: [
      {
        url: "/assets/logo/emblema-icone-app.png",
        width: 800,
        height: 800,
        alt: "CasaGest Logo",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CasaGest — Sistema Inteligente de Gestão Imobiliária",
    description: "Arrendamento, compra e gestão transparente de imóveis em Angola.",
    images: ["/assets/logo/emblema-icone-app.png"],
  },
  icons: {
    icon: "/assets/logo/emblema-icone-app.png",
    apple: "/assets/logo/emblema-icone-app.png",
  },
};

import EmailVerificationBanner from "@/components/EmailVerificationBanner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <EmailVerificationBanner />
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
