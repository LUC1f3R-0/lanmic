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
    { href: "/services", label: "Services" },
    { href: "/team", label: "Team" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-neutral-200">
      <div className="container mx-auto flex items-center justify-between px-4 py-1">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/lanmic_logo.png"
            alt="LANMIC Polymers Logo"
            width={90}
            height={90}
            className="w-24 h-24 object-contain"
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${
                pathname === item.href
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600 transition-colors"
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
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              {/* Only show welcome message and logout on dashboard route */}
              {pathname === '/dashboard' && (
                <>
                  <span className="text-sm text-text-muted">
                    Welcome, {user?.username || user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
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
          className="text-2xl text-gray-600 md:hidden hover:text-blue-600 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-white border-t border-neutral-200 shadow-sm">
          <ul className="flex flex-col space-y-2 px-4 py-3 font-medium text-gray-600">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`${
                    pathname === item.href
                      ? "text-blue-600 font-semibold border-l-4 border-blue-600 pl-2"
                      : "hover:text-blue-600 transition-colors"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            
            {/* Mobile User Menu */}
            <li className="border-t border-neutral-200 pt-4">
              {isMounted && isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block text-gray-600 hover:text-blue-600 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  {/* Only show welcome message and logout on dashboard route */}
                  {pathname === '/dashboard' && (
                    <>
                      <div className="text-sm text-text-muted">
                        Welcome, {user?.username || user?.email}
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full text-left bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
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
