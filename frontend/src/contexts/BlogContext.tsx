"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { blogApi } from '@/lib/blogApi';
import { websocketService } from '@/lib/websocket.service';

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
  isWebSocketConnected: boolean;
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
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // Load blog posts from API on mount
  useEffect(() => {
    loadBlogPosts();
  }, []);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    initializeWebSocket();
    
    // Cleanup WebSocket connection on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  /**
   * Initialize WebSocket connection for real-time blog updates
   * Sets up event listeners for blog events and connects to the server
   */
  const initializeWebSocket = async () => {
    try {
      // Connect to WebSocket server
      await websocketService.connect();
      setIsWebSocketConnected(true);

      // Set up event handlers for real-time blog updates
      setupWebSocketEventHandlers();

    } catch (error) {
      setIsWebSocketConnected(false);
      // Don't show error to user as WebSocket is optional for basic functionality
      // The app will still work without real-time updates
    }
  };

  /**
   * Set up WebSocket event handlers for blog events
   * Handles real-time updates for blog creation, updates, deletion, and publishing
   */
  const setupWebSocketEventHandlers = () => {
    // Handle blog created events - add new blog to the list
    websocketService.on('blog-created', (eventData: any) => {
      const newBlog = {
        ...eventData.data,
        createdAt: new Date(eventData.data.createdAt)
      };
      
      setBlogPosts(prev => {
        // Check if blog already exists to prevent duplicates
        const exists = prev.some(post => post.id === newBlog.id);
        if (exists) {
          return prev; // Don't add if already exists
        }
        return [newBlog, ...prev];
      });
    });

    // Handle blog updated events - update existing blog in the list
    websocketService.on('blog-updated', (eventData: any) => {
      const updatedBlog = {
        ...eventData.data,
        createdAt: new Date(eventData.data.createdAt)
      };
      
      setBlogPosts(prev => prev.map(post => 
        post.id === updatedBlog.id ? updatedBlog : post
      ));
    });

    // Handle blog deleted events - remove blog from the list
    websocketService.on('blog-deleted', (eventData: any) => {
      const deletedBlogId = eventData.data.id;
      
      setBlogPosts(prev => prev.filter(post => post.id !== deletedBlogId));
    });

    // Handle blog published events - update published status
    websocketService.on('blog-published', (eventData: any) => {
      const updatedBlog = {
        ...eventData.data,
        createdAt: new Date(eventData.data.createdAt)
      };
      
      setBlogPosts(prev => prev.map(post => 
        post.id === updatedBlog.id ? updatedBlog : post
      ));
    });
  };

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
      
      // Only add to local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setBlogPosts(prev => [parsedPost, ...prev]);
      }
      
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
      
      // Only update local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setBlogPosts(prev => prev.map(post => post.id === id ? parsedPost : post));
      }
      
      return parsedPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blog post');
      throw err;
    }
  };

  const deleteBlogPost = async (id: number) => {
    try {
      await blogApi.deleteBlogPost(id);
      
      // Only update local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setBlogPosts(prev => prev.filter(post => post.id !== id));
      }
      
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
      
      // Only update local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setBlogPosts(prev => prev.map(post => post.id === id ? parsedPost : post));
      }
      
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
    isWebSocketConnected,
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
