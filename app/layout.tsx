import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Removing Geist to match original fonts
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "SecureDash",
  description: "Secure Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
        {/* Material Symbols */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
