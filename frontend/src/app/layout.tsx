import type { Metadata } from "next";
import "./globals.css";
import "aos/dist/aos.css";
import { geistSans, geistMono } from "@/lib/fonts";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "LANMIC Polymers",
  description: "LANMIC Polymers - Your trusted partner in polymer solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
