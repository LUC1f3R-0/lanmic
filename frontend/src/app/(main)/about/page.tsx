"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import AOS from "aos";
import { useTestimonial } from "@/contexts/TestimonialContext";
import { getDisplayImageUrl } from "@/lib/imageUtils";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function About() {
  const { getActiveTestimonials } = useTestimonial();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    // Load active testimonials for public display
    const loadTestimonials = async () => {
      try {
        setTestimonialsLoading(true);
        const testimonialsData = await getActiveTestimonials();
        setTestimonials(testimonialsData);
      } catch (error) {
        console.error('Failed to load testimonials:', error);
        setTestimonials([]);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    loadTestimonials();

    // Set up real-time WebSocket updates for testimonials
    const { websocketService } = require('@/lib/websocket.service');

    const handleTestimonialUpdate = () => {
      loadTestimonials(); // Reload testimonials when updates occur
    };

    // Set up event listeners for real-time updates
    websocketService.on('testimonial-created', handleTestimonialUpdate);
    websocketService.on('testimonial-updated', handleTestimonialUpdate);
    websocketService.on('testimonial-deleted', handleTestimonialUpdate);
    websocketService.on('testimonial-active', handleTestimonialUpdate);

    // Cleanup event listeners on unmount
    return () => {
      websocketService.off('testimonial-created', handleTestimonialUpdate);
      websocketService.off('testimonial-updated', handleTestimonialUpdate);
      websocketService.off('testimonial-deleted', handleTestimonialUpdate);
      websocketService.off('testimonial-active', handleTestimonialUpdate);
    };
  }, [getActiveTestimonials]);

  return (
    <main className="main">

      {/* Company Introduction Section */}
      <section
        id="company-intro"
        className="company-intro-section py-20 lg:py-32 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 max-w-6xl mx-auto">
            <div className="w-full lg:w-1/2 lg:pr-4" data-aos="fade-right">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight text-left">
                Excellence in Polymer Innovation
              </h1>
              <div className="text-lg text-gray-700 leading-relaxed space-y-6 text-left">
                <p>
                  <strong>LANMIC Polymers (Pvt) Ltd</strong> is a part of the esteemed <strong>LANMIC Group</strong>, Sri Lanka&apos;s premier chemicals and minerals conglomerate. Founded in 2020, LANMIC Polymers focuses on producing high-quality filler masterbatches and polymer solutions that uphold the Group&apos;s legacy of excellence in mineral processing and innovation.
                </p>
                <p>
                  With its state-of-the-art facility located in the <strong>Fullerton Industrial Zone, Kalutara</strong>, the company is equipped with modern laboratories and cutting-edge production technology. Being <strong>ISO 9001:2015 certified</strong>, LANMIC Polymers ensures that its products meet stringent quality standards and international norms.
                </p>
                <p>
                  Our flagship offering, <strong>Polymax masterbatch</strong>, exemplifies our commitment to cost-efficiency without compromising performance. Designed to replace virgin polymers, Polymax enhances mechanical properties (such as tensile and impact strength), delivers excellent dispersion, and allows manufacturers to achieve material savings.
                </p>
              </div>
            </div>
            <div
              className="w-full lg:w-1/2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl"
              data-aos="fade-left"
            >
              <Image
                src="/Innovation/DSC05826.jpg"
                alt="LANMIC Polymers production and innovation"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section
        id="vision-mission"
        className="py-20 lg:py-32 bg-gradient-to-br from-white via-slate-50 to-blue-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div data-aos="fade-right">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Vision
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We revolutionize the polymer industry by providing innovative and
                sustainable products to the manufacturing industry.
              </p>
            </div>
            <div data-aos="fade-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Mission
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our mission is to provide high-quality and innovative products
                and services that exceed our customers&apos; expectations. We
                are committed to working with the latest technology and
                improving the communities in which we live and work.
              </p>
            </div>
          </div>

          <div
            className="mt-12 flex justify-center"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            <div className="relative h-32 w-full max-w-md sm:h-40">
              <Image
                src="/company-logo.jfif"
                alt="LANMIC Polymers company logo"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 28rem"
              />
            </div>
          </div>
        </div>
      </section>

      {/* LANMIC Group Values Section */}
      <section
        id="values"
        className="values-section py-20 lg:py-32 bg-white relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-flex items-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
              data-aos="slide-in-left"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L8.5 6.5L4 6.5L7.5 9.5L6 14L10 11.5L14 14L12.5 9.5L16 6.5L11.5 6.5L10 2Z" clipRule="evenodd" />
              </svg>
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
              className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 shadow-lg hover-tilt border-l-4 border-blue-600 group"
              data-aos="zoom-in-rotate"
              data-aos-delay="100"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-all duration-300">
                  <Image
                    src="/Integrity.png"
                    alt="Integrity"
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                    unoptimized
                  />
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
              className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-8 shadow-lg hover-tilt border-l-4 border-green-600 group"
              data-aos="zoom-in-rotate"
              data-aos-delay="200"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-all duration-300">
                  <Image
                    src="/striving_for_Excellence.png"
                    alt="Striving for Excellency"
                    width={40}
                    height={40}
                    className="object-contain p-1"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Striving for Excellency</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  We ensure continuous growth through R&D innovation
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  We create quality customer centric products and solutions
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  We use state of the art technology
                </li>
              </ul>
            </div>

            <div
              className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 shadow-lg hover-tilt border-l-4 border-purple-600 group"
              data-aos="zoom-in-rotate"
              data-aos-delay="300"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-all duration-300">
                  <Image
                    src="/People_Excellence.png"
                    alt="People Excellence"
                    width={40}
                    height={40}
                    className="object-contain p-1"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">People Excellence</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  We recognize top performers
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  We commit to develop overall well-being of our people
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  We ensure happiness of our people
                </li>
              </ul>
            </div>

            <div
              className="bg-gradient-to-br from-white to-teal-50 rounded-2xl p-8 shadow-lg hover-tilt border-l-4 border-teal-600 group"
              data-aos="zoom-in-rotate"
              data-aos-delay="400"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 relative rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-all duration-300">
                  <Image
                    src="/Social_Accountability.png"
                    alt="Social Accountability"
                    width={40}
                    height={40}
                    className="object-contain p-1"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Social Accountability</h3>
              </div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  In everything we do we strive for positive impact
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  We focus on positive impact on people
                </li>
                <li className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  We focus on positive impact on planet
                </li>
              </ul>
            </div>
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
            {testimonialsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No testimonials available at the moment.</p>
              </div>
            ) : (
              <Swiper
                modules={[Autoplay, Pagination]}
                loop={testimonials.length > 1}
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
                {testimonials.map((testimonial) => (
                  <SwiperSlide key={testimonial.id}>
                    <div className="testimonial text-center">
                      <div className="mb-8">
                        {testimonial.image ? (
                          <Image
                            src={getDisplayImageUrl(testimonial.image, 'testimonial-images')}
                            alt={testimonial.name}
                            width={120}
                            height={120}
                            className="w-24 h-24 rounded-full mx-auto shadow-lg object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mx-auto shadow-lg flex items-center justify-center">
                            <svg className="w-12 h-12 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {testimonial.name}
                      </h3>
                      {(testimonial.position || testimonial.company) && (
                        <div className="mb-4">
                          {testimonial.position && (
                            <p className="text-sm text-emerald-600 font-medium">{testimonial.position}</p>
                          )}
                          {testimonial.company && (
                            <p className="text-sm text-gray-600">{testimonial.company}</p>
                          )}
                        </div>
                      )}
                      <blockquote className="text-xl lg:text-2xl text-gray-700 italic mb-6 leading-relaxed">
                        &ldquo;{testimonial.content}&rdquo;
                      </blockquote>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
            <div className="testimonials-pagination mt-8"></div>
          </div>
        </div>
      </section>
    </main>
  );
}
