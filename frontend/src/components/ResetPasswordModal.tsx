"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const ResetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm password is required"),
});

export default function ResetPasswordModal({
  isOpen,
  onClose,
  email,
}: ResetPasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(180); // 3 minutes in seconds
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Handle countdown and redirect when success is shown
  useEffect(() => {
    if (success && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Redirect when countdown reaches 0
            router.push("/admin");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [success, countdown, router]);

  // Reset countdown when modal closes or success is cleared
  useEffect(() => {
    if (!success) {
      setCountdown(180);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    }
  }, [success]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const response = await apiService.resetPassword(email, values.newPassword, values.confirmPassword);
        setSuccess(response.message || "Password updated successfully!");
      } catch (error: any) {
        console.error("Reset password error:", error);
        setError(error.message || "Failed to reset password. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600">
            Enter your new password for <span className="font-semibold">{email}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
            <p className="text-sm mt-1">
              Redirecting to login page in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}...
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.newPassword}
                disabled={!!success}
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  formik.touched.newPassword && formik.errors.newPassword
                    ? "border-red-500"
                    : "border-gray-300"
                } ${success ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formik.touched.newPassword && formik.errors.newPassword && (
              <p className="mt-2 text-sm text-red-600">{formik.errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                disabled={!!success}
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                } ${success ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{formik.errors.confirmPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Password must contain:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character (@$!%*?&)</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            {!success ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Resetting...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Go to Login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}


