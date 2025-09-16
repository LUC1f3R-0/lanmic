"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import AOS from "aos";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  // Note: Removed automatic redirect to dashboard
  // Users can now visit the homepage even when authenticated
  // They can access dashboard through the header navigation or direct URL

  return (
    <main className="main">
      {/* Hero Section */}
      <section className="hero-section relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-cyan-50 to-emerald-100 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-easing="ease-out-cubic"
            >
              Welcome to{" "}
              <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                LANMIC Polymers
              </span>
            </h1>
            <p
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              Your trusted partner in innovative polymer solutions. We
              deliver excellence through cutting-edge technology and
              sustainable practices.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              data-aos="zoom-in"
              data-aos-delay="400"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <button 
                onClick={() => router.push('/admin')}
                className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 transform"
              >
                Admin Access
              </button>
              <button 
                onClick={() => router.push('/contact')}
                className="border-2 border-emerald-400 text-emerald-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-emerald-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="about-section py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div
              className="w-full lg:w-1/2 order-1 lg:order-1"
              data-aos="zoom-in"
              data-aos-delay="200"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="relative w-full">
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
                    el: ".about-pagination",
                  }}
                  className="rounded-2xl overflow-hidden shadow-2xl w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px]"
                >
                  <SwiperSlide>
                    <div className="relative w-full h-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center">
                      <Image
                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&auto=format&q=80"
                        alt="Manufacturing Process"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/80 to-blue-700/80 flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <h3 className="text-2xl font-bold mb-2">Manufacturing Excellence</h3>
                          <p className="text-lg">Advanced production processes</p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
                      <Image
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format&q=80"
                        alt="Quality Control"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/80 to-teal-700/80 flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <h3 className="text-2xl font-bold mb-2">Quality Assurance</h3>
                          <p className="text-lg">Rigorous testing standards</p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="relative w-full h-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                      <Image
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&auto=format&q=80"
                        alt="Innovation Lab"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/80 to-purple-700/80 flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <h3 className="text-2xl font-bold mb-2">Innovation Hub</h3>
                          <p className="text-lg">Cutting-edge research & development</p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                </Swiper>
                <div className="about-pagination mt-4"></div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 order-2 lg:order-2">
              <div className="space-y-6">
                <span
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide"
                  data-aos="fade-up"
                  data-aos-duration="800"
                  data-aos-easing="ease-out-cubic"
                >
                  About Us
                </span>
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                  data-aos="fade-up"
                  data-aos-delay="100"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  Leading Innovation in Polymer Technology
                </h2>
                <p
                  className="text-lg text-gray-600 leading-relaxed"
                  data-aos="fade-up"
                  data-aos-delay="200"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  At LANMIC Polymers, we specialize in developing cutting-edge polymer solutions 
                  that drive innovation across industries. Our commitment to quality, sustainability, 
                  and technological advancement has made us a trusted partner for businesses worldwide.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl hover:from-cyan-100 hover:to-blue-200 transition-all duration-300 border border-cyan-200">
                    <div className="text-2xl font-bold text-cyan-600 mb-2">
                      25+
                    </div>
                    <div className="text-sm text-gray-700">
                      Years Experience
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl hover:from-violet-100 hover:to-purple-200 transition-all duration-300 border border-violet-200">
                    <div className="text-2xl font-bold text-violet-600 mb-2">
                      500+
                    </div>
                    <div className="text-sm text-gray-700">
                      Projects Completed
                    </div>
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
        className="services-section py-20 lg:py-32 bg-gradient-to-br from-indigo-50 via-cyan-50 to-emerald-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
              data-aos="fade-up"
            >
              Our Services
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              What We Offer
            </h2>
            <p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Comprehensive polymer solutions tailored to your specific
              needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              className="group bg-gradient-to-br from-white to-cyan-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-cyan-100"
              data-aos="zoom-in"
              data-aos-delay="100"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                Advanced Technology
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Cutting-edge polymer technology solutions for modern
                manufacturing needs
              </p>
            </div>

            <div
              className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-emerald-100"
              data-aos="zoom-in"
              data-aos-delay="200"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300">
                Custom Design
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tailored polymer solutions designed specifically for your
                requirements
              </p>
            </div>

            <div
              className="group bg-gradient-to-br from-white to-violet-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-violet-100"
              data-aos="zoom-in"
              data-aos-delay="300"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                Quality Assurance
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Rigorous quality control processes ensuring the highest
                standards
              </p>
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
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=500&fit=crop&auto=format&q=80"
                  alt="Our Team"
                  width={600}
                  height={500}
                  className="rounded-2xl shadow-2xl"
                  data-aos="slide-right"
                  data-aos-duration="1000"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                  data-aos-easing="ease-out-cubic"
                />
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 shadow-xl">
                  <div className="text-3xl font-bold text-white">
                    25+
                  </div>
                  <div className="text-sm text-cyan-100">
                    Years of Excellence
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="space-y-8">
                <div>
                  <span className="inline-block bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
                    Why Choose Us
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    Excellence Through Innovation and Quality
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    Our state-of-the-art facilities and experienced team enable us to deliver 
                    polymer solutions that meet the highest industry standards. We combine 
                    traditional craftsmanship with modern technology to create products that 
                    exceed expectations and drive business success.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div
                    className="text-center p-6 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-cyan-200"
                    data-aos="slide-up"
                    data-aos-delay="100"
                    data-aos-duration="800"
                    data-aos-easing="ease-out-cubic"
                  >
                    <div className="text-3xl font-bold text-cyan-600 mb-2">
                      1,000+
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Products Delivered
                    </div>
                  </div>

                  <div
                    className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-emerald-200"
                    data-aos="slide-up"
                    data-aos-delay="200"
                    data-aos-duration="800"
                    data-aos-easing="ease-out-cubic"
                  >
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      50+
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Countries Served
                    </div>
                  </div>

                  <div
                    className="text-center p-6 bg-gradient-to-br from-violet-50 to-purple-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-violet-200"
                    data-aos="slide-up"
                    data-aos-delay="300"
                    data-aos-duration="800"
                    data-aos-easing="ease-out-cubic"
                  >
                    <div className="text-3xl font-bold text-violet-600 mb-2">
                      99%
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Customer Satisfaction
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section
        id="blog-posts"
        className="blog-section py-20 lg:py-32 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
              data-aos="fade-up"
            >
              Latest News
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Recent Blog Posts
            </h2>
            <p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Stay updated with the latest insights and innovations in
              polymer technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article
              className="group bg-gradient-to-br from-white to-amber-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-amber-100"
              data-aos="flip-left"
              data-aos-delay="100"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop&auto=format&q=80"
                  alt="Blog Post"
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Technology
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>July 20, 2024</span>
                  <span className="mx-2">•</span>
                  <span>5 min read</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors duration-300">
                  <a href="#" className="hover:underline">
                    Advanced Polymer Manufacturing Techniques
                  </a>
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Discover how our latest manufacturing innovations are revolutionizing 
                  the polymer industry with sustainable and efficient production methods.
                </p>
                <div className="flex items-center">
                  <Image
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format&q=80"
                    alt="Author"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      Dr. Sarah Chen
                    </div>
                    <div className="text-sm text-gray-600">
                      Chief Technology Officer
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-emerald-100"
              data-aos="flip-left"
              data-aos-delay="200"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format&q=80"
                  alt="Blog Post"
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Innovation
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>July 18, 2024</span>
                  <span className="mx-2">•</span>
                  <span>3 min read</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                  <a href="#" className="hover:underline">
                    Sustainable Polymer Solutions for the Future
                  </a>
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Learn about our commitment to environmental responsibility and how we're 
                  developing eco-friendly polymer alternatives for a sustainable future.
                </p>
                <div className="flex items-center">
                  <Image
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format&q=80"
                    alt="Author"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      Dr. Michael Rodriguez
                    </div>
                    <div className="text-sm text-gray-600">
                      Research Director
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article
              className="group bg-gradient-to-br from-white to-violet-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-violet-100"
              data-aos="flip-left"
              data-aos-delay="300"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&auto=format&q=80"
                  alt="Blog Post"
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Industry
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>July 15, 2024</span>
                  <span className="mx-2">•</span>
                  <span>7 min read</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors duration-300">
                  <a href="#" className="hover:underline">
                    Quality Assurance in Polymer Production
                  </a>
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Explore our rigorous quality control processes and how we ensure 
                  every product meets the highest industry standards and customer expectations.
                </p>
                <div className="flex items-center">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format&q=80"
                    alt="Author"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      Lisa Thompson
                    </div>
                    <div className="text-sm text-gray-600">
                      Quality Assurance Manager
                    </div>
                  </div>
                </div>
              </div>
            </article>
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
            <span
              className="inline-block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
              data-aos="fade-up"
            >
              Testimonials
            </span>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              What Our Clients Say
            </h2>
            <p
              className="text-lg text-gray-600 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
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
            <div className="relative">
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
                className="testimonials-swiper w-full"
              >
                <SwiperSlide>
                  <div className="text-center">
                    <div className="mb-8">
                      <Image
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face&auto=format&q=80"
                        alt="Adam Aderson"
                        width={120}
                        height={120}
                        className="w-24 h-24 rounded-full mx-auto shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <blockquote className="text-xl lg:text-2xl text-gray-700 italic mb-6 leading-relaxed">
                      &ldquo;LANMIC Polymers has consistently delivered
                      exceptional quality and innovative solutions. Their
                      team&apos;s expertise and commitment to excellence
                      have made them our trusted partner for all polymer
                      needs.&rdquo;
                    </blockquote>
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        David Anderson
                      </h4>
                      <p className="text-gray-600">
                        CEO, Advanced Materials Corp
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="text-center">
                    <div className="mb-8">
                      <Image
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face&auto=format&q=80"
                        alt="Lukas Devlin"
                        width={120}
                        height={120}
                        className="w-24 h-24 rounded-full mx-auto shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <blockquote className="text-xl lg:text-2xl text-gray-700 italic mb-6 leading-relaxed">
                      &ldquo;The level of technical expertise and customer
                      service at LANMIC is unmatched. They&apos;ve helped us
                      achieve remarkable results with their cutting-edge
                      polymer solutions.&rdquo;
                    </blockquote>
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        Dr. James Wilson
                      </h4>
                      <p className="text-gray-600">CTO, PolymerTech Solutions</p>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide>
                  <div className="text-center">
                    <div className="mb-8">
                      <Image
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face&auto=format&q=80"
                        alt="Kayla Bryant"
                        width={120}
                        height={120}
                        className="w-24 h-24 rounded-full mx-auto shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <blockquote className="text-xl lg:text-2xl text-gray-700 italic mb-6 leading-relaxed">
                      &ldquo;Working with LANMIC has been a game-changer for
                      our manufacturing process. Their sustainable approach
                      and quality products have exceeded our
                      expectations.&rdquo;
                    </blockquote>
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">
                        Maria Garcia
                      </h4>
                      <p className="text-gray-600">
                        Operations Director, EcoMaterials Inc
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
              <div className="testimonials-pagination mt-12"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-20 lg:py-32 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
              data-aos="fade-up"
              data-aos-duration="1200"
              data-aos-easing="ease-out-cubic"
            >
              Ready to Get Started?
            </h2>
            <p
              className="text-xl text-cyan-100 mb-8 leading-relaxed"
              data-aos="fade-up"
              data-aos-delay="100"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              Let&apos;s discuss how LANMIC Polymers can help transform your
              business with our innovative polymer solutions.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              data-aos="zoom-in"
              data-aos-delay="200"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <button className="bg-white text-cyan-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 transform">
                Contact Us Today
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-cyan-600 transition-all duration-300">
                Request Quote
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
