"use client";

import React, { useEffect } from "react";
import AOS from "aos";

export default function Services() {
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
      {/* Services 2 Section */}
      <section
        id="services-2"
        className="services-2-section py-20 lg:py-32 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 relative overflow-hidden"
      >
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-400 to-blue-500 rounded-full morphing"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-400 to-purple-500 rounded-full morphing" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full wave"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20"
            data-aos="fade-up"
            data-aos-duration="1200"
            data-aos-easing="ease-out-cubic"
          >
            <div className="lg:w-2/5">
              <span className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 hover-glow-intense glass-effect">
                Our Services
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Our Services
              </h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                "Comprehensive Polymer Solutions, Expertise in Polymer Innovation, Reliable Industrial Solutions"
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Our company specializes in providing high-quality polymer solutions for various industries, focusing on innovation, reliability, and sustainability to meet the highest standards and meet diverse client needs.
              </p>
              <button className="btn-primary px-8 py-4 rounded-full font-semibold text-lg hover-glow-intense hover-slide">
                Get Started
              </button>
            </div>

            <div className="lg:w-3/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div
                  className="services-item bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg hover-tilt border border-blue-200 glass-effect group"
                  data-aos="zoom-in-rotate"
                  data-aos-delay="0"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  <div className="services-icon w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 hover-rotate neon-glow group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      High-Quality Products
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Delivering premium polymer solutions that meet industry standards.
                    </p>
                  </div>
                </div>

                <div
                  className="services-item bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 shadow-lg hover-tilt border border-green-200 glass-effect group"
                  data-aos="zoom-in-rotate"
                  data-aos-delay="100"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  <div className="services-icon w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 hover-rotate neon-glow group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Innovative Solutions
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Developing advanced products through cutting-edge technology and research.
                    </p>
                  </div>
                </div>

                <div
                  className="services-item bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg hover-tilt border border-purple-200 glass-effect group"
                  data-aos="zoom-in-rotate"
                  data-aos-delay="200"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  <div className="services-icon w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center mb-6 hover-rotate neon-glow group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Customized Services
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Tailoring polymer solutions to meet the unique needs of each client.
                    </p>
                  </div>
                </div>

                <div
                  className="services-item bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 shadow-lg hover-tilt border border-orange-200 glass-effect group"
                  data-aos="zoom-in-rotate"
                  data-aos-delay="300"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  <div className="services-icon w-16 h-16 bg-gradient-to-r from-orange-600 to-red-500 rounded-2xl flex items-center justify-center mb-6 hover-rotate neon-glow group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Sustainability & Reliability
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Ensuring eco-friendly practices while providing consistent, dependable products.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="services-section py-20 lg:py-32 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              What We Offer
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Core Services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Leading polymer innovation through advanced research, quality assurance, and sustainable practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="services-item bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              data-aos="flip-left"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="services-icon w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  R&D and Innovation
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced product development, new formulas, state-of-the-art lab facilities, and continuous innovation pipeline to drive polymer technology forward.
                </p>
              </div>
            </div>

            <div
              className="services-item bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              data-aos="flip-left"
              data-aos-delay="100"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="services-icon w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Quality Assurance
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Comprehensive testing equipment, ISO and ASTM certifications, rigorous internal audit processes, and complete QA protocols ensuring highest standards.
                </p>
              </div>
            </div>

            <div
              className="services-item bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              data-aos="flip-left"
              data-aos-delay="200"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="services-icon w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Sustainability
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Eco-friendly initiatives, advanced recycling programs, energy-efficient processes, and comprehensive green product lines for environmental responsibility.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="additional-services-section py-20 lg:py-32 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Specialized Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Advanced Polymer Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Cutting-edge polymer technology and innovative manufacturing
              processes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              data-aos="slide-up"
              data-aos-delay="100"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Custom Formulation
              </h3>
              <p className="text-gray-600 text-sm">
                Tailored polymer solutions for specific applications
              </p>
            </div>

            <div
              className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              data-aos="slide-up"
              data-aos-delay="200"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Quality Assurance
              </h3>
              <p className="text-gray-600 text-sm">
                Rigorous testing and quality control processes
              </p>
            </div>

            <div
              className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              data-aos="slide-up"
              data-aos-delay="300"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Technical Support
              </h3>
              <p className="text-gray-600 text-sm">
                Expert consultation and ongoing technical assistance
              </p>
            </div>

            <div
              className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              data-aos="slide-up"
              data-aos-delay="400"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Research & Development
              </h3>
              <p className="text-gray-600 text-sm">
                Innovation in polymer technology and materials
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
