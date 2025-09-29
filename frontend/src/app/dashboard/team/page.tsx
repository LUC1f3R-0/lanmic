"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { TeamMember } from '@/lib/teamApi';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { FileUpload } from '@/components/FileUpload';
import { getDisplayImageUrl } from '@/lib/imageUtils';

export default function TeamManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { teamMembers, isLoading: teamLoading, error: teamError, isWebSocketConnected, addTeamMember, updateTeamMember, deleteTeamMember, toggleActive } = useTeam();
  const router = useRouter();
  
  const [newMember, setNewMember] = useState({ 
    name: '', 
    position: '', 
    description: '', 
    image: '', 
    department: '', 
    displayOrder: 1 
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMember, setEditMember] = useState({ 
    name: '', 
    position: '', 
    description: '', 
    image: '', 
    department: '', 
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
    if (!newMember.name || !newMember.position || !newMember.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await addTeamMember(newMember);
      setNewMember({ 
        name: '', 
        position: '', 
        description: '', 
        image: '', 
        department: '', 
        displayOrder: 1 
      });
    } catch (error) {
      console.error('Error creating team member:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!editMember.name || !editMember.position || !editMember.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await updateTeamMember(editingId, editMember);
      setEditingId(null);
      setEditMember({ 
        name: '', 
        position: '', 
        description: '', 
        image: '', 
        department: '', 
        displayOrder: 1 
      });
    } catch (error) {
      console.error('Error updating team member:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
      await deleteTeamMember(id);
    } catch (error) {
      console.error('Error deleting team member:', error);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleActive(id);
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };

  const startEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setEditMember({
      name: member.name,
      position: member.position,
      description: member.description,
      image: member.image || '',
      department: member.department || '',
      displayOrder: member.displayOrder
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMember({ 
      name: '', 
      position: '', 
      description: '', 
      image: '', 
      department: '', 
      displayOrder: 1 
    });
  };

  if (isLoading || teamLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
                <p className="text-sm text-gray-500">Manage your team members</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {isWebSocketConnected ? 'Real-time Connected' : 'Real-time Disconnected'}
                </span>
              </div>
              
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
        {teamError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{teamError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create New Team Member Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Add New Team Member</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team member name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <input
                  type="text"
                  value={newMember.position}
                  onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter position"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newMember.description}
                  onChange={(e) => setNewMember({ ...newMember, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team member description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={newMember.department}
                  onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter department"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={newMember.displayOrder}
                  onChange={(e) => setNewMember({ ...newMember, displayOrder: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Display order (minimum 1)"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <FileUpload
                  onUpload={(filename) => setNewMember({ ...newMember, image: filename })}
                  uploadPath="team-images"
                  currentImage={newMember.image}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
              >
                Add Team Member
              </button>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Team Members ({teamMembers.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {teamMembers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No team members found. Add your first team member above.
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className={`p-6 ${!member.isActive ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                  {editingId === member.id ? (
                    // Edit Form
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={editMember.name}
                          onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position *
                        </label>
                        <input
                          type="text"
                          value={editMember.position}
                          onChange={(e) => setEditMember({ ...editMember, position: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          value={editMember.description}
                          onChange={(e) => setEditMember({ ...editMember, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          value={editMember.department}
                          onChange={(e) => setEditMember({ ...editMember, department: e.target.value })}
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
                          value={editMember.displayOrder}
                          onChange={(e) => setEditMember({ ...editMember, displayOrder: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Display order (minimum 1)"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Profile Image
                        </label>
                        <FileUpload
                          onUpload={(filename) => setEditMember({ ...editMember, image: filename })}
                          uploadPath="team-images"
                          currentImage={editMember.image}
                        />
                      </div>
                      
                      <div className="md:col-span-2 flex justify-end space-x-3">
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdate}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {member.image ? (
                          <Image
                            src={getDisplayImageUrl(member.image, 'team-images')}
                            alt={member.name}
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
                            <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                            <p className="text-sm text-gray-600">{member.position}</p>
                            {member.department && (
                              <p className="text-xs text-gray-500">{member.department}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {member.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">Order: {member.displayOrder}</span>
                          </div>
                        </div>
                        
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{member.description}</p>
                      </div>
                      
                      <div className="flex-shrink-0 flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(member.id)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                            member.isActive
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {member.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => startEdit(member)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-full transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
