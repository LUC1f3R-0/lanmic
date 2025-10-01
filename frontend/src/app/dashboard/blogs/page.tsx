"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useBlog, BlogPost } from '@/contexts/BlogContext';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { FileUpload } from '@/components/FileUpload';
import { getDisplayImageUrl } from '@/lib/imageUtils';

export default function BlogManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { blogPosts, isLoading: blogLoading, error: blogError, isWebSocketConnected, addBlogPost, updateBlogPost, deleteBlogPost, togglePublish } = useBlog();
  const router = useRouter();
  
  const [newPost, setNewPost] = useState({ 
    title: '', 
    description: '', 
    content: '', 
    category: 'Technology', 
    readTime: '', 
    authorName: '', 
    authorPosition: '', 
    authorImage: '', 
    blogImage: '' 
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPost, setEditPost] = useState({ 
    title: '', 
    description: '', 
    content: '', 
    category: 'Technology', 
    readTime: '', 
    authorName: '', 
    authorPosition: '', 
    authorImage: '', 
    blogImage: '' 
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
    if (newPost.title.trim() && newPost.authorName.trim()) {
      try {
        const postData = {
          title: newPost.title,
          description: newPost.description,
          content: newPost.content,
          category: newPost.category,
          readTime: newPost.readTime,
          authorName: newPost.authorName,
          authorPosition: newPost.authorPosition,
          authorImage: newPost.authorImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format&q=80",
          blogImage: newPost.blogImage || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop&auto=format&q=80",
          published: true
        };
        await addBlogPost(postData);
        setNewPost({ 
          title: '', 
          description: '', 
          content: '', 
          category: 'Technology', 
          readTime: '', 
          authorName: '', 
          authorPosition: '', 
          authorImage: '', 
          blogImage: '' 
        });
      } catch (error) {
        // Error creating blog post
      }
    }
  };

  const handleUpdate = async (id: number) => {
    if (editPost.title.trim() && editPost.authorName.trim()) {
      try {
        const postData = {
          title: editPost.title,
          description: editPost.description,
          content: editPost.content,
          category: editPost.category,
          readTime: editPost.readTime,
          authorName: editPost.authorName,
          authorPosition: editPost.authorPosition,
          authorImage: editPost.authorImage || blogPosts.find(p => p.id === id)?.authorImage,
          blogImage: editPost.blogImage || blogPosts.find(p => p.id === id)?.blogImage,
        };
        await updateBlogPost(id, postData);
        setEditingId(null);
        setEditPost({ 
          title: '', 
          description: '', 
          content: '', 
          category: 'Technology', 
          readTime: '', 
          authorName: '', 
          authorPosition: '', 
          authorImage: '', 
          blogImage: '' 
        });
      } catch (error) {
        // Error updating blog post
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBlogPost(id);
    } catch (error) {
      // Error deleting blog post
    }
  };

  const handleTogglePublish = async (id: number) => {
    try {
      await togglePublish(id);
    } catch (error) {
      // Error toggling publish status
    }
  };

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setEditPost({ 
      title: post.title, 
      description: post.description,
      content: post.content,
      category: post.category,
      readTime: post.readTime,
      authorName: post.authorName,
      authorPosition: post.authorPosition,
      authorImage: post.authorImage,
      blogImage: post.blogImage
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPost({ 
      title: '', 
      description: '', 
      content: '', 
      category: 'Technology', 
      readTime: '', 
      authorName: '', 
      authorPosition: '', 
      authorImage: '', 
      blogImage: '' 
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
                width={40}
                height={40}
                className="w-10 h-10 object-contain mr-3"
                style={{ width: 'auto', height: 'auto' }}
              />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
                  {/* Real-time connection status indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-xs font-medium ${isWebSocketConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {isWebSocketConnected ? 'Real-time Connected' : 'Real-time Disconnected'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Content Management System with Real-time Updates</p>
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
        {/* Create New Blog Post Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Blog Post</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter blog post title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Technology">Technology</option>
                <option value="Innovation">Innovation</option>
                <option value="Industry">Industry</option>
                <option value="Research">Research</option>
                <option value="Sustainability">Sustainability</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author Name *</label>
              <input
                type="text"
                value={newPost.authorName}
                onChange={(e) => setNewPost({ ...newPost, authorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter author name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author Position</label>
              <input
                type="text"
                value={newPost.authorPosition}
                onChange={(e) => setNewPost({ ...newPost, authorPosition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter author position"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Read Time</label>
              <input
                type="text"
                value={newPost.readTime}
                onChange={(e) => setNewPost({ ...newPost, readTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 5 min read"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author Image</label>
              <FileUpload
                onUpload={(url) => setNewPost({ ...newPost, authorImage: url })}
                currentImage={newPost.authorImage}
                placeholder="Upload Author Image"
                fieldName="authorImage"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Blog Image</label>
              <FileUpload
                onUpload={(url) => setNewPost({ ...newPost, blogImage: url })}
                currentImage={newPost.blogImage}
                placeholder="Upload Blog Image"
                fieldName="blogImage"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter blog post description"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter blog post content"
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
            Create Blog Post
          </button>
        </div>

        {/* Blog Posts List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Blog Posts ({blogPosts.length})</h2>
          
          {blogPosts.length === 0 ? (
            <div className="text-center py-8">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-gray-500">No blog posts yet. Create your first blog post above!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {blogPosts.map((post, index) => (
                <div key={`${post.id}-${index}`} className={`border rounded-lg p-6 ${!post.published ? 'bg-gray-50' : 'bg-white'}`}>
                  {editingId === post.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={editPost.title}
                            onChange={(e) => setEditPost({ ...editPost, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <select
                            value={editPost.category}
                            onChange={(e) => setEditPost({ ...editPost, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Technology">Technology</option>
                            <option value="Innovation">Innovation</option>
                            <option value="Industry">Industry</option>
                            <option value="Research">Research</option>
                            <option value="Sustainability">Sustainability</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
                          <input
                            type="text"
                            value={editPost.authorName}
                            onChange={(e) => setEditPost({ ...editPost, authorName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Author Position</label>
                          <input
                            type="text"
                            value={editPost.authorPosition}
                            onChange={(e) => setEditPost({ ...editPost, authorPosition: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Read Time</label>
                          <input
                            type="text"
                            value={editPost.readTime}
                            onChange={(e) => setEditPost({ ...editPost, readTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Author Image</label>
                          <FileUpload
                            onUpload={(url) => setEditPost({ ...editPost, authorImage: url })}
                            currentImage={editPost.authorImage}
                            placeholder="Upload Author Image"
                            fieldName="authorImage"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Blog Image</label>
                          <FileUpload
                            onUpload={(url) => setEditPost({ ...editPost, blogImage: url })}
                            currentImage={editPost.blogImage}
                            placeholder="Upload Blog Image"
                            fieldName="blogImage"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={editPost.description}
                            onChange={(e) => setEditPost({ ...editPost, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                          <textarea
                            value={editPost.content}
                            onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(post.id)}
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
                      {/* Blog Image Preview */}
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={getDisplayImageUrl(post.blogImage)}
                          alt={post.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            post.category === 'Technology' ? 'bg-orange-100 text-orange-800' :
                            post.category === 'Innovation' ? 'bg-teal-100 text-teal-800' :
                            post.category === 'Industry' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {post.category}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                          <p className="text-gray-600 mb-3">{post.description}</p>
                          <div className="flex items-center text-sm text-gray-500 mb-3">
                            <span>{formatDate(post.createdAt)}</span>
                            {post.readTime && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{post.readTime}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center">
                            <Image
                              src={getDisplayImageUrl(post.authorImage, 'author')}
                              alt={post.authorName}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full mr-3"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{post.authorName}</div>
                              <div className="text-xs text-gray-600">{post.authorPosition}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleTogglePublish(post.id)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
                              post.published 
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {post.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => startEdit(post)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
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
