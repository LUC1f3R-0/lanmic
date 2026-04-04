"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AOS from "aos";

export default function CareerPage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <main className="main">
      <section className="py-20 lg:py-28 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="max-w-3xl mx-auto text-center mb-12"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Career
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Join the LANMIC Polymers team
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              We are always interested in people who share our commitment to quality,
              innovation, and sustainable polymer solutions.
            </p>
          </div>

          <div
            className="max-w-4xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
            data-aos-duration="1000"
          >
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
              <Image
                src="/staff-photograph.jpg"
                alt="LANMIC Polymers staff"
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>
          </div>

          <div className="mt-12 text-center max-w-2xl mx-auto" data-aos="fade-up">
            <p className="text-gray-700 mb-6">
              For career inquiries, please reach out with your CV and area of interest.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
