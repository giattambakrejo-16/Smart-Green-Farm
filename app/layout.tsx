import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Smart Green Farm",
    template: "%s | Smart Green Farm",
  },

  description:
    "Dashboard IoT Smart Green Farm - Taman Kebun Pancasila GIAT 16 Universitas Negeri Semarang.",

  applicationName: "Smart Green Farm",

  keywords: [
    "IoT",
    "Smart Farming",
    "Smart Green Farm",
    "Aquaponik",
    "Raised Bed",
    "Dashboard",
    "UNNES",
    "GIAT 16",
    "Internet of Things",
  ],

  authors: [
    {
      name: "Tim IoT GIAT 16 UNNES",
    },
  ],

  creator: "Tim IoT GIAT 16 UNNES",

  manifest: "/manifest.json",

  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/icons/icon-192.png",
      },
    ],

    shortcut: "/icons/icon-192.png",
  },

  appleWebApp: {
    capable: true,
    title: "Smart Green Farm",
    statusBarStyle: "black-translucent",
  },

  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#14b8a6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={jakarta.className}>
        {children}
      </body>
    </html>
  );
}