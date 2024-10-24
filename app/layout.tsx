import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import Header from "@/components/ui/sections/Header";
import { Providers } from "./providers";
// import { ThemeProvider } from "next-themes";

// Import local fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Define metadata for the application
export const metadata: Metadata = {
  title: "Coryfi Connect",
  description: "A Networking Platform for Everyone",
};

// Root layout component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      ><Providers>
        <div className="hidden md:block">
        <Header /> 
        </div>
        {/* Header displayed on every page */}
        {children} {/* Page-specific content */}

        </Providers>
      </body>
    </html>
  );
}
