"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import AOS from "aos";
import { useAuth } from "@/contexts/AuthContext";
import { useBlog } from "@/contexts/BlogContext";
import { useRouter } from "next/navigation";
import { getDisplayImageUrl } from "@/lib/imageUtils";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const HERO_VIDEO_SRC =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL?.trim() ||
  "/video/08_Lanmic_Polymers_Video.mp4";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { getPublishedPosts } = useBlog();
  const router = useRouter();
  const [publishedPosts, setPublishedPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  const playHeroVideo = useCallback(() => {
    const el = heroVideoRef.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    const p = el.play();
    if (p !== undefined) {
      p.catch(() => {
        /* autoplay blocked — browser policy */
      });
    }
  }, []);

  useEffect(() => {
    const loadPublishedPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const posts = await getPublishedPosts();
        setPublishedPosts(posts);
      } catch (error) {
        console.error('Error loading published posts:', error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    loadPublishedPosts();
  }, [getPublishedPosts]);

  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => playHeroVideo());
  }, [playHeroVideo]);

  // Note: Removed automatic redirect to dashboard
  // Users can now visit the homepage even when authenticated
  // They can access dashboard through the header navigation or direct URL

  return (
    <main className="main">
      {/* Hero Section */}
      <section className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero background: single full-screen video */}
        <div className="absolute inset-0 z-0">
          <div className="relative h-full w-full min-h-screen">
            <video
              ref={heroVideoRef}
              className="absolute inset-0 h-full w-full object-cover object-center blur-sm opacity-100 scale-[1.06]"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              controls={false}
              onLoadedData={playHeroVideo}
              onCanPlay={playHeroVideo}
            >
              <source src={HERO_VIDEO_SRC} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40 z-10"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Enhanced Floating Logo */}
            <div 
              className="mb-8 flex justify-center"
              data-aos="zoom-in-rotate"
              data-aos-duration="1200"
              data-aos-easing="ease-out-cubic"
              data-large-logo
            >
              <div className="relative group">
                <Image
                  src="/LMC_LFO_LOGO.png"
                  alt="LANMIC Polymers Logo"
                  width={120}
                  height={120}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain hover-tilt transition-all duration-700 group-hover:scale-110 drop-shadow-2xl"
                  style={{ width: 'auto', height: 'auto' }}
                  priority
                />
              </div>
            </div>
            
            <h1
              className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-10 leading-tight drop-shadow-lg"
              data-aos="text-reveal"
              data-aos-delay="200"
              data-aos-duration="1200"
              data-aos-easing="ease-out-cubic"
            >
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#627d28] to-[#ae9f35] [-webkit-text-stroke:1.5px_white] sm:[-webkit-text-stroke:2px_white] [paint-order:stroke_fill]"
              >
                Welcome to LANMIC Polymers
              </span>
            </h1>
            
            <p
              className="text-lg sm:text-xl lg:text-2xl text-white mb-8 leading-relaxed max-w-3xl mx-auto drop-shadow-md font-medium"
              data-aos="fade-up"
              data-aos-delay="400"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              Your trusted partner in innovative polymer solutions. We
              deliver excellence through cutting-edge technology and
              sustainable practices.
            </p>
            
            <div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              data-aos="zoom-in-rotate"
              data-aos-delay="600"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <button 
                onClick={() => router.push('/contact')}
                className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg text-white hover-glow-intense hover-slide relative overflow-hidden group"
              >
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">Get Started</span>
              </button>
              <button 
                onClick={() => router.push('/about')}
                className="btn-outline px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-600 text-blue-600 relative overflow-hidden group"
              >
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">Learn More</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="about-section py-20 lg:py-32 bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden"
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
                  className="rounded-lg overflow-hidden shadow-lg w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px]"
                >
                  <SwiperSlide>
                    <div className="relative w-full h-full bg-primary-500 flex items-center justify-center">
                      <Image
                        src="/Innovation/DSC05792.jpg"
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
                      <div className="absolute inset-0 bg-primary-500/30 flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <h3 className="text-2xl font-bold mb-2">Manufacturing Excellence</h3>
                          <p className="text-lg">Advanced production processes</p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="relative w-full h-full bg-secondary-500 flex items-center justify-center">
                      <Image
                        src="/Innovation/DSC05826.jpg"
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
                      <div className="absolute inset-0 bg-secondary-500/30 flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <h3 className="text-2xl font-bold mb-2">Quality Assurance</h3>
                          <p className="text-lg">Rigorous testing standards</p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="relative w-full h-full bg-accent-sage flex items-center justify-center">
                      <Image
                        src="/Twin screw excluder machine.png"
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
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                        <div className="text-center text-white p-6">
                          <h3 className="text-2xl font-bold mb-2">Leading Innovation</h3>
                          <p className="text-lg">Twin screw extrusion and advanced polymer processing</p>
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
                
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary leading-tight"
                  data-aos="fade-up"
                  data-aos-delay="100"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  Leading Innovation in Polymer Technology
                </h2>
                <p
                  className="text-lg text-text-secondary leading-relaxed"
                  data-aos="fade-up"
                  data-aos-delay="200"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  At LANMIC Polymers, we specialize in developing cutting-edge polymer solutions 
                  that drive innovation across industries. Our commitment to quality, sustainability, 
                  and technological advancement has made us a trusted partner for businesses worldwide.
                </p>
                <div 
                  className="text-sm text-text-muted mb-6"
                  data-aos="fade-up"
                  data-aos-delay="300"
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  <span className="inline-block mr-4">Founded - 2020</span>
                  <span className="inline-block mr-4">Email - info@lanmic.com</span>
                  <span className="inline-block">Headquarters – Colombo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="services-section py-20 lg:py-32 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              What We Offer
            </h2>
            <p
              className="text-lg text-text-secondary max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Comprehensive polymer solutions tailored to your specific
              needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl p-8 hover-tilt border border-blue-200 shadow-lg"
              data-aos="zoom-in-rotate"
              data-aos-delay="100"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 hover-rotate">
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
              <h3 className="text-xl font-bold text-text-primary mb-4 group-hover:text-primary-500 transition-colors duration-300">
                Calcium Carbonate Filler Masterbatch
              </h3>
              <p className="text-text-secondary leading-relaxed">
                High-quality calcium carbonate filler masterbatches that enhance 
                mechanical properties and reduce production costs while maintaining 
                excellent surface finish and dimensional stability.
              </p>
            </div>

            <div
              className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl p-8 hover-tilt border border-purple-200 shadow-lg"
              data-aos="zoom-in-rotate"
              data-aos-delay="200"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 hover-rotate">
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
              <h3 className="text-xl font-bold text-text-primary mb-4 group-hover:text-secondary-500 transition-colors duration-300">
                White Masterbatch
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Premium white masterbatches with excellent opacity, brightness, 
                and color consistency. Perfect for applications requiring superior 
                whiteness and UV resistance in various polymer matrices.
              </p>
            </div>

            <div
              className="group bg-gradient-to-br from-white to-green-50 rounded-2xl p-8 hover-tilt border border-green-200 shadow-lg"
              data-aos="zoom-in-rotate"
              data-aos-delay="300"
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 hover-rotate">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-4 group-hover:text-accent-sage transition-colors duration-300">
                Additives Masterbatch
              </h3>
              <p className="text-text-secondary leading-relaxed">
                Specialized additive masterbatches including UV stabilizers, 
                antioxidants, flame retardants, and processing aids. Customized 
                solutions to enhance polymer performance and meet specific 
                application requirements.
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
              <div
                className="relative w-full aspect-[6/5] max-w-xl mx-auto rounded-2xl overflow-hidden shadow-2xl"
                data-aos="slide-right"
                data-aos-duration="1000"
                data-aos-easing="ease-out-cubic"
              >
                <Image
                  src="/Twin screw excluder machine.png"
                  alt="Twin screw extruder"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
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
                      1000+
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Customers
                    </div>
                  </div>

                  <div
                    className="text-center p-6 bg-gradient-to-br from-violet-50 to-purple-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-violet-200"
                    data-aos="slide-up"
                    data-aos-delay="200"
                    data-aos-duration="800"
                    data-aos-easing="ease-out-cubic"
                  >
                    <div className="text-3xl font-bold text-violet-600 mb-2">
                      30+
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Products
                    </div>
                  </div>

                  <div
                    className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-emerald-200"
                    data-aos="slide-up"
                    data-aos-delay="300"
                    data-aos-duration="800"
                    data-aos-easing="ease-out-cubic"
                  >
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      ISO
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Certified
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
            {isLoadingPosts ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading blog posts...</p>
              </div>
            ) : publishedPosts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blog Posts Yet</h3>
                <p className="text-gray-600">Check back soon for the latest insights and innovations in polymer technology.</p>
              </div>
            ) : (
              publishedPosts.slice(0, 3).map((post, index) => (
                <article
                  key={post.id}
                  className="group bg-gradient-to-br from-white to-amber-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-amber-100"
                  data-aos="flip-left"
                  data-aos-delay={`${(index + 1) * 100}`}
                  data-aos-duration="1000"
                  data-aos-easing="ease-out-cubic"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={getDisplayImageUrl(post.blogImage)}
                      alt={post.title}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.category === 'Technology' ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' :
                        post.category === 'Innovation' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' :
                        post.category === 'Industry' ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' :
                        'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      }`}>
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.readTime && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{post.readTime}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors duration-300">
                      <a href="#" className="hover:underline">
                        {post.title}
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {post.description}
                    </p>
                    <div className="flex items-center">
                      <Image
                        src={getDisplayImageUrl(post.authorImage, 'author')}
                        alt={post.authorName}
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
                          {post.authorName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {post.authorPosition}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="cta-section py-20 lg:py-32 bg-primary-500 relative overflow-hidden">
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
              className="text-xl text-white/90 mb-8 leading-relaxed"
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
              <button
                type="button"
                onClick={() => router.push("/contact")}
                className="bg-white text-primary-500 px-8 py-4 rounded-md font-semibold text-lg hover:bg-gray-100 transition-all duration-300"
              >
                Contact Us Today
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
