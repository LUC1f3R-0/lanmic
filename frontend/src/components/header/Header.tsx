"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLogoVisibility } from "@/hooks/useLogoVisibility";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // current route
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const isLargeLogoVisible = useLogoVisibility();
  
  // Show navbar logo when large logo is not visible (or on non-home pages)
  const shouldShowNavbarLogo = !isLargeLogoVisible;
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Header - Path:', pathname, 'Large logo visible:', isLargeLogoVisible, 'Show navbar logo:', shouldShowNavbarLogo);
  }

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
          {/* Navbar Logo - Only visible when large logo is not visible */}
          <div 
            className={`flex items-center space-x-3 transition-all duration-500 ease-in-out ${
              shouldShowNavbarLogo 
                ? 'opacity-100 scale-100 pointer-events-auto' 
                : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <Image
              src="/lanmic_logo.png"
              alt="LANMIC Polymers Logo"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
              priority
            />
            <div className="text-xl font-bold text-blue-600 hidden sm:block">
              LANMIC POLYMERS
            </div>
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
                  ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600 transition-colors"
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
          <ul className="flex flex-col space-y-4 px-4 py-6 font-medium text-gray-600">
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
              {isAuthenticated ? (
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
