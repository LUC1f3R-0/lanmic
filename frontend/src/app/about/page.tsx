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
      {/* About 2 Section */}
      <section id="about-2" className="about-2-section py-20 lg:py-32 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="text-center lg:text-left" data-aos="fade-up" data-aos-delay="100">
                <div className="relative">
                  <Image
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=500&fit=crop"
                    alt="Our Mission"
                    width={600}
                    height={500}
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 order-1 lg:order-2" data-aos="fade-up">
              <div className="px-3">
                <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
                  Our Mission
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  The Big Oxmox advised her not to do so, because there were thousands.
                </h2>
                <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                  A small river named Duden flows by their place and supplies it
                  with the necessary regelialia. It is a paradisematic country.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  The Big Oxmox advised her not to do so, because there were
                  thousands of bad Commas, wild Question Marks and devious Semikoli.
                </p>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 transform">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="services-item bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up">
              <div className="services-icon w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Technology</h3>
                <p className="text-gray-600 leading-relaxed">Separated they live in Bookmarksgrove right at the coast</p>
              </div>
            </div>

            <div className="services-item bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="100">
              <div className="services-icon w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Web Design</h3>
                <p className="text-gray-600 leading-relaxed">Separated they live in Bookmarksgrove right at the coast</p>
              </div>
            </div>

            <div className="services-item bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" data-aos="fade-up" data-aos-delay="200">
              <div className="services-icon w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Branding</h3>
                <p className="text-gray-600 leading-relaxed">Separated they live in Bookmarksgrove right at the coast</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="stats-section py-20 lg:py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
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
                  data-aos="fade-up"
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
                  Far far away, behind the word mountains, far from the countries
                  Vokalia and Consonantia.
                </p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  There live the blind texts. Separated they live in Bookmarksgrove
                  right at the coast of the Semantics, a large language ocean.
                </p>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center" data-aos="fade-up" data-aos-delay="100">
                    <div className="text-3xl font-bold text-blue-600 mb-2">3,919</div>
                    <div className="text-sm text-gray-600 font-medium">Coffee</div>
                  </div>
                  <div className="text-center" data-aos="fade-up" data-aos-delay="200">
                    <div className="text-3xl font-bold text-green-600 mb-2">2,831</div>
                    <div className="text-sm text-gray-600 font-medium">Codes</div>
                  </div>
                  <div className="text-center" data-aos="fade-up" data-aos-delay="300">
                    <div className="text-3xl font-bold text-purple-600 mb-2">1,914</div>
                    <div className="text-sm text-gray-600 font-medium">Projects</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team-section py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Our Team
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Meet Our Experts
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our dedicated team of professionals is committed to delivering excellence in every project.
            </p>
          </div>

          <div className="relative" data-aos="fade-up" data-aos-delay="100">
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
                    <a href="#" className="hover:text-blue-600 transition-colors duration-300">
                      <span className="text-blue-600">Jeremy</span> Walker
                    </a>
                  </h3>
                  <span className="text-gray-600 text-sm mb-4 block">CEO, Founder, Atty.</span>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Separated they live in. Separated they live in Bookmarksgrove
                    right at the coast of the Semantics, a large language ocean.
                  </p>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300">
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
                    <a href="#" className="hover:text-blue-600 transition-colors duration-300">
                      <span className="text-blue-600">Lawson</span> Arnold
                    </a>
                  </h3>
                  <span className="text-gray-600 text-sm mb-4 block">CTO, Technology Lead</span>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Separated they live in. Separated they live in Bookmarksgrove
                    right at the coast of the Semantics, a large language ocean.
                  </p>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300">
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
                    <a href="#" className="hover:text-blue-600 transition-colors duration-300">
                      <span className="text-blue-600">Patrik</span> White
                    </a>
                  </h3>
                  <span className="text-gray-600 text-sm mb-4 block">Design Director</span>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Separated they live in. Separated they live in Bookmarksgrove
                    right at the coast of the Semantics, a large language ocean.
                  </p>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300">
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
                    <a href="#" className="hover:text-blue-600 transition-colors duration-300">
                      <span className="text-blue-600">Kathryn</span> Ryan
                    </a>
                  </h3>
                  <span className="text-gray-600 text-sm mb-4 block">Marketing Manager</span>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Separated they live in. Separated they live in Bookmarksgrove
                    right at the coast of the Semantics, a large language ocean.
                  </p>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300">
                    Learn More <span className="inline-block ml-1">→</span>
                  </a>
                </div>
              </SwiperSlide>
            </Swiper>

            <div className="flex justify-center mt-8 space-x-4">
              <button className="js-custom-prev w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-300">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="js-custom-next w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors duration-300">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="team-pagination mt-6"></div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section py-20 lg:py-32 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
              Happy Customers
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Testimonials
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="max-w-4xl mx-auto" data-aos="fade-up">
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
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Adam Aderson</h3>
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
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Lukas Devlin</h3>
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
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Kayla Bryant</h3>
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
