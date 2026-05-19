import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "alif·build — Find people to build meaningful things with",
  description:
    "A trusted founder formation platform. Find cofounders, join build sprints, post projects, and collaborate with verified builders inside the ALIF ecosystem.",
  metadataBase: new URL("https://buildtogether.alif"),
  openGraph: {
    title: "alif·build",
    description:
      "Find people to build meaningful things with. Trusted founders, real build sprints, verified circles.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
