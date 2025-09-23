"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { blogApi } from '@/lib/blogApi';

export interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  readTime: string;
  authorName: string;
  authorPosition: string;
  authorImage: string;
  blogImage: string;
  createdAt: Date | string;
  published: boolean;
}

interface BlogContextType {
  blogPosts: BlogPost[];
  isLoading: boolean;
  error: string | null;
  setBlogPosts: (posts: BlogPost[]) => void;
  addBlogPost: (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => Promise<BlogPost>;
  updateBlogPost: (id: number, postData: Partial<BlogPost>) => Promise<BlogPost>;
  deleteBlogPost: (id: number) => Promise<void>;
  togglePublish: (id: number) => Promise<BlogPost>;
  getPublishedPosts: () => Promise<BlogPost[]>;
  loadBlogPosts: () => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

interface BlogProviderProps {
  children: ReactNode;
}

export const BlogProvider: React.FC<BlogProviderProps> = ({ children }) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load blog posts from API on mount
  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Load published posts for public display
      const posts = await blogApi.getPublishedBlogPosts();
      // Parse dates from strings to Date objects
      const parsedPosts = posts.map(post => ({
        ...post,
        createdAt: new Date(post.createdAt)
      }));
      setBlogPosts(parsedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog posts');
      console.error('Error loading blog posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPost = await blogApi.createBlogPost(postData);
      const parsedPost = {
        ...newPost,
        createdAt: new Date(newPost.createdAt)
      };
      setBlogPosts(prev => [parsedPost, ...prev]);
      return parsedPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create blog post');
      throw err;
    }
  };

  const updateBlogPost = async (id: number, postData: Partial<BlogPost>) => {
    try {
      const updatedPost = await blogApi.updateBlogPost(id, postData);
      const parsedPost = {
        ...updatedPost,
        createdAt: new Date(updatedPost.createdAt)
      };
      setBlogPosts(prev => prev.map(post => post.id === id ? parsedPost : post));
      return parsedPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog post');
      throw err;
    }
  };

  const deleteBlogPost = async (id: number) => {
    try {
      await blogApi.deleteBlogPost(id);
      setBlogPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog post');
      throw err;
    }
  };

  const togglePublish = async (id: number) => {
    try {
      const updatedPost = await blogApi.togglePublish(id);
      const parsedPost = {
        ...updatedPost,
        createdAt: new Date(updatedPost.createdAt)
      };
      setBlogPosts(prev => prev.map(post => post.id === id ? parsedPost : post));
      return parsedPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle publish status');
      throw err;
    }
  };

  const getPublishedPosts = async () => {
    try {
      const posts = await blogApi.getPublishedBlogPosts();
      // Parse dates from strings to Date objects
      return posts.map(post => ({
        ...post,
        createdAt: new Date(post.createdAt)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load published posts');
      return [];
    }
  };

  const value: BlogContextType = {
    blogPosts,
    isLoading,
    error,
    setBlogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    togglePublish,
    getPublishedPosts,
    loadBlogPosts
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};
