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
          {/* About Section */}
          <section id="about" className="about section py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div
                  className="lg:w-7/12 mb-5 lg:mb-0 order-2 lg:order-1"
                  data-aos="fade-up"
                  data-aos-delay="400"
                >
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    loop={true}
                    speed={600}
                    autoplay={{
                      delay: 5000,
                      disableOnInteraction: false,
                    }}
                    slidesPerView="auto"
                    pagination={{
                      clickable: true,
                      el: ".swiper-pagination",
                    }}
                    breakpoints={{
                      320: {
                        slidesPerView: 1,
                        spaceBetween: 40,
                      },
                      1200: {
                        slidesPerView: 1,
                        spaceBetween: 1,
                      },
                    }}
                    className="init-swiper"
                  >
                    <SwiperSlide>
                      <Image
                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
                        alt="Image"
                        width={600}
                        height={400}
                        className="img-fluid"
                      />
                    </SwiperSlide>
                    <SwiperSlide>
                      <Image
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
                        alt="Image"
                        width={600}
                        height={400}
                        className="img-fluid"
                      />
                    </SwiperSlide>
                    <SwiperSlide>
                      <Image
                        src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop"
                        alt="Image"
                        width={600}
                        height={400}
                        className="img-fluid"
                      />
                    </SwiperSlide>
                    <div className="swiper-pagination"></div>
                  </Swiper>
                </div>
                <div className="lg:w-4/12 order-1 lg:order-2">
                  <span
                    className="section-subtitle text-blue-600 font-semibold text-sm uppercase tracking-wide mb-4 block"
                    data-aos="fade-up"
                  >
                    Welcome
                  </span>
                  <h1
                    className="mb-4 text-4xl lg:text-5xl font-bold text-gray-900"
                    data-aos="fade-up"
                  >
                    Excepteur sint occaecat cupidatat non proident
                  </h1>
                  <p
                    data-aos="fade-up"
                    className="text-lg text-gray-600 leading-relaxed"
                  >
                    Far far away, behind the word mountains, far from the
                    countries Vokalia and Consonantia, there live the blind
                    texts. Separated they live in Bookmarksgrove right at the
                    coast of the Semantics, a large language ocean.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section
            id="services"
            className="services section light-background py-16 bg-gray-50"
          >
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="services-item" data-aos="fade-up">
                  <div className="services-icon w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Technology
                    </h3>
                    <p className="text-gray-600">
                      Separated they live in Bookmarksgrove right at the coast
                    </p>
                  </div>
                </div>

                <div
                  className="services-item"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <div className="services-icon w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Web Design
                    </h3>
                    <p className="text-gray-600">
                      Separated they live in Bookmarksgrove right at the coast
                    </p>
                  </div>
                </div>

                <div
                  className="services-item"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <div className="services-icon w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Branding
                    </h3>
                    <p className="text-gray-600">
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
            className="stats section light-background py-16 bg-white"
          >
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-5/12">
                  <div className="images-overlap">
                    <Image
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=400&fit=crop"
                      alt="student"
                      width={500}
                      height={400}
                      className="img-fluid img-1 rounded-lg shadow-lg"
                      data-aos="fade-up"
                    />
                  </div>
                </div>

                <div className="lg:w-7/12 lg:pl-8">
                  <span className="content-subtitle text-blue-600 font-semibold text-sm uppercase tracking-wide mb-4 block">
                    Why Us
                  </span>
                  <h2 className="content-title text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                    Far far away Behind the Word Mountains
                  </h2>
                  <p className="lead text-lg text-gray-600 mb-4">
                    Far far away, behind the word mountains, far from the
                    countries Vokalia and Consonantia.
                  </p>
                  <p className="mb-8 text-gray-600">
                    There live the blind texts. Separated they live in
                    Bookmarksgrove right at the coast of the Semantics, a large
                    language ocean.
                  </p>
                  <div className="grid grid-cols-3 gap-6 count-numbers">
                    <div
                      className="counter text-center"
                      data-aos="fade-up"
                      data-aos-delay="100"
                    >
                      <span
                        className="purecounter number text-3xl font-bold text-blue-600 mb-2 block"
                        data-purecounter-start="0"
                        data-purecounter-end="3919"
                        data-purecounter-duration="1"
                      >
                        3,919
                      </span>
                      <span className="d-block text-gray-600">Coffee</span>
                    </div>

                    <div
                      className="counter text-center"
                      data-aos="fade-up"
                      data-aos-delay="200"
                    >
                      <span
                        className="purecounter number text-3xl font-bold text-blue-600 mb-2 block"
                        data-purecounter-start="0"
                        data-purecounter-end="2831"
                        data-purecounter-duration="1"
                      >
                        2,831
                      </span>
                      <span className="d-block text-gray-600">Codes</span>
                    </div>

                    <div
                      className="counter text-center"
                      data-aos="fade-up"
                      data-aos-delay="300"
                    >
                      <span
                        className="purecounter number text-3xl font-bold text-blue-600 mb-2 block"
                        data-purecounter-start="0"
                        data-purecounter-end="1914"
                        data-purecounter-duration="1"
                      >
                        1,914
                      </span>
                      <span className="d-block text-gray-600">Projects</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Blog Posts Section */}
          <section
            id="blog-posts"
            className="blog-posts section py-16 bg-gray-50"
          >
            {/* Section Title */}
            <div
              className="container mx-auto px-4 text-center mb-12"
              data-aos="fade-up"
            >
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
                Recent Posts
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Blog Posts
              </h2>
            </div>
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div
                  className="post-entry"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <a href="#" className="thumb d-block">
                    <Image
                      src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop"
                      alt="Image"
                      width={400}
                      height={250}
                      className="img-fluid rounded w-full"
                    />
                  </a>

                  <div className="post-content p-6 bg-white rounded-lg shadow-md">
                    <div className="meta flex items-center text-sm text-gray-500 mb-3">
                      <a
                        href="#"
                        className="cat bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        Development
                      </a>
                      <span className="mx-2">•</span>
                      <span className="date">July 20, 2020</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      <a href="#" className="hover:text-blue-600">
                        There live the blind texts they live
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Far far away, behind the word mountains, far from the
                      countries Vokalia and Consonantia, there live the blind
                      texts.
                    </p>

                    <div className="flex author items-center">
                      <div className="pic mr-3">
                        <Image
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                          alt="Image"
                          width={40}
                          height={40}
                          className="img-fluid rounded-circle"
                        />
                      </div>
                      <div className="author-name">
                        <strong className="d-block text-gray-900">
                          Winston Gold
                        </strong>
                        <span className="text-sm text-gray-600">
                          Lead Product Designer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="post-entry"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <a href="#" className="thumb d-block">
                    <Image
                      src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop"
                      alt="Image"
                      width={400}
                      height={250}
                      className="img-fluid rounded w-full"
                    />
                  </a>

                  <div className="post-content p-6 bg-white rounded-lg shadow-md">
                    <div className="meta flex items-center text-sm text-gray-500 mb-3">
                      <a
                        href="#"
                        className="cat bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        Development
                      </a>
                      <span className="mx-2">•</span>
                      <span className="date">July 20, 2020</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      <a href="#" className="hover:text-blue-600">
                        There live the blind texts they live
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Far far away, behind the word mountains, far from the
                      countries Vokalia and Consonantia, there live the blind
                      texts.
                    </p>

                    <div className="flex author items-center">
                      <div className="pic mr-3">
                        <Image
                          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face"
                          alt="Image"
                          width={40}
                          height={40}
                          className="img-fluid rounded-circle"
                        />
                      </div>
                      <div className="author-name">
                        <strong className="d-block text-gray-900">
                          Winston Gold
                        </strong>
                        <span className="text-sm text-gray-600">
                          Lead Product Designer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="post-entry"
                  data-aos="fade-up"
                  data-aos-delay="300"
                >
                  <a href="#" className="thumb d-block">
                    <Image
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"
                      alt="Image"
                      width={400}
                      height={250}
                      className="img-fluid rounded w-full"
                    />
                  </a>

                  <div className="post-content p-6 bg-white rounded-lg shadow-md">
                    <div className="meta flex items-center text-sm text-gray-500 mb-3">
                      <a
                        href="#"
                        className="cat bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        Development
                      </a>
                      <span className="mx-2">•</span>
                      <span className="date">July 20, 2020</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      <a href="#" className="hover:text-blue-600">
                        There live the blind texts they live
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Far far away, behind the word mountains, far from the
                      countries Vokalia and Consonantia, there live the blind
                      texts.
                    </p>

                    <div className="flex author items-center">
                      <div className="pic mr-3">
                        <Image
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                          alt="Image"
                          width={40}
                          height={40}
                          className="img-fluid rounded-circle"
                        />
                      </div>
                      <div className="author-name">
                        <strong className="d-block text-gray-900">
                          Winston Gold
                        </strong>
                        <span className="text-sm text-gray-600">
                          Lead Product Designer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section
            id="testimonials"
            className="testimonials section py-16 bg-white"
          >
            {/* Section Title */}
            <div
              className="container mx-auto px-4 text-center mb-12"
              data-aos="fade-up"
            >
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
                Happy Customers
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Testimonials
              </h2>
            </div>

            <div className="container mx-auto px-4" data-aos="fade-up">
              <div className="flex justify-center">
                <div className="lg:w-7/12 pb-20">
                  <div className="relative">
                    <Swiper
                      modules={[Autoplay, Pagination]}
                      loop={true}
                      speed={600}
                      autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                      }}
                      slidesPerView="auto"
                      pagination={{
                        clickable: true,
                        el: ".testimonials-pagination",
                      }}
                      breakpoints={{
                        320: {
                          slidesPerView: 1,
                          spaceBetween: 40,
                        },
                        1200: {
                          slidesPerView: 1,
                          spaceBetween: 1,
                        },
                      }}
                      className="init-swiper"
                    >
                      <SwiperSlide>
                        <div className="testimonial mx-auto text-center">
                          <figure className="img-wrap mb-4">
                            <Image
                              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face"
                              alt="Image"
                              width={120}
                              height={120}
                              className="img-fluid rounded-full mx-auto"
                            />
                          </figure>
                          <h3 className="name text-xl font-bold text-gray-900 mb-3">
                            Adam Aderson
                          </h3>
                          <blockquote>
                            <p className="text-gray-600 italic">
                              &ldquo;There live the blind texts. Separated they
                              live in Bookmarksgrove right at the coast of the
                              Semantics, a large language ocean.&rdquo;
                            </p>
                          </blockquote>
                        </div>
                      </SwiperSlide>
                      <SwiperSlide>
                        <div className="testimonial mx-auto text-center">
                          <figure className="img-wrap mb-4">
                            <Image
                              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face"
                              alt="Image"
                              width={120}
                              height={120}
                              className="img-fluid rounded-full mx-auto"
                            />
                          </figure>
                          <h3 className="name text-xl font-bold text-gray-900 mb-3">
                            Lukas Devlin
                          </h3>
                          <blockquote>
                            <p className="text-gray-600 italic">
                              &ldquo;There live the blind texts. Separated they
                              live in Bookmarksgrove right at the coast of the
                              Semantics, a large language ocean.&rdquo;
                            </p>
                          </blockquote>
                        </div>
                      </SwiperSlide>
                      <SwiperSlide>
                        <div className="testimonial mx-auto text-center">
                          <figure className="img-wrap mb-4">
                            <Image
                              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face"
                              alt="Image"
                              width={120}
                              height={120}
                              className="img-fluid rounded-full mx-auto"
                            />
                          </figure>
                          <h3 className="name text-xl font-bold text-gray-900 mb-3">
                            Kayla Bryant
                          </h3>
                          <blockquote>
                            <p className="text-gray-600 italic">
                              &ldquo;There live the blind texts. Separated they
                              live in Bookmarksgrove right at the coast of the
                              Semantics, a large language ocean.&rdquo;
                            </p>
                          </blockquote>
                        </div>
                      </SwiperSlide>
                    </Swiper>
                    <div className="testimonials-pagination mt-8"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
