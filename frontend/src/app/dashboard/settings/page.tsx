"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { apiService } from '@/lib/api';

interface EmailChangeStep {
  step: 'current-email' | 'new-email' | 'password-confirmation' | 'completed';
  currentEmailVerified: boolean;
  newEmailVerified: boolean;
  newEmail: string;
}

export default function UserSettingsPage() {
  const { user, isAuthenticated, isLoading, checkAuthStatus, logout, changePassword } = useAuth();
  const router = useRouter();
  
  const [emailChangeStep, setEmailChangeStep] = useState<EmailChangeStep>({
    step: 'current-email',
    currentEmailVerified: false,
    newEmailVerified: false,
    newEmail: '',
  });
  
  const [currentEmailOtp, setCurrentEmailOtp] = useState('');
  const [newEmailAddress, setNewEmailAddress] = useState('');
  const [newEmailOtp, setNewEmailOtp] = useState('');
  const [password, setPassword] = useState('');
  const [emailChangeNewPassword, setEmailChangeNewPassword] = useState('');
  
  // Store new password in localStorage in real-time
  const handleNewPasswordChange = (value: string) => {
    setEmailChangeNewPassword(value);
    // Store in localStorage in real-time
    if (value.trim() !== '') {
      localStorage.setItem('pendingNewPassword', value);
    } else {
      localStorage.removeItem('pendingNewPassword');
    }
  };

  // Store new email in localStorage in real-time
  const handleNewEmailChange = (value: string) => {
    setNewEmailAddress(value);
    // Store in localStorage in real-time
    if (value.trim() !== '') {
      localStorage.setItem('pendingNewEmail', value);
    } else {
      localStorage.removeItem('pendingNewEmail');
    }
  };
  
  // Load from localStorage on component mount
  useEffect(() => {
    const storedNewEmail = localStorage.getItem('pendingNewEmail');
    const storedNewPassword = localStorage.getItem('pendingNewPassword');
    
    if (storedNewEmail) {
      setNewEmailAddress(storedNewEmail);
    }
    if (storedNewPassword) {
      setEmailChangeNewPassword(storedNewPassword);
    }
  }, []);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswordChangeForm, setShowPasswordChangeForm] = useState(false);
  
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Use auth redirect hook to handle authentication failures
  useAuthRedirect();

  // Redirect if not authenticated or not verified
  useEffect(() => {
    const verifyAuth = async () => {
      if (!isLoading && (!isAuthenticated || !user?.isVerified)) {
        router.push('/dashboard');
      }
    };

    verifyAuth();
  }, [isAuthenticated, isLoading, user?.isVerified, router]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleSendCurrentEmailOtp = async () => {
    try {
      setIsLoadingAction(true);
      setError('');
      
      const response = await apiService.sendCurrentEmailOtp();
      setSuccess(response.message);
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleVerifyCurrentEmailOtp = async () => {
    try {
      setIsLoadingAction(true);
      setError('');
      
      const response = await apiService.verifyCurrentEmailOtp(currentEmailOtp);
      
      setEmailChangeStep(prev => ({
        ...prev,
        step: 'new-email',
        currentEmailVerified: true,
      }));
      setSuccess(response.message);
    } catch (error: any) {
      setError(error.message || 'Failed to verify OTP');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleSendNewEmailOtp = async () => {
    try {
      setIsLoadingAction(true);
      setError('');
      
      const response = await apiService.sendNewEmailOtp(newEmailAddress);
      
      // Store new email in localStorage
      localStorage.setItem('pendingNewEmail', newEmailAddress);
      
      setEmailChangeStep(prev => ({
        ...prev,
        newEmail: response.newEmail,
      }));
      setSuccess(response.message);
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleVerifyNewEmailOtp = async () => {
    try {
      setIsLoadingAction(true);
      setError('');
      
      const response = await apiService.verifyNewEmailOtp(newEmailOtp);
      
      setEmailChangeStep(prev => ({
        ...prev,
        step: 'password-confirmation',
        newEmailVerified: true,
      }));
      setSuccess(response.message);
    } catch (error: any) {
      setError(error.message || 'Failed to verify OTP');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleConfirmEmailChange = async () => {
    try {
      setIsLoadingAction(true);
      setError('');
      
      // Get the stored values from localStorage
      const storedNewEmail = localStorage.getItem('pendingNewEmail');
      const storedNewPassword = localStorage.getItem('pendingNewPassword');
      
      if (!storedNewEmail || !storedNewPassword) {
        throw new Error('New email and password are required');
      }
      
      const response = await apiService.confirmEmailChange(storedNewEmail, storedNewPassword);
      
      setEmailChangeStep(prev => ({
        ...prev,
        step: 'completed',
      }));
      setSuccess(response.message);
      
      // CRITICAL SECURITY FIX: If re-authentication is required, logout and redirect
      if (response.requiresReauth) {
        console.log('Email and password change completed - tokens invalidated, logging out user');
        
        // Clear localStorage after successful update
        localStorage.removeItem('pendingNewEmail');
        localStorage.removeItem('pendingNewPassword');
        
        // Update user details with the latest information before logout
        if (response.user) {
          console.log('Updating user details with latest information:', response.user);
          // The user context will be cleared by logout, but we can show the updated email in the success message
          const passwordMessage = storedNewPassword ? ' and password' : '';
          setSuccess(`Email address${passwordMessage} changed successfully to ${response.user.email}! Please login again with your new credentials.`);
        } else {
          setSuccess('Email address and password changed successfully! Please login again with your new credentials.');
        }
        
        // Clear authentication state immediately
        await logout();
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/admin');
        }, 3000);
        
        return;
      }
      
      // If no re-auth required (shouldn't happen with our fix), refresh user data
      await checkAuthStatus();
      
    } catch (error: any) {
      setError(error.message || 'Failed to confirm email and password change');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const resetEmailChangeProcess = () => {
    setEmailChangeStep({
      step: 'current-email',
      currentEmailVerified: false,
      newEmailVerified: false,
      newEmail: '',
    });
    setCurrentEmailOtp('');
    setNewEmailAddress('');
    setNewEmailOtp('');
    setPassword('');
    setEmailChangeNewPassword('');
    setError('');
    setSuccess('');
    
    // Clear localStorage
    localStorage.removeItem('pendingNewEmail');
    localStorage.removeItem('pendingNewPassword');
  };

  const handleChangePassword = async () => {
    try {
      setIsLoadingAction(true);
      setError('');
      
      if (newPassword !== confirmNewPassword) {
        throw new Error('New passwords do not match');
      }
      
      const response = await changePassword(currentPassword, newPassword, confirmNewPassword);
      
      setSuccess(response.message);
      
      // CRITICAL SECURITY FIX: If re-authentication is required, logout and redirect
      if (response.requiresReauth) {
        console.log('Password change completed - tokens invalidated, logging out user');
        
        // Clear authentication state immediately
        await logout();
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/admin');
        }, 3000);
        
        return;
      }
      
      // If no re-auth required (shouldn't happen with our fix), refresh user data
      await checkAuthStatus();
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordChangeForm(false);
      
    } catch (error: any) {
      setError(error.message || 'Failed to change password');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const resetPasswordChangeForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPasswordChangeForm(false);
    setError('');
    setSuccess('');
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

  // If not authenticated or not verified, don't render anything (will redirect)
  if (!isAuthenticated || !user?.isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={handleBackToDashboard}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <Image
                src="/lanmic_logo.png"
                alt="LANMIC Polymers Logo"
                width={60}
                height={60}
                className="w-15 h-15 object-contain mr-3"
                style={{ width: 'auto', height: 'auto' }}
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Settings</h1>
                <p className="text-sm text-gray-500">Manage your account settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username || user?.email}</p>
                <p className="text-xs text-gray-500">Admin User</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* User Profile Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Username</label>
              <input
                type="text"
                value={user?.username || 'N/A'}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed opacity-60"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Current Email</label>
              <input
                type="email"
                value={user?.email || 'N/A'}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed opacity-60"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user?.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
            {showPasswordChangeForm && (
              <button
                onClick={resetPasswordChangeForm}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Cancel
              </button>
            )}
          </div>

          {!showPasswordChangeForm ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Change Your Password</h3>
              <p className="text-gray-600 mb-6">
                Update your password to keep your account secure. You will need to login again after changing your password.
              </p>
              <button
                onClick={() => setShowPasswordChangeForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Change Password
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Enter New Password</h3>
                <p className="text-gray-600 mb-4">
                  Please enter your current password and choose a new secure password.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoadingAction || !currentPassword || !newPassword || !confirmNewPassword}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    {isLoadingAction ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    onClick={resetPasswordChangeForm}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Email Change Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Change Email Address</h2>
            {emailChangeStep.step !== 'current-email' && emailChangeStep.step !== 'completed' && (
              <button
                onClick={resetEmailChangeProcess}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Start Over
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${emailChangeStep.step === 'current-email' ? 'text-blue-600' : emailChangeStep.currentEmailVerified ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  emailChangeStep.step === 'current-email' ? 'bg-blue-100' : 
                  emailChangeStep.currentEmailVerified ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {emailChangeStep.currentEmailVerified ? '✓' : '1'}
                </div>
                <span className="ml-2 text-sm font-medium">Verify Current Email</span>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${
                emailChangeStep.step === 'new-email' || emailChangeStep.step === 'password-confirmation' || emailChangeStep.step === 'completed' ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center ${emailChangeStep.step === 'new-email' ? 'text-blue-600' : emailChangeStep.newEmailVerified ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  emailChangeStep.step === 'new-email' ? 'bg-blue-100' : 
                  emailChangeStep.newEmailVerified ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {emailChangeStep.newEmailVerified ? '✓' : '2'}
                </div>
                <span className="ml-2 text-sm font-medium">Verify New Email</span>
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${
                emailChangeStep.step === 'password-confirmation' || emailChangeStep.step === 'completed' ? 'bg-green-600' : 'bg-gray-300'
              }`}></div>
              <div className={`flex items-center ${emailChangeStep.step === 'password-confirmation' ? 'text-blue-600' : emailChangeStep.step === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  emailChangeStep.step === 'password-confirmation' ? 'bg-blue-100' : 
                  emailChangeStep.step === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {emailChangeStep.step === 'completed' ? '✓' : '3'}
                </div>
                <span className="ml-2 text-sm font-medium">Confirm Password</span>
              </div>
            </div>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Verify Current Email */}
          {emailChangeStep.step === 'current-email' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Step 1: Verify Current Email</h3>
                <p className="text-gray-600 mb-4">
                  We need to verify that you have access to your current email address ({user?.email}) before allowing you to change it.
                </p>
                <button
                  onClick={handleSendCurrentEmailOtp}
                  disabled={isLoadingAction}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  {isLoadingAction ? (
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
                      Send OTP to Current Email
                    </>
                  )}
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP from Current Email</label>
                <input
                  type="text"
                  value={currentEmailOtp}
                  onChange={(e) => setCurrentEmailOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 5-digit OTP"
                  maxLength={5}
                />
                <button
                  onClick={handleVerifyCurrentEmailOtp}
                  disabled={isLoadingAction || currentEmailOtp.length !== 5}
                  className="mt-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  {isLoadingAction ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Verify New Email */}
          {emailChangeStep.step === 'new-email' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Step 2: Enter New Email Address</h3>
                <p className="text-gray-600 mb-4">
                  Enter the new email address you want to use for your account.
                </p>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={newEmailAddress}
                    onChange={(e) => setNewEmailAddress(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new email address"
                  />
                  <button
                    onClick={handleSendNewEmailOtp}
                    disabled={isLoadingAction || !newEmailAddress}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    {isLoadingAction ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP from New Email</label>
                <input
                  type="text"
                  value={newEmailOtp}
                  onChange={(e) => setNewEmailOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 5-digit OTP"
                  maxLength={5}
                />
                <button
                  onClick={handleVerifyNewEmailOtp}
                  disabled={isLoadingAction || newEmailOtp.length !== 5}
                  className="mt-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  {isLoadingAction ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Password Confirmation */}
          {emailChangeStep.step === 'password-confirmation' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Step 3: Confirm Changes</h3>
                <p className="text-gray-600 mb-4">
                  Review your new email and password. Click submit to update your account with these new details.
                </p>
                
                {/* Review Fields */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-800 mb-3">New Account Details</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    These will replace your current email and password.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
                      <input
                        type="email"
                        value={newEmailAddress}
                        onChange={(e) => handleNewEmailChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={emailChangeNewPassword}
                        onChange={(e) => handleNewPasswordChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmEmailChange}
                  disabled={isLoadingAction || !newEmailAddress || !emailChangeNewPassword}
                  className="mt-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  {isLoadingAction ? 'Updating...' : 'Update Email and Password'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Completed */}
          {emailChangeStep.step === 'completed' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Email Change Completed!</h3>
              <p className="text-gray-600 mb-4">
                Your email address has been successfully changed to <strong>{emailChangeStep.newEmail}</strong>.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You will receive a confirmation email at your new address. Please use your new email for future logins.
              </p>
              <button
                onClick={resetEmailChangeProcess}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Change Email Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
