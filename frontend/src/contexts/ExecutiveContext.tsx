"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { executiveApi, ExecutiveLeadership, CreateExecutiveLeadershipData, UpdateExecutiveLeadershipData } from '@/lib/executiveApi';
import { websocketService } from '@/lib/websocket.service';

// Re-export types for convenience
export type { ExecutiveLeadership, CreateExecutiveLeadershipData, UpdateExecutiveLeadershipData };

interface ExecutiveContextType {
  executiveLeadership: ExecutiveLeadership[];
  isLoading: boolean;
  error: string | null;
  isWebSocketConnected: boolean;
  setExecutiveLeadership: (executives: ExecutiveLeadership[]) => void;
  addExecutiveLeadership: (executiveData: CreateExecutiveLeadershipData) => Promise<ExecutiveLeadership>;
  updateExecutiveLeadership: (id: number, executiveData: UpdateExecutiveLeadershipData) => Promise<ExecutiveLeadership>;
  deleteExecutiveLeadership: (id: number) => Promise<void>;
  toggleActive: (id: number) => Promise<ExecutiveLeadership>;
  getActiveExecutiveLeadership: () => Promise<ExecutiveLeadership[]>;
  loadExecutiveLeadership: () => Promise<void>;
}

const ExecutiveContext = createContext<ExecutiveContextType | undefined>(undefined);

export const useExecutive = () => {
  const context = useContext(ExecutiveContext);
  if (context === undefined) {
    throw new Error('useExecutive must be used within an ExecutiveProvider');
  }
  return context;
};

interface ExecutiveProviderProps {
  children: ReactNode;
}

export const ExecutiveProvider: React.FC<ExecutiveProviderProps> = ({ children }) => {
  const [executiveLeadership, setExecutiveLeadership] = useState<ExecutiveLeadership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // Load executive leadership from API on mount
  useEffect(() => {
    loadExecutiveLeadership();
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
   * Initialize WebSocket connection for real-time executive leadership updates
   * Sets up event listeners for executive leadership events and connects to the server
   */
  const initializeWebSocket = async () => {
    try {
      // Connect to WebSocket server
      await websocketService.connect();
      setIsWebSocketConnected(true);

      // Set up event handlers for real-time executive leadership updates
      setupWebSocketEventHandlers();

    } catch (error) {
      setIsWebSocketConnected(false);
      // Don't show error to user as WebSocket is optional for basic functionality
      // The app will still work without real-time updates
    }
  };

  /**
   * Set up WebSocket event handlers for executive leadership events
   * Handles real-time updates for executive leadership creation, updates, deletion, and active status changes
   */
  const setupWebSocketEventHandlers = () => {
    // Handle executive leadership created events - add new executive leadership to the list
    websocketService.on('executive-leadership-created', (eventData: any) => {
      const newExecutive = {
        ...eventData.data,
        createdAt: new Date(eventData.data.createdAt)
      };
      
      setExecutiveLeadership(prev => {
        // Check if executive leadership already exists to prevent duplicates
        const exists = prev.some(executive => executive.id === newExecutive.id);
        if (exists) {
          return prev; // Don't add if already exists
        }
        return [newExecutive, ...prev];
      });
    });

    // Handle executive leadership updated events - update existing executive leadership in the list
    websocketService.on('executive-leadership-updated', (eventData: any) => {
      const updatedExecutive = {
        ...eventData.data,
        createdAt: new Date(eventData.data.createdAt)
      };
      
      setExecutiveLeadership(prev => prev.map(executive => 
        executive.id === updatedExecutive.id ? updatedExecutive : executive
      ));
    });

    // Handle executive leadership deleted events - remove executive leadership from the list
    websocketService.on('executive-leadership-deleted', (eventData: any) => {
      const deletedExecutiveId = eventData.data.id;
      
      setExecutiveLeadership(prev => prev.filter(executive => executive.id !== deletedExecutiveId));
    });

    // Handle executive leadership active events - update active status
    websocketService.on('executive-leadership-active', (eventData: any) => {
      const updatedExecutive = {
        ...eventData.data,
        createdAt: new Date(eventData.data.createdAt)
      };
      
      setExecutiveLeadership(prev => prev.map(executive => 
        executive.id === updatedExecutive.id ? updatedExecutive : executive
      ));
    });
  };

  const loadExecutiveLeadership = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Load all executive leadership for admin management (both active and inactive)
      const executives = await executiveApi.getAllExecutiveLeadership();
      // Parse dates from strings to Date objects
      const parsedExecutives = executives.map(executive => ({
        ...executive,
        createdAt: new Date(executive.createdAt)
      }));
      setExecutiveLeadership(parsedExecutives);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load executive leadership');
    } finally {
      setIsLoading(false);
    }
  };

  const addExecutiveLeadership = async (executiveData: CreateExecutiveLeadershipData) => {
    try {
      const newExecutive = await executiveApi.createExecutiveLeadership(executiveData);
      const parsedExecutive = {
        ...newExecutive,
        createdAt: new Date(newExecutive.createdAt)
      };
      
      // Only add to local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setExecutiveLeadership(prev => [parsedExecutive, ...prev]);
      }
      
      return parsedExecutive;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create executive leadership');
      throw err;
    }
  };

  const updateExecutiveLeadership = async (id: number, executiveData: UpdateExecutiveLeadershipData) => {
    try {
      const updatedExecutive = await executiveApi.updateExecutiveLeadership(id, executiveData);
      const parsedExecutive = {
        ...updatedExecutive,
        createdAt: new Date(updatedExecutive.createdAt)
      };
      
      // Only update local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setExecutiveLeadership(prev => prev.map(executive => executive.id === id ? parsedExecutive : executive));
      }
      
      return parsedExecutive;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update executive leadership');
      throw err;
    }
  };

  const deleteExecutiveLeadership = async (id: number) => {
    try {
      await executiveApi.deleteExecutiveLeadership(id);
      
      // Only update local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setExecutiveLeadership(prev => prev.filter(executive => executive.id !== id));
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete executive leadership');
      throw err;
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const updatedExecutive = await executiveApi.toggleActive(id);
      const parsedExecutive = {
        ...updatedExecutive,
        createdAt: new Date(updatedExecutive.createdAt)
      };
      
      // Only update local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setExecutiveLeadership(prev => prev.map(executive => executive.id === id ? parsedExecutive : executive));
      }
      
      return parsedExecutive;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle active status');
      throw err;
    }
  };

  const getActiveExecutiveLeadership = async () => {
    try {
      const executives = await executiveApi.getActiveExecutiveLeadership();
      // Parse dates from strings to Date objects
      return executives.map(executive => ({
        ...executive,
        createdAt: new Date(executive.createdAt)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active executive leadership');
      return [];
    }
  };

  const value: ExecutiveContextType = {
    executiveLeadership,
    isLoading,
    error,
    isWebSocketConnected,
    setExecutiveLeadership,
    addExecutiveLeadership,
    updateExecutiveLeadership,
    deleteExecutiveLeadership,
    toggleActive,
    getActiveExecutiveLeadership,
    loadExecutiveLeadership
  };

  return (
    <ExecutiveContext.Provider value={value}>
      {children}
    </ExecutiveContext.Provider>
  );
};
