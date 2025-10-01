"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { testimonialApi, Testimonial, CreateTestimonialData, UpdateTestimonialData } from '@/lib/testimonialApi';
import { websocketService } from '@/lib/websocket.service';

interface TestimonialContextType {
  testimonials: Testimonial[];
  isLoading: boolean;
  error: string | null;
  isWebSocketConnected: boolean;
  loadTestimonials: () => Promise<void>;
  getActiveTestimonials: () => Promise<Testimonial[]>;
  addTestimonial: (testimonialData: CreateTestimonialData) => Promise<Testimonial>;
  updateTestimonial: (id: number, testimonialData: UpdateTestimonialData) => Promise<Testimonial>;
  deleteTestimonial: (id: number) => Promise<void>;
  toggleActive: (id: number) => Promise<Testimonial>;
}

const TestimonialContext = createContext<TestimonialContextType | undefined>(undefined);

interface TestimonialProviderProps {
  children: ReactNode;
}

export const TestimonialProvider: React.FC<TestimonialProviderProps> = ({ children }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  /**
   * Initialize WebSocket connection for real-time updates
   * This connects to the WebSocket server and sets up event handlers
   */
  const initializeWebSocket = async () => {
    try {
      await websocketService.connect();
      setIsWebSocketConnected(true);
      setupWebSocketEventHandlers();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setIsWebSocketConnected(false);
      // The app will still work without real-time updates
    }
  };

  /**
   * Set up WebSocket event handlers for testimonial events
   * Handles real-time updates for testimonial creation, updates, deletion, and active status changes
   */
  const setupWebSocketEventHandlers = () => {
    // Handle testimonial created events - add new testimonial to the list
    websocketService.on('testimonial-created', (eventData: any) => {
      const newTestimonial = eventData.data;
      
      setTestimonials(prev => {
        // Check if testimonial already exists to prevent duplicates
        const exists = prev.some(testimonial => testimonial.id === newTestimonial.id);
        if (exists) {
          return prev; // Don't add if already exists
        }
        return [newTestimonial, ...prev];
      });
    });

    // Handle testimonial updated events - update existing testimonial in the list
    websocketService.on('testimonial-updated', (eventData: any) => {
      const updatedTestimonial = eventData.data;
      
      setTestimonials(prev => prev.map(testimonial => 
        testimonial.id === updatedTestimonial.id ? updatedTestimonial : testimonial
      ));
    });

    // Handle testimonial deleted events - remove testimonial from the list
    websocketService.on('testimonial-deleted', (eventData: any) => {
      const deletedTestimonialId = eventData.data.id;
      
      setTestimonials(prev => prev.filter(testimonial => testimonial.id !== deletedTestimonialId));
    });

    // Handle testimonial active events - update active status
    websocketService.on('testimonial-active', (eventData: any) => {
      const updatedTestimonial = eventData.data;
      
      setTestimonials(prev => prev.map(testimonial => 
        testimonial.id === updatedTestimonial.id ? updatedTestimonial : testimonial
      ));
    });
  };

  const loadTestimonials = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Load all testimonials for admin management (both active and inactive)
      const testimonialsData = await testimonialApi.getAllTestimonials();
      setTestimonials(testimonialsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getActiveTestimonials = async () => {
    try {
      const activeTestimonials = await testimonialApi.getActiveTestimonials();
      return activeTestimonials;
    } catch (err) {
      console.error('Failed to load active testimonials:', err);
      return [];
    }
  };

  const addTestimonial = async (testimonialData: CreateTestimonialData) => {
    try {
      const newTestimonial = await testimonialApi.createTestimonial(testimonialData);
      
      // Only add to local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setTestimonials(prev => [newTestimonial, ...prev]);
      }
      
      return newTestimonial;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create testimonial');
      throw err;
    }
  };

  const updateTestimonial = async (id: number, testimonialData: UpdateTestimonialData) => {
    try {
      const updatedTestimonial = await testimonialApi.updateTestimonial(id, testimonialData);
      
      // Only update local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setTestimonials(prev => prev.map(testimonial => 
          testimonial.id === id ? updatedTestimonial : testimonial
        ));
      }
      
      return updatedTestimonial;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update testimonial');
      throw err;
    }
  };

  const deleteTestimonial = async (id: number) => {
    try {
      await testimonialApi.deleteTestimonial(id);
      
      // Only remove from local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setTestimonials(prev => prev.filter(testimonial => testimonial.id !== id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete testimonial');
      throw err;
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const updatedTestimonial = await testimonialApi.toggleActive(id);
      
      // Only update local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setTestimonials(prev => prev.map(testimonial => 
          testimonial.id === id ? updatedTestimonial : testimonial
        ));
      }
      
      return updatedTestimonial;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle testimonial active status');
      throw err;
    }
  };

  // Initialize WebSocket connection when component mounts
  useEffect(() => {
    const initialize = async () => {
      await initializeWebSocket();
    };
    
    initialize();

    // Cleanup WebSocket connection when component unmounts
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const value: TestimonialContextType = {
    testimonials,
    isLoading,
    error,
    isWebSocketConnected,
    loadTestimonials,
    getActiveTestimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleActive,
  };

  return (
    <TestimonialContext.Provider value={value}>
      {children}
    </TestimonialContext.Provider>
  );
};

export const useTestimonial = (): TestimonialContextType => {
  const context = useContext(TestimonialContext);
  if (context === undefined) {
    throw new Error('useTestimonial must be used within a TestimonialProvider');
  }
  return context;
};
