import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - LANMIC Polymers",
  description: "Create your account with LANMIC Polymers",
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen flex items-center justify-center py-8 bg-gray-50">
      {children}
    </main>
  );
}
