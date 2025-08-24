"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import AOS from "aos";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const Loader = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const containerStyle: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    fontFamily: "Helvetica, Arial, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    margin: 0,
    padding: 0,
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
  };

  const loaderStyle: React.CSSProperties = {
    height: "20px",
    width: "250px",
    position: "relative",
  };

  const createDotStyle = (
    color: string,
    delay: number
  ): React.CSSProperties => ({
    height: "20px",
    width: "20px",
    borderRadius: "50%",
    position: "absolute",
    backgroundColor: color,
    top: 0,
    left: 0,
    animation: `loaderMove 3s ease-in-out infinite ${delay}s`,
  });

  const textStyle: React.CSSProperties = {
    position: "absolute",
    top: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    fontWeight: "bold",
    fontSize: "16px",
    color: "#333",
  };

  return (
    <>
      <style>{`
        @keyframes loaderMove {
          0%, 15% { 
            transform: translateX(0px); 
          }
          45%, 65% { 
            transform: translateX(230px); 
          }
          95%, 100% { 
            transform: translateX(0px); 
          }
        }
      `}</style>

      <div style={containerStyle}>
        <div style={loaderStyle}>
          <div style={createDotStyle("#8cc759", 0.5)} />
          <div style={createDotStyle("#8c6daf", 0.4)} />
          <div style={createDotStyle("#ef5d74", 0.3)} />
          <div style={createDotStyle("#f9a74b", 0.2)} />
          <div style={createDotStyle("#60beeb", 0.1)} />
          <div style={createDotStyle("#fbef5a", 0)} />
          <div style={textStyle}>Loading{dots}</div>
        </div>
      </div>
    </>
  );
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && <Loader />}
      <div
        style={{
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.5s ease-in-out",
        }}
      >
        <main className="main">
          {/* Hero Section */}
          <section className="hero-section relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center max-w-4xl mx-auto">
                <h1 
                  className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
                  data-aos="fade-up"
                  data-aos-duration="1200"
                  data-aos-easing="ease-out-cubic"
                >
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                  Your trusted partner in innovative polymer solutions. We deliver excellence through cutting-edge technology and sustainable practices.
                </p>
                <div 
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  data-aos="zoom-in"
                  data-aos-delay="400"
                  data-aos-duration="800"
                  data-aos-easing="ease-out-cubic"
                >
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300 transform">
                    Get Started
                  </button>
                  <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="about-section py-20 lg:py-32 bg-white relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                <div
                  className="lg:w-1/2 order-2 lg:order-1"
                  data-aos="zoom-in"
                  data-aos-delay="200"
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
                        el: ".about-pagination",
                      }}
                      className="rounded-2xl overflow-hidden shadow-2xl"
                    >
                      <SwiperSlide>
                        <Image
                          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop"
                          alt="Manufacturing Process"
                          width={800}
                          height={600}
                          className="w-full h-auto object-cover"
                        />
                      </SwiperSlide>
                      <SwiperSlide>
                        <Image
                          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
                          alt="Quality Control"
                          width={800}
                          height={600}
                          className="w-full h-auto object-cover"
                        />
                      </SwiperSlide>
                      <SwiperSlide>
                        <Image
                          src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop"
                          alt="Innovation Lab"
                          width={800}
                          height={600}
                          className="w-full h-auto object-cover"
                        />
                      </SwiperSlide>
                    </Swiper>
                    <div className="about-pagination mt-4"></div>
                  </div>
                </div>
                <div className="lg:w-1/2 order-1 lg:order-2">
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
                      Excepteur sint occaecat cupidatat non proident
                    </h2>
                    <p
                      className="text-lg text-gray-600 leading-relaxed"
                      data-aos="fade-up"
                      data-aos-delay="200"
                      data-aos-duration="1000"
                      data-aos-easing="ease-out-cubic"
                    >
                      Far far away, behind the word mountains, far from the
                      countries Vokalia and Consonantia, there live the blind
                      texts. Separated they live in Bookmarksgrove right at the
                      coast of the Semantics, a large language ocean.
                    </p>
                    <div className="grid grid-cols-2 gap-6 pt-6">
                      <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors duration-300">
                        <div className="text-2xl font-bold text-blue-600 mb-2">25+</div>
                        <div className="text-sm text-gray-600">Years Experience</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors duration-300">
                        <div className="text-2xl font-bold text-purple-600 mb-2">500+</div>
                        <div className="text-sm text-gray-600">Projects Completed</div>
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
            className="services-section py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <span
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
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
                  Comprehensive polymer solutions tailored to your specific needs
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div 
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  data-aos="zoom-in"
                  data-aos-delay="100"
                  data-aos-duration="800"
                  data-aos-easing="ease-out-cubic"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
                    Cutting-edge polymer technology solutions for modern manufacturing needs
                  </p>
                </div>

                <div 
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  data-aos="zoom-in"
                  data-aos-delay="200"
                  data-aos-duration="800"
                  data-aos-easing="ease-out-cubic"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
                    Tailored polymer solutions designed specifically for your requirements
                  </p>
                </div>

                <div 
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  data-aos="zoom-in"
                  data-aos-delay="300"
                  data-aos-duration="800"
                  data-aos-easing="ease-out-cubic"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
                    Rigorous quality control processes ensuring the highest standards
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section
            id="stats"
            className="stats-section py-20 lg:py-32 bg-white relative overflow-hidden"
          >
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
                      data-aos="slide-right"
                      data-aos-duration="1000"
                      data-aos-easing="ease-out-cubic"
                    />
                    <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                      <div className="text-3xl font-bold text-blue-600">25+</div>
                      <div className="text-sm text-gray-600">Years of Excellence</div>
                    </div>
                  </div>
                </div>

                <div className="lg:w-1/2">
                  <div className="space-y-8">
                    <div>
                      <span className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
                        Why Choose Us
                      </span>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Far far away Behind the Word Mountains
                      </h2>
                      <p className="text-lg text-gray-600 leading-relaxed mb-6">
                        Far far away, behind the word mountains, far from the
                        countries Vokalia and Consonantia, there live the blind
                        texts. Separated they live in Bookmarksgrove right at the
                        coast of the Semantics, a large language ocean.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div 
                        className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-lg transition-all duration-300"
                        data-aos="slide-up"
                        data-aos-delay="100"
                        data-aos-duration="800"
                        data-aos-easing="ease-out-cubic"
                      >
                        <div className="text-3xl font-bold text-blue-600 mb-2">3,919</div>
                        <div className="text-sm text-gray-600 font-medium">Coffee Cups</div>
                      </div>

                      <div 
                        className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:shadow-lg transition-all duration-300"
                        data-aos="slide-up"
                        data-aos-delay="200"
                        data-aos-duration="800"
                        data-aos-easing="ease-out-cubic"
                      >
                        <div className="text-3xl font-bold text-green-600 mb-2">2,831</div>
                        <div className="text-sm text-gray-600 font-medium">Lines of Code</div>
                      </div>

                      <div 
                        className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-lg transition-all duration-300"
                        data-aos="slide-up"
                        data-aos-delay="300"
                        data-aos-duration="800"
                        data-aos-easing="ease-out-cubic"
                      >
                        <div className="text-3xl font-bold text-purple-600 mb-2">1,914</div>
                        <div className="text-sm text-gray-600 font-medium">Projects</div>
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
            className="blog-section py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <span
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
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
                  Stay updated with the latest insights and innovations in polymer technology
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <article 
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  data-aos="flip-left"
                  data-aos-delay="100"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop"
                      alt="Blog Post"
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      <a href="#" className="hover:underline">
                        There live the blind texts they live
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Far far away, behind the word mountains, far from the
                      countries Vokalia and Consonantia, there live the blind
                      texts.
                    </p>
                    <div className="flex items-center">
                      <Image
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                        alt="Author"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Winston Gold</div>
                        <div className="text-sm text-gray-600">Lead Product Designer</div>
                      </div>
                    </div>
                  </div>
                </article>

                <article 
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  data-aos="flip-left"
                  data-aos-delay="200"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop"
                      alt="Blog Post"
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                      <a href="#" className="hover:underline">
                        There live the blind texts they live
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Far far away, behind the word mountains, far from the
                      countries Vokalia and Consonantia, there live the blind
                      texts.
                    </p>
                    <div className="flex items-center">
                      <Image
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
                        alt="Author"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Sarah Johnson</div>
                        <div className="text-sm text-gray-600">Research Director</div>
                      </div>
                    </div>
                  </div>
                </article>

                <article 
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  data-aos="flip-left"
                  data-aos-delay="300"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"
                      alt="Blog Post"
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                      <a href="#" className="hover:underline">
                        There live the blind texts they live
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Far far away, behind the word mountains, far from the
                      countries Vokalia and Consonantia, there live the blind
                      texts.
                    </p>
                    <div className="flex items-center">
                      <Image
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                        alt="Author"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">Michael Chen</div>
                        <div className="text-sm text-gray-600">Industry Analyst</div>
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
            className="testimonials-section py-20 lg:py-32 bg-white relative"
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <span
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
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
                  Don&apos;t just take our word for it - hear from our satisfied customers
                </p>
              </div>

              <div className="max-w-4xl mx-auto" data-aos="zoom-in" data-aos-duration="1000" data-aos-easing="ease-out-cubic">
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
                    className="testimonials-swiper"
                  >
                    <SwiperSlide>
                      <div className="text-center">
                        <div className="mb-8">
                          <Image
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face"
                            alt="Adam Aderson"
                            width={120}
                            height={120}
                            className="w-24 h-24 rounded-full mx-auto shadow-lg"
                          />
                        </div>
                        <blockquote className="text-xl lg:text-2xl text-gray-700 italic mb-6 leading-relaxed">
                          &ldquo;LANMIC Polymers has consistently delivered exceptional quality and innovative solutions. Their team&apos;s expertise and commitment to excellence have made them our trusted partner for all polymer needs.&rdquo;
                        </blockquote>
                        <div className="text-center">
                          <h4 className="text-xl font-bold text-gray-900 mb-1">Adam Aderson</h4>
                          <p className="text-gray-600">CEO, TechCorp Industries</p>
                        </div>
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className="text-center">
                        <div className="mb-8">
                          <Image
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"
                            alt="Lukas Devlin"
                            width={120}
                            height={120}
                            className="w-24 h-24 rounded-full mx-auto shadow-lg"
                          />
                        </div>
                        <blockquote className="text-xl lg:text-2xl text-gray-700 italic mb-6 leading-relaxed">
                          &ldquo;The level of technical expertise and customer service at LANMIC is unmatched. They&apos;ve helped us achieve remarkable results with their cutting-edge polymer solutions.&rdquo;
                        </blockquote>
                        <div className="text-center">
                          <h4 className="text-xl font-bold text-gray-900 mb-1">Lukas Devlin</h4>
                          <p className="text-gray-600">CTO, Innovation Labs</p>
                        </div>
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className="text-center">
                        <div className="mb-8">
                          <Image
                            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face"
                            alt="Kayla Bryant"
                            width={120}
                            height={120}
                            className="w-24 h-24 rounded-full mx-auto shadow-lg"
                          />
                        </div>
                        <blockquote className="text-xl lg:text-2xl text-gray-700 italic mb-6 leading-relaxed">
                          &ldquo;Working with LANMIC has been a game-changer for our manufacturing process. Their sustainable approach and quality products have exceeded our expectations.&rdquo;
                        </blockquote>
                        <div className="text-center">
                          <h4 className="text-xl font-bold text-gray-900 mb-1">Kayla Bryant</h4>
                          <p className="text-gray-600">Operations Director, GreenTech</p>
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
          <section className="cta-section py-20 lg:py-32 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
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
                  className="text-xl text-blue-100 mb-8 leading-relaxed"
                  data-aos="fade-up"
                  data-aos-delay="100"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  Let&apos;s discuss how LANMIC Polymers can help transform your business with our innovative polymer solutions.
                </p>
                <div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  data-aos="zoom-in"
                  data-aos-delay="200"
                  data-aos-duration="800"
                  data-aos-easing="ease-out-cubic"
                >
                  <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 transform">
                    Contact Us Today
                  </button>
                  <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
                    Request Quote
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
