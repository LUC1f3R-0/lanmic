"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useExecutive, ExecutiveLeadership } from '@/contexts/ExecutiveContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { FileUpload } from '@/components/FileUpload';
import { getDisplayImageUrl } from '@/lib/imageUtils';

export default function ExecutiveManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { executiveLeadership, isLoading: executiveLoading, error: executiveError, isWebSocketConnected, addExecutiveLeadership, updateExecutiveLeadership, deleteExecutiveLeadership, toggleActive } = useExecutive();
  const router = useRouter();
  
  const [newExecutive, setNewExecutive] = useState({ 
    name: '', 
    position: '', 
    description: '', 
    image: '', 
    linkedinUrl: '', 
    twitterUrl: '',
    displayOrder: 1 
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editExecutive, setEditExecutive] = useState({ 
    name: '', 
    position: '', 
    description: '', 
    image: '', 
    linkedinUrl: '', 
    twitterUrl: '',
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

  // Helper function to safely format dates
  const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString();
    }
    return date.toLocaleDateString();
  };

  // CRUD Operations
  const handleCreate = async () => {
    if (newExecutive.name.trim() && newExecutive.position.trim()) {
      try {
        const executiveData = {
          name: newExecutive.name,
          position: newExecutive.position,
          description: newExecutive.description,
          image: newExecutive.image || undefined,
          linkedinUrl: newExecutive.linkedinUrl?.trim() || undefined,
          twitterUrl: newExecutive.twitterUrl?.trim() || undefined,
          displayOrder: newExecutive.displayOrder,
          isActive: true
        };
        await addExecutiveLeadership(executiveData);
        setNewExecutive({ 
          name: '', 
          position: '', 
          description: '', 
          image: '', 
          linkedinUrl: '', 
          twitterUrl: '',
          displayOrder: 1 
        });
      } catch (error) {
        // Error creating executive leadership
      }
    }
  };

  const handleUpdate = async (id: number) => {
    if (editExecutive.name.trim() && editExecutive.position.trim()) {
      try {
        const executiveData = {
          name: editExecutive.name,
          position: editExecutive.position,
          description: editExecutive.description,
          image: editExecutive.image || executiveLeadership.find(e => e.id === id)?.image,
          linkedinUrl: editExecutive.linkedinUrl?.trim() || undefined,
          twitterUrl: editExecutive.twitterUrl?.trim() || undefined,
          displayOrder: editExecutive.displayOrder,
        };
        await updateExecutiveLeadership(id, executiveData);
        setEditingId(null);
        setEditExecutive({ 
          name: '', 
          position: '', 
          description: '', 
          image: '', 
          linkedinUrl: '', 
          twitterUrl: '',
          displayOrder: 1 
        });
      } catch (error) {
        // Error updating executive leadership
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteExecutiveLeadership(id);
    } catch (error) {
      // Error deleting executive leadership
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleActive(id);
    } catch (error) {
      // Error toggling active status
    }
  };

  const startEdit = (executive: ExecutiveLeadership) => {
    setEditingId(executive.id);
    setEditExecutive({ 
      name: executive.name, 
      position: executive.position,
      description: executive.description,
      image: executive.image || '',
      linkedinUrl: executive.linkedinUrl || '',
      twitterUrl: executive.twitterUrl || '',
      displayOrder: executive.displayOrder
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditExecutive({ 
      name: '', 
      position: '', 
      description: '', 
      image: '', 
      linkedinUrl: '', 
      twitterUrl: '',
      displayOrder: 1 
    });
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
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
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">Executive Leadership Management</h1>
                  {/* Real-time connection status indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-xs font-medium ${isWebSocketConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {isWebSocketConnected ? 'Real-time Connected' : 'Real-time Disconnected'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Executive Leadership Management System with Real-time Updates</p>
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
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Create New Executive Leadership Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Executive Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={newExecutive.name}
                onChange={(e) => setNewExecutive({ ...newExecutive, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter executive name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
              <input
                type="text"
                value={newExecutive.position}
                onChange={(e) => setNewExecutive({ ...newExecutive, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter executive position"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
              <input
                type="number"
                min="1"
                value={newExecutive.displayOrder}
                onChange={(e) => setNewExecutive({ ...newExecutive, displayOrder: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Display order"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
              <FileUpload
                onUpload={(url) => setNewExecutive({ ...newExecutive, image: url })}
                currentImage={newExecutive.image}
                placeholder="Upload Executive Image"
                fieldName="executiveImage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={newExecutive.linkedinUrl}
                onChange={(e) => setNewExecutive({ ...newExecutive, linkedinUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
              <input
                type="url"
                value={newExecutive.twitterUrl}
                onChange={(e) => setNewExecutive({ ...newExecutive, twitterUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newExecutive.description}
                onChange={(e) => setNewExecutive({ ...newExecutive, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter executive description"
                rows={4}
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Executive Leadership
          </button>
        </div>

        {/* Executive Leadership List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Leadership ({executiveLeadership.length})</h2>
          
          {executiveLeadership.length === 0 ? (
            <div className="text-center py-8">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500">No executive leadership yet. Add your first executive above!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {executiveLeadership.map((executive, index) => (
                <div key={`${executive.id}-${index}`} className={`border rounded-lg p-6 ${!executive.isActive ? 'bg-gray-50' : 'bg-white'}`}>
                  {editingId === executive.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input
                            type="text"
                            value={editExecutive.name}
                            onChange={(e) => setEditExecutive({ ...editExecutive, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                          <input
                            type="text"
                            value={editExecutive.position}
                            onChange={(e) => setEditExecutive({ ...editExecutive, position: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                          <input
                            type="number"
                            min="1"
                            value={editExecutive.displayOrder}
                            onChange={(e) => setEditExecutive({ ...editExecutive, displayOrder: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                          <FileUpload
                            onUpload={(url) => setEditExecutive({ ...editExecutive, image: url })}
                            currentImage={editExecutive.image}
                            placeholder="Upload Executive Image"
                            fieldName="executiveImage"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                          <input
                            type="url"
                            value={editExecutive.linkedinUrl}
                            onChange={(e) => setEditExecutive({ ...editExecutive, linkedinUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                          <input
                            type="url"
                            value={editExecutive.twitterUrl}
                            onChange={(e) => setEditExecutive({ ...editExecutive, twitterUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={editExecutive.description}
                            onChange={(e) => setEditExecutive({ ...editExecutive, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(executive.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="space-y-4">
                      {/* Executive Image Preview */}
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={getDisplayImageUrl(executive.image, 'executive')}
                          alt={executive.name}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            executive.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {executive.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{executive.name}</h3>
                          <p className="text-gray-600 mb-3">{executive.position}</p>
                          <p className="text-gray-600 mb-3">{executive.description}</p>
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <span>Order: {executive.displayOrder}</span>
                            <span className="mx-2">•</span>
                            <span>{formatDate(executive.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            {executive.linkedinUrl && (
                              <a
                                href={executive.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                              </a>
                            )}
                            {executive.twitterUrl && (
                              <a
                                href={executive.twitterUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-600"
                              >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleToggleActive(executive.id)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                              executive.isActive 
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {executive.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => startEdit(executive)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(executive.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
