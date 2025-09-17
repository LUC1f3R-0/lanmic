"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import AOS from "aos";

export default function Team() {
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
      <section className="hero-section py-20 lg:py-32 bg-gradient-to-br from-indigo-100 via-cyan-50 to-emerald-100 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span
              className="inline-block bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
              data-aos="fade-up"
            >
              Our Team
            </span>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="1200"
              data-aos-easing="ease-out-cubic"
            >
              Meet Our{" "}
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Expert Team
              </span>
            </h1>
            <p
              className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              Our dedicated team of professionals is committed to delivering
              excellence in polymer technology and innovative solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="leadership-section py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
              data-aos="fade-up"
            >
              Leadership
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Executive Leadership
            </h2>
            <p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              At LANMIC Polymers, leadership is about more than just decision-making — it&apos;s about inspiring innovation, empowering people, and creating solutions that make an impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div
              className="group bg-gradient-to-br from-white to-cyan-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-cyan-100"
              data-aos="zoom-in"
              data-aos-delay="100"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="relative mb-6">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
                  alt="Chandana Bopitiya"
                  width={400}
                  height={400}
                  className="w-full h-80 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  <span className="text-blue-600">Chandana</span> Bopitiya
                </h3>
                <p className="text-gray-600 mb-4">Group Managing Director, LANMIC Group</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  As the founder of the LANMIC Group, Chandana brings a wealth of experience and visionary thinking. He continues to guide and mentor the team at LANMIC Polymers, ensuring that the values of integrity, quality, and long-term partnerships remain at the heart of the business.
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div
              className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-emerald-100"
              data-aos="zoom-in"
              data-aos-delay="200"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="relative mb-6">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                  alt="Udesha Bopitiya"
                  width={400}
                  height={400}
                  className="w-full h-80 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  <span className="text-blue-600">Udesha</span> Bopitiya
                </h3>
                <p className="text-gray-600 mb-4">Director</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Udesha leads LANMIC Polymers with fresh energy and a modern outlook. With a strong technical background and a passion for polymers, she is focused on building products that combine performance, sustainability, and value for customers. Her hands-on approach and drive for continuous improvement ensure that the company stays ahead in a fast-changing industry.
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="our-team-section py-20 lg:py-32 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
              data-aos="fade-up"
            >
              Our Team
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Our Dynamic Team
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div
              className="bg-white rounded-2xl p-8 shadow-lg"
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We&apos;re proud of our dynamic team who bring ideas and strategies to life every day. Together, they drive research, develop new solutions, and ensure our customers get reliable, high-quality products that meet global standards.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                At LANMIC Polymers, we believe our people are our greatest strength — and their passion, creativity, and commitment shape everything we do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="stats-section py-20 lg:py-32 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div
              className="text-center p-8 bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100"
              data-aos="slide-up"
              data-aos-delay="100"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="text-4xl font-bold text-cyan-600 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Team Members</div>
            </div>
            <div
              className="text-center p-8 bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100"
              data-aos="slide-up"
              data-aos-delay="200"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="text-4xl font-bold text-emerald-600 mb-2">15+</div>
              <div className="text-gray-600 font-medium">Years Experience</div>
            </div>
            <div
              className="text-center p-8 bg-gradient-to-br from-white to-violet-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-violet-100"
              data-aos="slide-up"
              data-aos-delay="300"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="text-4xl font-bold text-violet-600 mb-2">
                200+
              </div>
              <div className="text-gray-600 font-medium">
                Projects Completed
              </div>
            </div>
            <div
              className="text-center p-8 bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100"
              data-aos="slide-up"
              data-aos-delay="400"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="text-4xl font-bold text-orange-600 mb-2">25+</div>
              <div className="text-gray-600 font-medium">Countries Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section className="join-team-section py-20 lg:py-32 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
              data-aos="fade-up"
            >
              Join Our Team
            </h2>
            <p
              className="text-xl text-cyan-100 mb-8 leading-relaxed"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Be part of our innovative team and help shape the future of
              polymer technology
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <button className="bg-white text-cyan-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 transform">
                View Open Positions
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-cyan-600 transition-all duration-300">
                Contact HR
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
