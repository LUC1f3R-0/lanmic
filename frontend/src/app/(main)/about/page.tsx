"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import AOS from "aos";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function About() {
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

      {/* LANMIC Group Values Section */}
      <section
        id="values"
        className="values-section py-20 lg:py-32 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
              data-aos="fade-up"
            >
              LANMIC GROUP VALUES
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Our Core Values
            </h2>
            <p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              The principles that guide everything we do at LANMIC Group
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-blue-600"
              data-aos="zoom-in"
              data-aos-delay="100"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4">
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
                <h3 className="text-2xl font-bold text-gray-900">Integrity</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  We conduct business activities ethically and transparently
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  We own decisions and take accountability
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  We are open and honest when communicating with others
                </li>
              </ul>
            </div>

            <div
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-green-600"
              data-aos="zoom-in"
              data-aos-delay="200"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Striving for Excellency</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We ensure for continuous growth through R&D innovation to create quality customer centric products and solutions using state of the art technology
              </p>
            </div>

            <div
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-purple-600"
              data-aos="zoom-in"
              data-aos-delay="300"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">People Excellence</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We recognize top performers, commit to develop overall well-being and happiness of our people
              </p>
            </div>

            <div
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-l-4 border-teal-600"
              data-aos="zoom-in"
              data-aos-delay="400"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Social Accountability</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                In everything we do we strive for positive impact on people and planet
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="services-section py-20 lg:py-32 bg-gradient-to-br from-indigo-50 via-cyan-50 to-emerald-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="services-item bg-gradient-to-br from-white to-cyan-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-cyan-100"
              data-aos="zoom-in"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="services-icon w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Technology
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Separated they live in Bookmarksgrove right at the coast
                </p>
              </div>
            </div>

            <div
              className="services-item bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-emerald-100"
              data-aos="zoom-in"
              data-aos-delay="100"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="services-icon w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mb-6">
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
                  Web Design
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Separated they live in Bookmarksgrove right at the coast
                </p>
              </div>
            </div>

            <div
              className="services-item bg-gradient-to-br from-white to-violet-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-violet-100"
              data-aos="zoom-in"
              data-aos-delay="200"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="services-icon w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Branding
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Separated they live in Bookmarksgrove right at the coast
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        className="stats-section py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2">
              <div className="relative">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=500&fit=crop"
                  alt="Our Team"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl"
                  data-aos="slide-right"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                />
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="space-y-6">
                <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
                  Why Us
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Far far away Behind the Word Mountains
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-4">
                  Far far away, behind the word mountains, far from the
                  countries Vokalia and Consonantia.
                </p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  There live the blind texts. Separated they live in
                  Bookmarksgrove right at the coast of the Semantics, a large
                  language ocean.
                </p>

                <div className="grid grid-cols-3 gap-6">
                  <div
                    className="text-center"
                    data-aos="slide-up"
                    data-aos-delay="100"
                    data-aos-duration="800"
                    data-aos-easing="ease-out-cubic"
                  >
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      3,919
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Coffee
                    </div>
                  </div>
                  <div
                    className="text-center"
                    data-aos="slide-up"
                    data-aos-delay="200"
                    data-aos-duration="800"
                    data-aos-easing="ease-out-cubic"
                  >
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      2,831
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Codes
                    </div>
                  </div>
                  <div
                    className="text-center"
                    data-aos="slide-up"
                    data-aos-delay="300"
                    data-aos-duration="800"
                    data-aos-easing="ease-out-cubic"
                  >
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      1,914
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Projects
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="team"
        className="team-section py-20 lg:py-32 bg-gradient-to-br from-indigo-50 via-cyan-50 to-emerald-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Our Team
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Meet Our Experts
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our dedicated team of professionals is committed to delivering
              excellence in every project.
            </p>
          </div>

          <div
            className="relative"
            data-aos="zoom-in"
            data-aos-delay="100"
            data-aos-duration="1000"
            data-aos-easing="ease-out-cubic"
          >
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              loop={true}
              speed={600}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              slidesPerView={1}
              spaceBetween={30}
              pagination={{
                clickable: true,
                el: ".team-pagination",
              }}
              navigation={{
                nextEl: ".js-custom-next",
                prevEl: ".js-custom-prev",
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                1200: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
              }}
              className="team-swiper"
            >
              <SwiperSlide>
                <div className="team bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="pic mb-6">
                    <Image
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                      alt="Jeremy Walker"
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <a
                      href="#"
                      className="hover:text-blue-600 transition-colors duration-300"
                    >
                      <span className="text-blue-600">Jeremy</span> Walker
                    </a>
                  </h3>
                  <span className="text-gray-600 text-sm mb-4 block">
                    CEO, Founder, Atty.
                  </span>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Separated they live in. Separated they live in
                    Bookmarksgrove right at the coast of the Semantics, a large
                    language ocean.
                  </p>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
                  >
                    Learn More <span className="inline-block ml-1">→</span>
                  </a>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="team bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="pic mb-6">
                    <Image
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                      alt="Lawson Arnold"
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <a
                      href="#"
                      className="hover:text-blue-600 transition-colors duration-300"
                    >
                      <span className="text-blue-600">Lawson</span> Arnold
                    </a>
                  </h3>
                  <span className="text-gray-600 text-sm mb-4 block">
                    CTO, Technology Lead
                  </span>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Separated they live in. Separated they live in
                    Bookmarksgrove right at the coast of the Semantics, a large
                    language ocean.
                  </p>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
                  >
                    Learn More <span className="inline-block ml-1">→</span>
                  </a>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="team bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="pic mb-6">
                    <Image
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
                      alt="Patrik White"
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <a
                      href="#"
                      className="hover:text-blue-600 transition-colors duration-300"
                    >
                      <span className="text-blue-600">Patrik</span> White
                    </a>
                  </h3>
                  <span className="text-gray-600 text-sm mb-4 block">
                    Design Director
                  </span>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Separated they live in. Separated they live in
                    Bookmarksgrove right at the coast of the Semantics, a large
                    language ocean.
                  </p>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
                  >
                    Learn More <span className="inline-block ml-1">→</span>
                  </a>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="team bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="pic mb-6">
                    <Image
                      src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
                      alt="Kathryn Ryan"
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    <a
                      href="#"
                      className="hover:text-blue-600 transition-colors duration-300"
                    >
                      <span className="text-blue-600">Kathryn</span> Ryan
                    </a>
                  </h3>
                  <span className="text-gray-600 text-sm mb-4 block">
                    Marketing Manager
                  </span>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Separated they live in. Separated they live in
                    Bookmarksgrove right at the coast of the Semantics, a large
                    language ocean.
                  </p>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300"
                  >
                    Learn More <span className="inline-block ml-1">→</span>
                  </a>
                </div>
              </SwiperSlide>
            </Swiper>

            <div className="flex justify-center mt-8 space-x-4">
              <button className="js-custom-prev w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-300 cursor-pointer">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button className="js-custom-next w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-300  cursor-pointer">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <div className="team-pagination mt-6"></div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="testimonials-section py-20 lg:py-32 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Happy Customers
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Testimonials
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Don&apos;t just take our word for it - hear from our satisfied
              customers
            </p>
          </div>

          <div
            className="max-w-4xl mx-auto"
            data-aos="zoom-in"
            data-aos-duration="1000"
            data-aos-easing="ease-out-cubic"
          >
            <Swiper
              modules={[Autoplay, Pagination]}
              loop={true}
              speed={600}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              slidesPerView={1}
              pagination={{
                clickable: true,
                el: ".testimonials-pagination",
              }}
              className="testimonials-swiper"
            >
              <SwiperSlide>
                <div className="testimonial text-center">
                  <div className="mb-8">
                    <Image
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face"
                      alt="Adam Aderson"
                      width={120}
                      height={120}
                      className="w-24 h-24 rounded-full mx-auto shadow-lg"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Adam Aderson
                  </h3>
                  <blockquote className="text-xl lg:text-2xl text-gray-700 italic mb-6 leading-relaxed">
                    &ldquo;There live the blind texts. Separated they live in
                    Bookmarksgrove right at the coast of the Semantics, a large
                    language ocean.&rdquo;
                  </blockquote>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="testimonial text-center">
                  <div className="mb-8">
                    <Image
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"
                      alt="Lukas Devlin"
                      width={120}
                      height={120}
                      className="w-24 h-24 rounded-full mx-auto shadow-lg"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Lukas Devlin
                  </h3>
                  <blockquote className="text-xl lg:text-2xl text-gray-700 italic mb-6 leading-relaxed">
                    &ldquo;There live the blind texts. Separated they live in
                    Bookmarksgrove right at the coast of the Semantics, a large
                    language ocean.&rdquo;
                  </blockquote>
                </div>
              </SwiperSlide>

              <SwiperSlide>
                <div className="testimonial text-center">
                  <div className="mb-8">
                    <Image
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face"
                      alt="Kayla Bryant"
                      width={120}
                      height={120}
                      className="w-24 h-24 rounded-full mx-auto shadow-lg"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Kayla Bryant
                  </h3>
                  <blockquote className="text-xl lg:text-2xl text-gray-700 italic mb-6 leading-relaxed">
                    &ldquo;There live the blind texts. Separated they live in
                    Bookmarksgrove right at the coast of the Semantics, a large
                    language ocean.&rdquo;
                  </blockquote>
                </div>
              </SwiperSlide>
            </Swiper>
            <div className="testimonials-pagination mt-8"></div>
          </div>
        </div>
      </section>
    </main>
  );
}
