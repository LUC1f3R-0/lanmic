import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - LANMIC Polymers",
  description: "Admin panel for LANMIC Polymers",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      {children}
    </main>
  );
}
