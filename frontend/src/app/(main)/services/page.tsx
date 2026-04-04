"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import AOS from "aos";
import { contactApiService, ContactFormData } from "@/lib/contactApi";

export default function ProductsAndApplications() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    product: "Filler Masterbatch",
    brochure: true,
    tds: true,
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const requestedDocs: string[] = [];
      if (formData.brochure) requestedDocs.push("Product Brochure");
      if (formData.tds) requestedDocs.push("Technical Data Sheet");

      const contactData: ContactFormData = {
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        message:
          `Product & Application Page Request\n` +
          `Product: ${formData.product}\n` +
          `Requested documents: ${requestedDocs.join(", ") || "None selected"}\n\n` +
          `${formData.message || "No additional message provided."}`,
      };

      const response = await contactApiService.submitContactForm(contactData);

      if (response.success) {
        setSubmitStatus({ type: "success", message: response.message });
        setFormData({
          name: "",
          email: "",
          company: "",
          product: "Filler Masterbatch",
          brochure: true,
          tds: true,
          message: "",
        });
      } else {
        setSubmitStatus({ type: "error", message: response.message });
      }
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message:
          error.message ||
          "An error occurred while submitting your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="main">
      {/* Hero / Intro Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div
            className="max-w-4xl mx-auto text-center"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-easing="ease-out-cubic"
          >
            <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Product & Application
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Our Products
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-blue-700 mb-4 leading-relaxed">
              “High Loding Masterbatch Solutions for Reliable Plastic Manufacturing’’
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our company manufacture premium Calcium Carbonate Filler Masterbatch, White
              Masterbatch and Additive Masterbatch designed to reduce production costs,
              improve product strength, and ensure smooth processing performance. Our
              high-quality masterbatch solutions support film extrusion and injection
              molding applications, helping manufacturers achieve consistent quality,
              better efficiency, and long-term profitability.
            </p>
          </div>
        </div>
      </section>

      {/* Product Types Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover-tilt border border-blue-200"
              data-aos="zoom-in-rotate"
              data-aos-delay="0"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Filler Masterbatch
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Filler Masterbatch is a cost-effective compounding solution that improves
                mechanical strength, stiffness, and overall polymer performance. We supply
                high-quality Calcium Carbonate and Talc Masterbatch designed for smooth
                processing, high loading efficiency, and consistent results in film
                extrusion and injection molding applications.
              </p>
            </div>

            <div
              className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover-tilt border border-indigo-200"
              data-aos="zoom-in-rotate"
              data-aos-delay="100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                White Masterbatch
              </h3>
              <p className="text-gray-700 leading-relaxed">
                White Masterbatch is a highly opaque, bright, and reflective pigment that
                delivers excellent coverage and consistent color for plastics, paints, and
                coatings.
              </p>
            </div>

            <div
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover-tilt border border-emerald-200 min-h-[220px]"
              data-aos="zoom-in-rotate"
              data-aos-delay="200"
            >
              <Image
                src="/additive-mb-bg.png"
                alt="Additives masterbatch"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/75 to-emerald-800/40" />
              <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-4">
                  Additives Masterbatch
                </h3>
                <p className="text-white/95 leading-relaxed text-sm">
                  Additives Masterbatch are concentrated mixtures designed to enhance
                  plastic performance, color stability, UV resistance, and functionality
                  for superior end products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Applications
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Our masterbatch solutions are engineered for a wide range of processing
              technologies and end-use products.
            </p>
          </div>

          {/* Blown Films */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
            <div
              data-aos="fade-right"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Blown films</h3>
              <p className="text-gray-700 mb-4">
                Our masterbatch solutions are specially formulated for blown film
                production, ensuring excellent dispersion, smooth processing, and cost
                efficiency.
              </p>
              <h4 className="font-semibold text-gray-900 mb-2">Common applications</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Refuse Bag</li>
                <li>Transparent Film</li>
                <li>Agriculture Film</li>
                <li>Shopping Bag</li>
                <li>Garbage Bag</li>
              </ul>
            </div>
            <div
              className="relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl"
              data-aos="fade-left"
              data-aos-duration="1000"
            >
              <Image
                src="/Blow film.png"
                alt="Blown film application"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Injection Molding */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
            <div
              className="order-2 lg:order-1 relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <Image
                src="/Injection molding.png"
                alt="Injection molding application"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div
              className="order-1 lg:order-2"
              data-aos="fade-left"
              data-aos-duration="1000"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Injection molding
              </h3>
              <p className="text-gray-700 mb-4">
                Designed to enhance strength, rigidity, and surface finish in injection
                molded products.
              </p>
              <h4 className="font-semibold text-gray-900 mb-2">Common applications</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Garden Furniture</li>
                <li>Office Material</li>
                <li>Household Electrical Appliances, etc.</li>
              </ul>
            </div>
          </div>

          {/* Extrusion */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-16">
            <div
              data-aos="fade-right"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Extrusion</h3>
              <p className="text-gray-700 mb-4">
                Engineered for consistent melt flow and dimensional stability in extrusion
                processes.
              </p>
              <h4 className="font-semibold text-gray-900 mb-2">Common applications</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Pipes, profile extrusion</li>
                <li>Raffia</li>
                <li>Non woven fabric</li>
              </ul>
            </div>
            <div
              className="relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl"
              data-aos="fade-left"
              data-aos-duration="1000"
            >
              <Image
                src="/Extrusion.png"
                alt="Extrusion application"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Thermoforming */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div
              className="order-2 lg:order-1 relative w-full h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-xl"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <Image
                src="/Thermoforming.png"
                alt="Thermoforming application"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div
              className="order-1 lg:order-2"
              data-aos="fade-left"
              data-aos-duration="1000"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Thermoforming</h3>
              <p className="text-gray-700 mb-4">
                Provides improved stiffness and processing performance for thermoformed
                plastic products.
              </p>
              <h4 className="font-semibold text-gray-900 mb-2">Common applications</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Food packaging</li>
                <li>Manufacturing industry</li>
                <li>Household appliances</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Lab & Equipment Gallery */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Laboratory & Processing Equipment
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              State-of-the-art equipment used for product development, testing, and
              quality assurance.
            </p>
          </div>

          <div
            className="relative w-full max-w-4xl mx-auto mb-12 aspect-[16/10] rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-gray-50"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <Image
              src="/mfi-machine.png"
              alt="Melt flow index (MFI) testing machine"
              fill
              className="object-contain p-4"
              sizes="(max-width: 896px) 100vw, 896px"
            />
            <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-sm font-medium px-4 py-2 text-center">
              MFI machine
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              className="relative w-full h-56 rounded-2xl overflow-hidden shadow-lg"
              data-aos="zoom-in"
              data-aos-delay="0"
            >
              <Image
                src="/Lab film blowing machine.png"
                alt="Lab film blowing machine"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-sm font-medium px-4 py-2">
                Lab Film blowing machine
              </div>
            </div>

            <div
              className="relative w-full h-56 rounded-2xl overflow-hidden shadow-lg"
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              <Image
                src="/Film Blow machine.png"
                alt="Film blow machine"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-sm font-medium px-4 py-2">
                Film Blow machine
              </div>
            </div>

            <div
              className="relative w-full h-56 rounded-2xl overflow-hidden shadow-lg"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <Image
                src="/Twin screw excluder machine.png"
                alt="Twin screw extruder machine"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-sm font-medium px-4 py-2">
                Twin screw Extruder machine
              </div>
            </div>

            <div
              className="relative w-full h-56 rounded-2xl overflow-hidden shadow-lg"
              data-aos="zoom-in"
              data-aos-delay="300"
            >
              <Image
                src="/Kneader machine.png"
                alt="Kneader machine"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-sm font-medium px-4 py-2">
                Kneader machine
              </div>
            </div>

            <div
              className="relative w-full h-56 rounded-2xl overflow-hidden shadow-lg"
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              <Image
                src="/Lab injection molding machine.png"
                alt="Lab injection molding machine"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-sm font-medium px-4 py-2">
                Lab injection molding machine
              </div>
            </div>

            <div
              className="relative w-full h-56 rounded-2xl overflow-hidden shadow-lg"
              data-aos="zoom-in"
              data-aos-delay="500"
            >
              <Image
                src="/Electronic weight Scale.png"
                alt="Electronic weight scale and Halogn moisture meter"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-sm font-medium px-4 py-2">
                Electronic weight Scale and Halogn moisture meter
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request Brochure / TDS Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto bg-white/10 border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Request Product Brochure & Technical Data Sheet
              </h2>
              <p className="text-white/80 text-lg">
                Share your details and select the documents you need. Our team will get
                back to you with the requested information.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent"
                    placeholder="Enter your company name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="product"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Product of Interest
                  </label>
                  <select
                    id="product"
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent"
                  >
                    <option value="Filler Masterbatch">Filler Masterbatch</option>
                    <option value="White Masterbatch">White Masterbatch</option>
                    <option value="Masterbatch Additives">Masterbatch Additives</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="block text-sm font-medium text-white mb-2">
                    Documents Required
                  </p>
                  <div className="space-y-2">
                    <label className="inline-flex items-center text-white/90">
                      <input
                        type="checkbox"
                        name="brochure"
                        checked={formData.brochure}
                        onChange={handleInputChange}
                        className="rounded border-white/40 bg-transparent text-cyan-300 focus:ring-cyan-300"
                      />
                      <span className="ml-2">Product Brochure</span>
                    </label>
                    <label className="inline-flex items-center text-white/90">
                      <input
                        type="checkbox"
                        name="tds"
                        checked={formData.tds}
                        onChange={handleInputChange}
                        className="rounded border-white/40 bg-transparent text-cyan-300 focus:ring-cyan-300"
                      />
                      <span className="ml-2">Technical Data Sheet</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-white mb-2"
                  >
                    Additional Details
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent resize-none"
                    placeholder="Share application details, quantity, or other requirements..."
                  />
                </div>
              </div>

              {submitStatus.type && (
                <div
                  className={`p-4 rounded-lg text-sm ${
                    submitStatus.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-300/60 text-emerald-50"
                      : "bg-red-500/10 border border-red-300/60 text-red-50"
                  }`}
                >
                  {submitStatus.message}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    isSubmitting
                      ? "bg-white/30 text-white cursor-not-allowed"
                      : "bg-white text-blue-700 hover:bg-cyan-50 hover:shadow-lg"
                  }`}
                >
                  {isSubmitting ? "Sending Request..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
