"use client";

import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-background-secondary text-text-primary">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* About Us */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/logo.png"
                alt="LANMIC Polymers Logo"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
              />
              <h3 className="text-lg font-semibold text-text-primary">About Us</h3>
            </div>
            <p className="text-sm leading-6 mb-4 text-text-secondary">
              LANMIC Polymers is your trusted partner in innovative polymer solutions. 
              We deliver excellence through cutting-edge technology and sustainable practices 
              across industries worldwide.
            </p>
            <Link
              href="/about"
              className="inline-block text-sm font-medium text-primary-500 hover:text-primary-600 hover:underline transition-colors"
            >
              Learn more →
            </Link>
          </div>


          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Company Info</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="block text-xs text-text-muted">Founded</span>
                <span className="text-text-secondary">1999</span>
              </li>
              <li>
                <span className="block text-xs text-text-muted">Headquarters</span>
                <span className="text-text-secondary">Sri Lanka</span>
              </li>
              <li>
                <span className="block text-xs text-text-muted">Industry</span>
                <span className="text-text-secondary">Polymer Manufacturing</span>
              </li>
              <li>
                <span className="block text-xs text-text-muted">Certifications</span>
                <span className="text-text-secondary">ISO 9001:2015</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-text-primary">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-xs text-text-muted mb-1">Phone</span>
                <a href="tel:+94342289618" className="text-text-secondary hover:text-primary-500 transition-colors">
                  +94 34 2289618
                </a>
                <br />
                <a href="tel:+94362231153" className="text-text-secondary hover:text-primary-500 transition-colors">
                  +94 36 2231153
                </a>
              </div>
              <div>
                <span className="block text-xs text-text-muted mb-1">Email</span>
                <a href="mailto:Niroshan.s@lanmic.com" className="text-text-secondary hover:text-primary-500 transition-colors">
                  Niroshan.s@lanmic.com
                </a>
              </div>
              <div>
                <span className="block text-xs text-text-muted mb-1">Address</span>
                <span className="text-text-secondary">
                  Lot No 14, Fullerton Industrial Estate<br />
                  Nagoda, Kaluthara<br />
                  Sri Lanka
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-neutral-300 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-sm md:flex-row">
            <div className="flex items-center space-x-3 text-center md:text-left">
              <Image
                src="/lanmic_logo.png"
                alt="LANMIC Polymers Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
              />
              <span className="text-text-secondary">© {new Date().getFullYear()} LANMIC POLYMERS. All rights reserved.</span>
            </div>
            <div className="text-center md:text-right text-text-muted">
              Designed by <span className="font-semibold text-text-primary">Manoj Weerasinghe</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
