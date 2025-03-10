import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sneaker Central",
  description: "Your personal sneaker collection manager",
  keywords: ["sneakers", "collection", "manager", "shoes", "footwear", "inventory", "sneaker central"],
  openGraph: {
    title: "Sneaker Central",
    description: "Your personal sneaker collection manager",
    type: "website",
    locale: "en",
    url: "https://sneaker-central.com",
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://sneaker-central.com",
  },
  authors: [{ name: "Sneaker Central" }],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
