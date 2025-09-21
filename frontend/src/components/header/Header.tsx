"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // current route
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

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
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/lanmic_logo.png"
            alt="LANMIC Polymers Logo"
            width={60}
            height={60}
            className="w-15 h-15 object-contain"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
          <div className="text-xl font-bold text-primary-500 hidden sm:block">
            LANMIC POLYMERS
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8 font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${
                pathname === item.href
                  ? "text-primary-500 font-semibold border-b-2 border-primary-500"
                  : "text-text-primary hover:text-primary-500 transition-colors"
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          {/* User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-text-primary hover:text-primary-500 font-medium transition-colors"
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
          className="text-2xl text-text-primary md:hidden hover:text-primary-500 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-white border-t border-neutral-200 shadow-sm">
          <ul className="flex flex-col space-y-4 px-4 py-6 font-medium text-text-primary">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`${
                    pathname === item.href
                      ? "text-primary-500 font-semibold border-l-4 border-primary-500 pl-2"
                      : "hover:text-primary-500 transition-colors"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            
            {/* Mobile User Menu */}
            <li className="border-t border-neutral-200 pt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block text-text-primary hover:text-primary-500 font-medium transition-colors"
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
