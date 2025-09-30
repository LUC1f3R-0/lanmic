"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTestimonial } from '@/contexts/TestimonialContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { FileUpload } from '@/components/FileUpload';
import { getDisplayImageUrl } from '@/lib/imageUtils';

export default function TestimonialsManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { testimonials, isLoading: testimonialsLoading, error: testimonialsError, isWebSocketConnected, loadTestimonials, addTestimonial, updateTestimonial, deleteTestimonial, toggleActive } = useTestimonial();
  const router = useRouter();
  
  const [newTestimonial, setNewTestimonial] = useState({ 
    name: '', 
    position: '', 
    company: '', 
    content: '', 
    image: '', 
    displayOrder: 1 
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTestimonial, setEditTestimonial] = useState({ 
    name: '', 
    position: '', 
    company: '', 
    content: '', 
    image: '', 
    displayOrder: 1 
  });
  
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

  // Load testimonials when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.isVerified) {
      loadTestimonials();
    }
  }, [isAuthenticated, user?.isVerified, loadTestimonials]);

  // Helper function to safely format dates
  const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  // CRUD Operations
  const handleCreate = async () => {
    if (!newTestimonial.name || !newTestimonial.content) {
      alert('Please fill in all required fields (Name and Content)');
      return;
    }

    try {
      await addTestimonial(newTestimonial);
      setNewTestimonial({ 
        name: '', 
        position: '', 
        company: '', 
        content: '', 
        image: '', 
        displayOrder: 1 
      });
    } catch (error) {
      console.error('Error creating testimonial:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!editTestimonial.name || !editTestimonial.content) {
      alert('Please fill in all required fields (Name and Content)');
      return;
    }

    try {
      await updateTestimonial(editingId, editTestimonial);
      setEditingId(null);
      setEditTestimonial({ 
        name: '', 
        position: '', 
        company: '', 
        content: '', 
        image: '', 
        displayOrder: 1 
      });
    } catch (error) {
      console.error('Error updating testimonial:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      await deleteTestimonial(id);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleActive(id);
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };

  const startEdit = (testimonial: any) => {
    setEditingId(testimonial.id);
    setEditTestimonial({
      name: testimonial.name,
      position: testimonial.position || '',
      company: testimonial.company || '',
      content: testimonial.content,
      image: testimonial.image || '',
      displayOrder: testimonial.displayOrder
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTestimonial({ 
      name: '', 
      position: '', 
      company: '', 
      content: '', 
      image: '', 
      displayOrder: 1 
    });
  };

  if (isLoading || testimonialsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Testimonials Management</h1>
              <p className="mt-2 text-gray-600">Manage customer testimonials and reviews</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isWebSocketConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>{isWebSocketConnected ? 'Real-time Connected' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {testimonialsError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{testimonialsError}</div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Testimonial Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Add New Testimonial</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={newTestimonial.position}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Job title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={newTestimonial.company}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={newTestimonial.displayOrder}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, displayOrder: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={newTestimonial.content}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Testimonial content..."
              />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image (Optional)
              </label>
              <FileUpload
                onUpload={(filename) => setNewTestimonial({ ...newTestimonial, image: filename })}
                uploadPath="testimonial-images"
                currentImage={newTestimonial.image}
              />
            </div>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Testimonial
              </button>
            </div>
          </div>
        </div>

        {/* Testimonials List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Testimonials ({testimonials.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {testimonials.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No testimonials found. Add your first testimonial above.</p>
              </div>
            ) : (
              testimonials.map((testimonial) => (
                <div key={testimonial.id} className="p-6">
                  {editingId === testimonial.id ? (
                    // Edit Form
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={editTestimonial.name}
                            onChange={(e) => setEditTestimonial({ ...editTestimonial, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position
                          </label>
                          <input
                            type="text"
                            value={editTestimonial.position}
                            onChange={(e) => setEditTestimonial({ ...editTestimonial, position: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            value={editTestimonial.company}
                            onChange={(e) => setEditTestimonial({ ...editTestimonial, company: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Order
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={editTestimonial.displayOrder}
                            onChange={(e) => setEditTestimonial({ ...editTestimonial, displayOrder: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content *
                        </label>
                        <textarea
                          value={editTestimonial.content}
                          onChange={(e) => setEditTestimonial({ ...editTestimonial, content: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image (Optional)
                        </label>
                        <FileUpload
                          onUpload={(filename) => setEditTestimonial({ ...editTestimonial, image: filename })}
                          uploadPath="testimonial-images"
                          currentImage={editTestimonial.image}
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleUpdate}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {testimonial.image ? (
                          <Image
                            src={getDisplayImageUrl(testimonial.image, 'testimonial-images')}
                            alt={testimonial.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                            {testimonial.position && (
                              <p className="text-sm text-gray-600">{testimonial.position}</p>
                            )}
                            {testimonial.company && (
                              <p className="text-sm text-gray-500">{testimonial.company}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              testimonial.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {testimonial.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">Order: {testimonial.displayOrder}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-700 line-clamp-3">{testimonial.content}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Created: {formatDate(testimonial.createdAt)}
                          </span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleActive(testimonial.id)}
                              className={`px-3 py-1 text-xs font-medium rounded-md ${
                                testimonial.isActive
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {testimonial.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => startEdit(testimonial)}
                              className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-md hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(testimonial.id)}
                              className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-md hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

