import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: (() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) return new URL(siteUrl);

    const vercelUrl = process.env.VERCEL_URL;
    if (vercelUrl) return new URL(`https://${vercelUrl}`);

    return new URL("http://localhost:3000");
  })(),
  title: "imgyn — simple image hosting",
  description: "Upload an image, get a link. Simple as that.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
