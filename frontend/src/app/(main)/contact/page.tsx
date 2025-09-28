"use client";

import React, { useEffect, useState } from "react";
import AOS from "aos";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    // Form submitted
  };

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <main className="main">
      {/* Hero Section */}
      <section className="hero-section py-20 lg:py-32 bg-gray-100 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
              data-aos="fade-up"
            >
              Get In Touch
            </span>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="1200"
              data-aos-easing="ease-out-cubic"
            >
              Let&apos;s{" "}
              <span className="text-blue-600">
                Connect
              </span>
            </h1>
            <p
              className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              Ready to discuss your polymer technology needs? We&apos;re here to
              help you find the perfect solution.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="contact-info-section py-20 lg:py-32 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div
                className="bg-white rounded-2xl p-8 shadow-xl"
                data-aos="slide-right"
                data-aos-duration="1000"
                data-aos-easing="ease-out-cubic"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div data-aos="fade-up" data-aos-delay="100">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div data-aos="fade-up" data-aos-delay="200">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div data-aos="fade-up" data-aos-delay="300">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div data-aos="fade-up" data-aos-delay="400">
                      <label
                        htmlFor="company"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your company name"
                      />
                    </div>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="500">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Tell us about your project or inquiry..."
                    />
                  </div>
                  <div data-aos="fade-up" data-aos-delay="600">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 transform"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Contact Details */}
            <div
              className="space-y-8"
              data-aos="slide-left"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Address
                      </h4>
                      <p className="text-gray-600 text-sm">
                        123 Polymer Street
                        <br />
                        Innovation District
                        <br />
                        Tech City, TC 12345
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Phone
                      </h4>
                      <p className="text-gray-600 text-sm">
                        +1 (555) 123-4567
                        <br />
                        +1 (555) 987-6543
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Email
                      </h4>
                      <p className="text-gray-600 text-sm">
                        info@lanmicpolymers.com
                        <br />
                        support@lanmicpolymers.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Business Hours
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-semibold text-gray-900">
                      9:00 AM - 6:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-semibold text-gray-900">
                      10:00 AM - 4:00 PM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold text-gray-900">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section py-20 lg:py-32 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              data-aos="fade-up"
            >
              Find Us
            </h2>
            <p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Visit our state-of-the-art facility and see our polymer technology
              in action
            </p>
          </div>

          <div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            data-aos="zoom-in"
            data-aos-delay="200"
            data-aos-duration="1000"
            data-aos-easing="ease-out-cubic"
          >
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <p className="text-gray-600">Interactive Map Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
