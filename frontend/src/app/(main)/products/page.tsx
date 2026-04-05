"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AOS from "aos";

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function ProductsPage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <main className="main">
      <section className="py-20 lg:py-28 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div
            className="max-w-4xl mx-auto text-center"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-easing="ease-out-cubic"
          >
            <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Products
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              High-Quality Masterbatch Solutions for Consistent Plastic Processing
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              We manufacture premium Calcium Carbonate Filler Masterbatch, White Masterbatch,
              and Additive Masterbatch engineered for reliable processing, consistent quality,
              and cost efficiency in plastic manufacturing.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our products are designed to perform consistently in film extrusion and injection
              molding, helping manufacturers reduce production costs, improve process stability,
              and maintain uniform product quality across large-scale production runs.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div
              className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-blue-100"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <Image
                src="/calcium-filler-masterbatch.jpg"
                alt="Calcium carbonate filler masterbatch"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            <div data-aos="fade-left" data-aos-duration="1000">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Calcium Carbonate Filler Masterbatch
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Calcium Carbonate Filler Masterbatch is a cost-effective solution developed
                to increase filler loading while maintaining smooth processing and mechanical
                performance. It is formulated using high-quality calcium carbonate (CaCO
                <sub>3</sub>), PE carrier resin, and performance additives to ensure reliable
                dispersion and stable extrusion behavior.
              </p>
              <p className="text-gray-700 leading-relaxed mb-8">
                Calcium carbonate sourced using advanced German processing technology provides
                high whiteness, fine particle size, and excellent dispersion, enabling filler
                loading of up to 85% without compromising processing efficiency.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Designed for</h3>
              <BulletList
                items={[
                  "Film extrusion",
                  "Injection molding",
                  "High-output, cost-sensitive applications",
                ]}
              />
            </div>
          </div>

          <div
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Product Range</h3>
              <BulletList
                items={[
                  "POLYMAX C1 – Injection Molding Grade",
                  "POLYMAX C2 – Film Extrusion Grade",
                ]}
              />
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-8 border border-indigo-100 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Key Benefits</h3>
              <BulletList
                items={[
                  "Reduces raw material cost per kg",
                  "Improves stiffness and dimensional stability",
                  "Ensures smooth extrusion and mold filling",
                  "Maintains consistent quality across batches",
                  "Enhances surface appearance and finish",
                ]}
              />
            </div>
          </div>

          <div className="mt-24 pt-16 border-t border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div
                className="order-2 lg:order-1"
                data-aos="fade-right"
                data-aos-duration="1000"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  White Masterbatch
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  POLYMAX White Masterbatch is a premium formulation based on high-performance
                  rutile Titanium Dioxide (TiO<sub>2</sub>), engineered for high opacity,
                  superior whiteness, and uniform pigment dispersion. It delivers consistent color
                  coverage and stable processing across a wide range of polymer applications.
                </p>
                <p className="text-gray-700 leading-relaxed mb-8">
                  Our white masterbatch range is optimized to balance brightness, dispersion, and
                  processability, helping manufacturers achieve reliable results even at higher
                  TiO<sub>2</sub> loadings.
                </p>
              </div>
              <div
                className="relative order-1 lg:order-2 w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-violet-100"
                data-aos="fade-left"
                data-aos-duration="1000"
              >
                <Image
                  src="/White%20MB.png"
                  alt="White masterbatch"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            <div
              className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl p-8 border border-violet-100 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Product Range</h3>
                <BulletList
                  items={[
                    "TiO₂ content from 50% to 75%",
                    "Compatible with PE, PP, and related polymers",
                  ]}
                />
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-100 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Key Benefits</h3>
                <BulletList
                  items={[
                    "Excellent opacity and colour consistency",
                    "High whiteness and reflectivity",
                    "Uniform pigment dispersion",
                    "Smooth processing with reduced defects",
                    "Consistent quality in large-scale production",
                    "Improved surface appearance of final products",
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mt-24 pt-16 border-t border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div
                className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-emerald-100"
                data-aos="fade-right"
                data-aos-duration="1000"
              >
                <Image
                  src="/additive-mb-bg.png"
                  alt="Additive masterbatch"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              <div data-aos="fade-left" data-aos-duration="1000">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  Additive Masterbatch Solutions
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our Additive Masterbatch range is designed to enhance processing efficiency,
                  durability, and functional performance of plastic products. Each formulation
                  ensures excellent dispersion, polymer compatibility, and consistent performance
                  in demanding processing conditions.
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-8">
                  Available Additive Masterbatches
                </h3>
                <BulletList
                  items={[
                    "Breathable Compound Filler Masterbatch",
                    "Desiccant Masterbatch",
                    "Antioxidant Masterbatch",
                    "UV Stabilizer Masterbatch",
                    "Antistatic Masterbatch",
                    "Antifogging Masterbatch",
                    "Antiblock Masterbatch",
                  ]}
                />
                <p className="text-gray-700 leading-relaxed mt-8">
                  These products are suitable for film extrusion, injection molding, and other
                  polymer processing applications where stability and performance are critical.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center" data-aos="fade-up">
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              For applications, technical data, and document requests, see our full{" "}
              <Link href="/services" className="text-blue-600 font-semibold hover:underline">
                Product &amp; Application
              </Link>{" "}
              section or get in touch.
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
