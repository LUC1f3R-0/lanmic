"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import AOS from "aos";
import { useExecutive } from "@/contexts/ExecutiveContext";
import { getDisplayImageUrl } from "@/lib/imageUtils";

export default function Team() {
  const { getActiveExecutiveLeadership, isWebSocketConnected } = useExecutive();
  const [activeExecutives, setActiveExecutives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    // Load active executive leadership
    loadActiveExecutives();
  }, []);

  // Listen for real-time updates from WebSocket
  useEffect(() => {
    const { websocketService } = require('@/lib/websocket.service');
    
    // Connect to WebSocket if not already connected
    const initializeWebSocket = async () => {
      try {
        if (!websocketService.isWebSocketConnected()) {
          await websocketService.connect();
        }
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };

    // Listen for executive leadership updates
    const handleExecutiveUpdate = () => {
      loadActiveExecutives(); // Reload data when updates occur
    };

    // Initialize WebSocket connection
    initializeWebSocket();

    // Set up event listeners for real-time updates
    websocketService.on('executive-leadership-created', handleExecutiveUpdate);
    websocketService.on('executive-leadership-updated', handleExecutiveUpdate);
    websocketService.on('executive-leadership-deleted', handleExecutiveUpdate);
    websocketService.on('executive-leadership-active', handleExecutiveUpdate);

    // Cleanup event listeners on unmount
    return () => {
      websocketService.off('executive-leadership-created', handleExecutiveUpdate);
      websocketService.off('executive-leadership-updated', handleExecutiveUpdate);
      websocketService.off('executive-leadership-deleted', handleExecutiveUpdate);
      websocketService.off('executive-leadership-active', handleExecutiveUpdate);
    };
  }, []);

  const loadActiveExecutives = async () => {
    try {
      setIsLoading(true);
      const executives = await getActiveExecutiveLeadership();
      // Sort by displayOrder
      const sortedExecutives = executives.sort((a, b) => a.displayOrder - b.displayOrder);
      console.log('Loaded executives:', sortedExecutives); // Debug log
      setActiveExecutives(sortedExecutives);
    } catch (error) {
      console.error('Failed to load executive leadership:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="main">
      {/* Hero Section */}
      <section className="hero-section py-20 lg:py-32 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full morphing"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-pink-400 to-rose-500 rounded-full morphing" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full wave"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 hover-glow-intense glass-effect"
              data-aos="slide-in-left"
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
              <span className="gradient-text text-transparent bg-clip-text">
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
      <section className="leadership-section py-20 lg:py-32 bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 right-0 w-72 h-72 bg-gradient-to-l from-blue-400 to-indigo-500 rounded-full morphing"></div>
          <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full morphing" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full wave"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 hover-glow-intense glass-effect"
              data-aos="slide-in-right"
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

          {/* Real-time connection status indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-xs font-medium ${isWebSocketConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isWebSocketConnected ? 'Live Updates Active' : 'Live Updates Disconnected'}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : activeExecutives.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No executive leadership information available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {activeExecutives.map((executive, index) => {
                const colors = [
                  'from-white to-cyan-50 border-cyan-200',
                  'from-white to-emerald-50 border-emerald-200',
                  'from-white to-violet-50 border-violet-200',
                  'from-white to-orange-50 border-orange-200',
                  'from-white to-pink-50 border-pink-200',
                  'from-white to-indigo-50 border-indigo-200'
                ];
                const colorClass = colors[index % colors.length];
                
                return (
                  <div
                    key={executive.id}
                    className={`group bg-gradient-to-br ${colorClass} rounded-2xl p-8 shadow-lg hover-tilt border glass-effect`}
                    data-aos="zoom-in-rotate"
                    data-aos-delay={`${(index + 1) * 100}`}
                    data-aos-duration="1000"
                    data-aos-easing="ease-out-cubic"
                  >
                    <div className="relative mb-6">
                      <Image
                        src={getDisplayImageUrl(executive.image, 'executive')}
                        alt={executive.name}
                        width={400}
                        height={400}
                        className="w-full h-80 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.log('Image failed to load:', target.src, 'for executive:', executive.name);
                          target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully for:', executive.name, 'URL:', getDisplayImageUrl(executive.image, 'executive'));
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        <span className="text-blue-600">{executive.name}</span>
                      </h3>
                      <p className="text-gray-600 mb-4">{executive.position}</p>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {executive.description}
                      </p>
                      <div className="flex justify-center space-x-4">
                        {executive.linkedinUrl && (
                          <a
                            href={executive.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
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
                        )}
                        {executive.twitterUrl && (
                          <a
                            href={executive.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-600 transition-colors duration-300"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Our Team Section */}
      <section className="our-team-section py-20 lg:py-32 bg-gray-100 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4"
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
      <section className="stats-section py-20 lg:py-32 bg-white relative">
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
      <section className="join-team-section py-20 lg:py-32 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
              data-aos="fade-up"
            >
              Join Our Team
            </h2>
              <p
                className="text-xl text-blue-100 mb-8 leading-relaxed"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                Be part of our innovative team and help shape the future of
                polymer technology
              </p>
            <div
              className="flex justify-center"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
                Contact HR
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
