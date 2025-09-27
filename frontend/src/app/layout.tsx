import type { Metadata } from "next";
import "./globals.css";
import "aos/dist/aos.css";
import { geistSans, geistMono } from "@/lib/fonts";
import { AuthProvider } from "@/contexts/AuthContext";
import { BlogProvider } from "@/contexts/BlogContext";
import { TeamProvider } from "@/contexts/TeamContext";

export const metadata: Metadata = {
  title: "LANMIC Polymers",
  description: "LANMIC Polymers - Your trusted partner in polymer solutions",
  icons: {
    icon: [
      { url: '/lanmic_logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: '/lanmic_logo.png',
  },
  openGraph: {
    title: "LANMIC Polymers",
    description: "Your trusted partner in innovative polymer solutions",
    images: [
      {
        url: '/lanmic_logo.png',
        width: 1200,
        height: 630,
        alt: 'LANMIC Polymers Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "LANMIC Polymers",
    description: "Your trusted partner in innovative polymer solutions",
    images: ['/lanmic_logo.png'],
  },
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
          <BlogProvider>
            <TeamProvider>
              {children}
            </TeamProvider>
          </BlogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
