"use client";

import Image from "next/image";
import Link from "next/link";

const lime = "#32cd32";

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Applications", href: "/services" },
  { label: "Technical Support", href: "/contact" },
  { label: "Contact Us", href: "/contact" },
] as const;

const productLinks = [
  { label: "Color Masterbatches", href: "/products" },
  { label: "Additive Masterbatches", href: "/products" },
  { label: "White Masterbatches", href: "/products" },
  { label: "Black Masterbatches", href: "/products" },
  { label: "Filler Masterbatches", href: "/products" },
] as const;

function BulletList({
  items,
}: {
  items: readonly { label: string; href: string }[];
}) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-2.5 text-sm">
          <span
            className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: lime }}
            aria-hidden
          />
          <Link
            href={item.href}
            className="text-white/90 transition-colors hover:text-white hover:underline"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold tracking-wide text-white">{children}</h2>
      <div className="mt-2 h-px w-full max-w-[12rem] bg-white/20" />
    </div>
  );
}

function IconPin() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 flex-shrink-0"
      style={{ color: lime }}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 flex-shrink-0"
      style={{ color: lime }}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 flex-shrink-0"
      style={{ color: lime }}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
      />
    </svg>
  );
}

const colDivider =
  "lg:border-l lg:border-white/[0.12] lg:pl-8 lg:pr-0";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[#001f3f] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#00142e] via-[#001f3f] to-[#0a2847]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {/* Column 1 — Brand */}
          <div className="md:pr-4">
            <div className="mb-4 flex items-start gap-3">
              <Image
                src="/lanmic_logo.png"
                alt="LANMIC Polymers Logo"
                width={52}
                height={52}
                className="h-[52px] w-[52px] object-contain"
              />
              <div>
                <p className="text-2xl font-bold leading-tight tracking-tight">LANMIC</p>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/90">
                  POLYMERS
                </p>
              </div>
            </div>
            <div className="mb-3 h-px w-full max-w-xs bg-white/20" />
            <p className="mb-4 text-sm font-medium text-white/95">Masterbatch &amp; Additive Solutions</p>
            <p className="text-sm leading-relaxed text-white/80">
              Leading manufacturer of color and additive masterbatches, providing innovative polymer
              solutions for a wide range of industries.
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div className={`${colDivider}`}>
            <SectionHeading>Quick Links</SectionHeading>
            <BulletList items={quickLinks} />
          </div>

          {/* Column 3 — Products */}
          <div className={`${colDivider}`}>
            <SectionHeading>Our Products</SectionHeading>
            <BulletList items={productLinks} />
          </div>

          {/* Column 4 — Contact */}
          <div className={`${colDivider}`}>
            <SectionHeading>Contact Us</SectionHeading>
            <div className="space-y-0 text-sm text-white/90">
              <div className="flex gap-3 border-b border-white/10 pb-4">
                <IconPin />
                <p className="leading-relaxed">
                  Lot No 14, Fullerton Industrial Estate
                  <br />
                  Nagoda, Kalutara
                  <br />
                  Sri Lanka
                </p>
              </div>
              <div className="flex gap-3 border-b border-white/10 py-4">
                <IconPhone />
                <div className="space-y-1">
                  <a
                    href="tel:+94342289618"
                    className="block transition-colors hover:text-white"
                  >
                    +94 34 2289618
                  </a>
                  <a
                    href="tel:+94362231153"
                    className="block transition-colors hover:text-white"
                  >
                    +94 36 2231153
                  </a>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <IconMail />
                <a
                  href="mailto:info@lanmic.com"
                  className="break-all transition-colors hover:text-white"
                >
                  info@lanmic.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-sm md:flex-row">
            <div className="flex items-center gap-2 text-center text-white/70 md:text-left">
              <Image
                src="/lanmic_logo.png"
                alt=""
                width={24}
                height={24}
                className="h-6 w-6 object-contain opacity-90"
              />
              <span>
                © {new Date().getFullYear()} LANMIC POLYMERS. All rights reserved.
              </span>
            </div>
            <p className="text-center text-white/45 md:text-right">
              Designed by <span className="font-semibold text-white/70">Manoj Weerasinghe</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
