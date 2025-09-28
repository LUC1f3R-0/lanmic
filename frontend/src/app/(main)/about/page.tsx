"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import AOS from "aos";
import { useTeam } from "@/contexts/TeamContext";
import { getDisplayImageUrl } from "@/lib/imageUtils";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function About() {
  const { getActiveTeamMembers } = useTeam();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    // Load active team members for public display
    const loadTeamMembers = async () => {
      try {
        setIsLoading(true);
        const members = await getActiveTeamMembers();
        setTeamMembers(members);
      } catch (error) {
        console.error('Failed to load team members:', error);
        setTeamMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamMembers();
  }, [getActiveTeamMembers]);

  return (
    <main className="main">

      {/* LANMIC Group Values Section */}
      <section
        id="values"
        className="values-section py-20 lg:py-32 bg-gray-100"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
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
        className="services-section py-20 lg:py-32 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="services-item bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200"
              data-aos="zoom-in"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="services-icon w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
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
              className="services-item bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200"
              data-aos="zoom-in"
              data-aos-delay="100"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="services-icon w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
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
              className="services-item bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200"
              data-aos="zoom-in"
              data-aos-delay="200"
              data-aos-duration="800"
              data-aos-easing="ease-out-cubic"
            >
              <div className="services-icon w-16 h-16 bg-gray-600 rounded-2xl flex items-center justify-center mb-6">
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
              {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No team members available at the moment.</p>
              </div>
            ) : (
              <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                loop={teamMembers.length > 3}
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
                {teamMembers.map((member) => (
                  <SwiperSlide key={member.id}>
                    <div className="group relative bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-blue-100 overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full translate-y-12 -translate-x-12"></div>
                      </div>
                      
                      {/* Image Container with Enhanced Styling */}
                      <div className="relative mb-8">
                        <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          {member.image ? (
                            <Image
                              src={getDisplayImageUrl(member.image, 'team-images')}
                              alt={member.name}
                              width={300}
                              height={300}
                              className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-72 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        
                        {/* Floating Badge */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg">
                            Expert
                          </div>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {member.name.split(' ')[0]}
                          </span> {member.name.split(' ').slice(1).join(' ')}
                        </h3>
                        
                        <div className="mb-4">
                          <span className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                            {member.position}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 leading-relaxed text-sm line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">
                          {member.description}
                        </p>
                        
                        {/* Social Links Placeholder */}
                        <div className="mt-6 flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors duration-200">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                            </svg>
                          </div>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors duration-200">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </div>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors duration-200">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

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
