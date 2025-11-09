import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Forex Trading Dashboard",
  description: "AI-powered forex trading analysis and signals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-white">
        {children}
      </body>
    </html>
  );
}
