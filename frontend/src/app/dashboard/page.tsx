"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout, sendVerificationEmail } = useAuth();
  const router = useRouter();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Handle sending verification email
  const handleSendVerificationEmail = async () => {
    if (!user?.email) {
      // No user email available
      return;
    }
    
    try {
      setIsSendingEmail(true);
      setEmailSent(false);
      await sendVerificationEmail(user.email);
      setEmailSent(true);
    } catch (error) {
      // Failed to send verification email
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  // Use auth redirect hook to handle authentication failures
  useAuthRedirect();

  // Redirect if not authenticated - CRITICAL SECURITY CHECK
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isLoading && !isAuthenticated) {
        // User not authenticated, redirecting to admin
        router.push('/admin');
      }
    };

    verifyAuth();
  }, [isAuthenticated, isLoading, router]);

  // Additional check: If user becomes null while on dashboard, redirect immediately
  useEffect(() => {
    if (user === null && !isLoading) {
      // User became null, redirecting to admin
      router.push('/admin');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/admin');
    } catch (error) {
      // Logout failed
    }
  };

  const handleNavigateToBlogs = () => {
    router.push('/dashboard/blogs');
  };

  const handleNavigateToSettings = () => {
    router.push('/dashboard/settings');
  };

  const handleNavigateToTeam = () => {
    router.push('/dashboard/team');
  };

  const handleNavigateToExecutive = () => {
    router.push('/dashboard/executive');
  };

  const handleNavigateToTestimonials = () => {
    router.push('/dashboard/testimonials');
  };


  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Image
                src="/lanmic_logo.png"
                alt="LANMIC Polymers Logo"
                width={60}
                height={60}
                className="w-15 h-15 object-contain mr-3"
                style={{ width: 'auto', height: 'auto' }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
                <p className="text-sm text-gray-500">Content Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Email Verification Status */}
              {user?.isVerified ? (
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verified
                </div>
              ) : (
                <button
                  onClick={handleSendVerificationEmail}
                  disabled={isSendingEmail}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  {isSendingEmail ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Verify Email
                    </>
                  )}
                </button>
              )}
              
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username || user?.email}</p>
                <p className="text-xs text-gray-500">Admin User</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Email Verification Notice */}
        {!user?.isVerified && (
          <div className={`border rounded-xl p-6 mb-8 ${
            emailSent 
              ? 'bg-green-50 border-green-200' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${
                emailSent ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {emailSent ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                {emailSent ? (
                  <>
                    <h3 className="text-lg font-semibold text-green-900 mb-1">Verification Email Sent!</h3>
                    <p className="text-green-700 mb-3">
                      We've sent a verification link to your email address. Please check your inbox and click the link to verify your email. You'll be redirected to the dashboard once verified.
                    </p>
                    <button
                      onClick={handleSendVerificationEmail}
                      disabled={isSendingEmail}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                    >
                      {isSendingEmail ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Resend Email
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-orange-900 mb-1">Email Verification Required</h3>
                    <p className="text-orange-700 mb-3">
                      Please verify your email address to access the dashboard features. Click the "Verify Email" button above to get started.
                    </p>
                    <button
                      onClick={handleSendVerificationEmail}
                      disabled={isSendingEmail}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                    >
                      {isSendingEmail ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Verify Email Now
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Cards - Only show if verified */}
        {user?.isVerified && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Blog Management Card */}
            <div 
              onClick={handleNavigateToBlogs}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog Management</h3>
              <p className="text-gray-600 text-sm mb-4">
                Create, edit, and manage your blog posts. Upload images, set categories, and control publishing.
              </p>
              <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                <span>Manage Blogs</span>
                <svg className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Team Management Card */}
            <div 
              onClick={handleNavigateToTeam}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 group-hover:bg-purple-200 transition-colors duration-200">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Management</h3>
              <p className="text-gray-600 text-sm mb-4">
                Manage your team members. Add, edit, delete, and control visibility of team members on the about page.
              </p>
              <div className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700">
                <span>Manage Team</span>
                <svg className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Executive Leadership Management Card */}
            <div 
              onClick={handleNavigateToExecutive}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4 group-hover:bg-indigo-200 transition-colors duration-200">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Executive Leadership</h3>
              <p className="text-gray-600 text-sm mb-4">
                Manage executive leadership profiles. Add, edit, and control visibility of executive team members with social media links.
              </p>
              <div className="flex items-center text-indigo-600 text-sm font-medium group-hover:text-indigo-700">
                <span>Manage Executives</span>
                <svg className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Testimonials Management Card */}
            <div 
              onClick={handleNavigateToTestimonials}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg mb-4 group-hover:bg-emerald-200 transition-colors duration-200">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Testimonials</h3>
              <p className="text-gray-600 text-sm mb-4">
                Manage customer testimonials and reviews. Add, edit, and control visibility of customer feedback with optional images.
              </p>
              <div className="flex items-center text-emerald-600 text-sm font-medium group-hover:text-emerald-700">
                <span>Manage Testimonials</span>
                <svg className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* User Settings Card */}
            <div 
              onClick={handleNavigateToSettings}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 group-hover:bg-green-200 transition-colors duration-200">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Settings</h3>
              <p className="text-gray-600 text-sm mb-4">
                Update your profile information, change email address, and manage your account settings.
              </p>
              <div className="flex items-center text-green-600 text-sm font-medium group-hover:text-green-700">
                <span>Manage Settings</span>
                <svg className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}