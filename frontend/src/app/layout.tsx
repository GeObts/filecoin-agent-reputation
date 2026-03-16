import type { Metadata } from "next";
import { Roboto, Boldonse, JetBrains_Mono } from "next/font/google";
import { ClientProviders } from "./client-providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const boldonse = Boldonse({
  variable: "--font-boldonse",
  subsets: ["latin"],
  weight: "400",
  adjustFontFallback: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FARS - Filecoin Agent Reputation System",
  description: "On-chain reputation tracking for AI agents with Filecoin-verified proof of history",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${boldonse.variable} ${jetbrainsMono.variable}`}>
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        <noscript>
          <div style={{padding: '2rem', textAlign: 'center'}}>
            <h1 style={{fontSize: '2rem', marginBottom: '1rem'}}>FARS - Filecoin Agent Reputation System</h1>
            <p style={{marginBottom: '1rem'}}>JavaScript is required to use this application.</p>
            <p>Please enable JavaScript in your browser settings.</p>
          </div>
        </noscript>
        <ClientProviders>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
