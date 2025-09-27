"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { teamApi, TeamMember, CreateTeamMemberData, UpdateTeamMemberData } from '@/lib/teamApi';
import { websocketService } from '@/lib/websocket.service';

interface TeamContextType {
  teamMembers: TeamMember[];
  isLoading: boolean;
  error: string | null;
  isWebSocketConnected: boolean;
  setTeamMembers: (members: TeamMember[]) => void;
  addTeamMember: (memberData: CreateTeamMemberData) => Promise<TeamMember>;
  updateTeamMember: (id: number, memberData: UpdateTeamMemberData) => Promise<TeamMember>;
  deleteTeamMember: (id: number) => Promise<void>;
  toggleActive: (id: number) => Promise<TeamMember>;
  getActiveTeamMembers: () => Promise<TeamMember[]>;
  loadTeamMembers: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider: React.FC<TeamProviderProps> = ({ children }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);

  // Load team members from API on mount
  useEffect(() => {
    loadTeamMembers();
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
   * Initialize WebSocket connection for real-time team member updates
   * Sets up event listeners for team member events and connects to the server
   */
  const initializeWebSocket = async () => {
    try {
      // Connect to WebSocket server
      await websocketService.connect();
      setIsWebSocketConnected(true);

      // Set up event handlers for real-time team member updates
      setupWebSocketEventHandlers();

    } catch (error) {
      setIsWebSocketConnected(false);
      // Don't show error to user as WebSocket is optional for basic functionality
      // The app will still work without real-time updates
    }
  };

  /**
   * Set up WebSocket event handlers for team member events
   * Handles real-time updates for team member creation, updates, deletion, and active status changes
   */
  const setupWebSocketEventHandlers = () => {
    // Handle team member created events - add new team member to the list
    websocketService.on('team-member-created', (eventData: any) => {
      const newMember = {
        ...eventData.data,
        createdAt: new Date(eventData.data.createdAt)
      };
      
      setTeamMembers(prev => {
        // Check if team member already exists to prevent duplicates
        const exists = prev.some(member => member.id === newMember.id);
        if (exists) {
          return prev; // Don't add if already exists
        }
        return [newMember, ...prev];
      });
    });

    // Handle team member updated events - update existing team member in the list
    websocketService.on('team-member-updated', (eventData: any) => {
      const updatedMember = {
        ...eventData.data,
        createdAt: new Date(eventData.data.createdAt)
      };
      
      setTeamMembers(prev => prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      ));
    });

    // Handle team member deleted events - remove team member from the list
    websocketService.on('team-member-deleted', (eventData: any) => {
      const deletedMemberId = eventData.data.id;
      
      setTeamMembers(prev => prev.filter(member => member.id !== deletedMemberId));
    });

    // Handle team member active events - update active status
    websocketService.on('team-member-active', (eventData: any) => {
      const updatedMember = {
        ...eventData.data,
        createdAt: new Date(eventData.data.createdAt)
      };
      
      setTeamMembers(prev => prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      ));
    });
  };

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Load all team members for admin management (both active and inactive)
      const members = await teamApi.getAllTeamMembers();
      // Parse dates from strings to Date objects
      const parsedMembers = members.map(member => ({
        ...member,
        createdAt: new Date(member.createdAt)
      }));
      setTeamMembers(parsedMembers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  };

  const addTeamMember = async (memberData: CreateTeamMemberData) => {
    try {
      const newMember = await teamApi.createTeamMember(memberData);
      const parsedMember = {
        ...newMember,
        createdAt: new Date(newMember.createdAt)
      };
      
      // Only add to local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setTeamMembers(prev => [parsedMember, ...prev]);
      }
      
      return parsedMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team member');
      throw err;
    }
  };

  const updateTeamMember = async (id: number, memberData: UpdateTeamMemberData) => {
    try {
      const updatedMember = await teamApi.updateTeamMember(id, memberData);
      const parsedMember = {
        ...updatedMember,
        createdAt: new Date(updatedMember.createdAt)
      };
      
      // Only update local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setTeamMembers(prev => prev.map(member => member.id === id ? parsedMember : member));
      }
      
      return parsedMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team member');
      throw err;
    }
  };

  const deleteTeamMember = async (id: number) => {
    try {
      await teamApi.deleteTeamMember(id);
      
      // Only update local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setTeamMembers(prev => prev.filter(member => member.id !== id));
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team member');
      throw err;
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const updatedMember = await teamApi.toggleActive(id);
      const parsedMember = {
        ...updatedMember,
        createdAt: new Date(updatedMember.createdAt)
      };
      
      // Only update local state if WebSocket is not connected
      // This prevents duplicates when WebSocket event is received
      if (!isWebSocketConnected) {
        setTeamMembers(prev => prev.map(member => member.id === id ? parsedMember : member));
      }
      
      return parsedMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle active status');
      throw err;
    }
  };

  const getActiveTeamMembers = async () => {
    try {
      const members = await teamApi.getActiveTeamMembers();
      // Parse dates from strings to Date objects
      return members.map(member => ({
        ...member,
        createdAt: new Date(member.createdAt)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active team members');
      return [];
    }
  };

  const value: TeamContextType = {
    teamMembers,
    isLoading,
    error,
    isWebSocketConnected,
    setTeamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    toggleActive,
    getActiveTeamMembers,
    loadTeamMembers
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};
