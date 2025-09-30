import type { Metadata } from "next";
import "./globals.css";
import "aos/dist/aos.css";
import { geistSans, geistMono } from "@/lib/fonts";
import { AuthProvider } from "@/contexts/AuthContext";
import { BlogProvider } from "@/contexts/BlogContext";
import { TeamProvider } from "@/contexts/TeamContext";
import { ExecutiveProvider } from "@/contexts/ExecutiveContext";
import { TestimonialProvider } from "@/contexts/TestimonialContext";

export const metadata: Metadata = {
  title: "LANMIC Polymers",
  description: "LANMIC Polymers - Your trusted partner in polymer solutions",
  icons: {
    icon: [
      { url: '/LMC_LFO_LOGO.png', sizes: '32x32', type: 'image/png' },
      { url: '/LMC_LFO_LOGO.png', sizes: '16x16', type: 'image/png' }
    ],
    apple: '/LMC_LFO_LOGO.png',
  },
  openGraph: {
    title: "LANMIC Polymers",
    description: "Your trusted partner in innovative polymer solutions",
    images: [
      {
        url: '/LMC_LFO_LOGO.png',
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
    images: ['/LMC_LFO_LOGO.png'],
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
              <ExecutiveProvider>
                <TestimonialProvider>
                  {children}
                </TestimonialProvider>
              </ExecutiveProvider>
            </TeamProvider>
          </BlogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
