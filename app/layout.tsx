import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Image grid thingi",
  description: "Create a grid of images by uploading or pasting them",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme="dark" lang="en">
      <body
        className={`${inter.className} flex flex-col min-h-screen overflow-scroll overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
