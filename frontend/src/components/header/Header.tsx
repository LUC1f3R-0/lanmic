"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname(); // current route
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/admin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/products", label: "Products" },
    { href: "/services", label: "Product & Application" },
    { href: "/team", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ];

  const linkBase = "text-gray-400 transition-colors hover:text-white";
  const linkActive = "text-white font-semibold border-b-2 border-white";

  return (
    <header className="sticky top-0 z-50 overflow-hidden border-b border-white/15 bg-[#001f3f] text-white shadow-sm">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#00142e] via-[#001f3f] to-[#0a2847]"
        aria-hidden
      />
      <div className="container relative mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/LMC_LFO_LOGO.png"
            alt="LANMIC Polymers Logo"
            width={120}
            height={120}
            className="h-10 w-auto object-contain sm:h-11"
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden items-center space-x-8 font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-2 border-transparent pb-0.5 ${
                pathname === item.href ? linkActive : linkBase
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          {/* User Menu */}
          {isMounted && isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className={`font-medium ${
                  pathname === "/dashboard"
                    ? "text-white"
                    : linkBase
                }`}
              >
                Dashboard
              </Link>
              {/* Only show welcome message and logout on dashboard route */}
              {pathname === '/dashboard' && (
                <>
                  <span className="text-sm text-white/55">
                    Welcome, {user?.username || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          ) : null}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="text-2xl text-gray-400 transition-colors hover:text-white md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="relative border-t border-white/15 bg-[#001f3f] md:hidden">
          <ul className="flex flex-col space-y-4 px-4 py-6 font-medium text-gray-400">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={
                    pathname === item.href
                      ? "block border-l-4 border-white pl-2 font-semibold text-white"
                      : "block transition-colors hover:text-white"
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
            
            {/* Mobile User Menu */}
            <li className="border-t border-white/15 pt-4">
              {isMounted && isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`block font-medium transition-colors ${
                      pathname === "/dashboard"
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Dashboard
                  </Link>
                  {/* Only show welcome message and logout on dashboard route */}
                  {pathname === '/dashboard' && (
                    <>
                      <div className="text-sm text-white/55">
                        Welcome, {user?.username || user?.email}
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full rounded-md bg-red-600 px-4 py-2 text-left text-sm text-white transition-colors hover:bg-red-700"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
