import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brew & Bloom · Freshly made, happily served",
  description: "Explore the menu, order at your table, and enjoy Brew & Bloom café.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
