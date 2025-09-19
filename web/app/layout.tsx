import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: {
    default: "Timelypost",
    template: "%s | Timelypost",
  },
  description:
    "Timelypost is a fully serverless social media post scheduler designed to make managing content across multiple platforms simple and efficient.",
  applicationName: "Timelypost",
  keywords: [
    "Timelypost",
    "social media scheduler",
    "LinkedIn",
    "content scheduling",
  ],
  creator: "Timelypost",

  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Toaster richColors />
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
