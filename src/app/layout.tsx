import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MasterThreader | AI Copy Refinement Engine",
  description: "Transform your scripts into viral Twitter threads with Josh's AI-powered thread generation and refinement system.",
  keywords: ["twitter threads", "ai copywriting", "content creation", "social media", "thread generator"],
  authors: [{ name: "MasterThreader Team" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: "index, follow",
  openGraph: {
    title: "MasterThreader | AI Copy Refinement Engine",
    description: "Transform your scripts into viral Twitter threads with AI-powered generation and refinement.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
