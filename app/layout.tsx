import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agent Launcher",
  description: "Deploy an XMTP agent without touching a terminal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-100`}>
        <main className="min-h-screen flex flex-col items-center justify-center p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
