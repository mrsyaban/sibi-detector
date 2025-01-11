import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  // metadataBase: new URL(''),
  title: "SIBI Detector",
  description:
    "A Sign Language Detector for SIBI (Sistem Isyarat Bahasa Indonesia).",
  keywords: "SIBI, sign language, YOLO",
  manifest: "/manifest.json", 
  icons: {
    apple: "/icon_192.png", 
    icon: "/icon_192.png", 
  },
  openGraph: {
    authors: "Muhammad Rizky Sya\'ban",
    title: "SIBI Detector",
    description:
      "A Sign Language Detector for SIBI (Sistem Isyarat Bahasa Indonesia)..",
    images: "/logo.png",
    // url: "",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIBI Sign App",
    description:
      "A Sign Language Detector for SIBI (Sistem Isyarat Bahasa Indonesia).",
    images: "/logo.png",
  },
}

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
          {children}
      </body>
    </html>
  );
}
