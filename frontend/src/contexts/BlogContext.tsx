"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  createdAt: Date;
  published: boolean;
}

interface BlogContextType {
  blogPosts: BlogPost[];
  setBlogPosts: (posts: BlogPost[]) => void;
  addBlogPost: (post: BlogPost) => void;
  updateBlogPost: (id: number, post: BlogPost) => void;
  deleteBlogPost: (id: number) => void;
  getPublishedPosts: () => BlogPost[];
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
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: "Advanced Polymer Manufacturing Techniques",
      description: "Discover how our latest manufacturing innovations are revolutionizing the polymer industry with sustainable and efficient production methods.",
      content: "Our latest manufacturing innovations are revolutionizing the polymer industry with sustainable and efficient production methods. We combine cutting-edge technology with environmental responsibility to create products that meet the highest standards.",
      category: "Technology",
      readTime: "5 min read",
      authorName: "Dr. Sarah Chen",
      authorPosition: "Chief Technology Officer",
      authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format&q=80",
      blogImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop&auto=format&q=80",
      createdAt: new Date('2024-07-20'),
      published: true
    },
    {
      id: 2,
      title: "Sustainable Polymer Solutions for the Future",
      description: "Learn about our commitment to environmental responsibility and how we're developing eco-friendly polymer alternatives for a sustainable future.",
      content: "Our commitment to environmental responsibility drives us to develop eco-friendly polymer alternatives for a sustainable future. We believe in creating products that not only meet today's needs but also protect tomorrow's world.",
      category: "Innovation",
      readTime: "3 min read",
      authorName: "Dr. Michael Rodriguez",
      authorPosition: "Research Director",
      authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format&q=80",
      blogImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format&q=80",
      createdAt: new Date('2024-07-18'),
      published: true
    },
    {
      id: 3,
      title: "Quality Assurance in Polymer Production",
      description: "Explore our rigorous quality control processes and how we ensure every product meets the highest industry standards and customer expectations.",
      content: "Our rigorous quality control processes ensure every product meets the highest industry standards and customer expectations. We implement comprehensive testing protocols at every stage of production.",
      category: "Industry",
      readTime: "7 min read",
      authorName: "Lisa Thompson",
      authorPosition: "Quality Assurance Manager",
      authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format&q=80",
      blogImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&auto=format&q=80",
      createdAt: new Date('2024-07-15'),
      published: true
    }
  ]);

  const addBlogPost = (post: BlogPost) => {
    setBlogPosts(prev => [post, ...prev]);
  };

  const updateBlogPost = (id: number, updatedPost: BlogPost) => {
    setBlogPosts(prev => prev.map(post => post.id === id ? updatedPost : post));
  };

  const deleteBlogPost = (id: number) => {
    setBlogPosts(prev => prev.filter(post => post.id !== id));
  };

  const getPublishedPosts = () => {
    return blogPosts.filter(post => post.published).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const value: BlogContextType = {
    blogPosts,
    setBlogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    getPublishedPosts
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};
