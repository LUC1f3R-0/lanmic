import { apiService } from './api';

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  description: string;
  image?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  email?: string;
  phone?: string;
  department?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateTeamMemberData {
  name: string;
  position: string;
  description: string;
  image?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  email?: string;
  phone?: string;
  department?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateTeamMemberData {
  name?: string;
  position?: string;
  description?: string;
  image?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  email?: string;
  phone?: string;
  department?: string;
  isActive?: boolean;
  displayOrder?: number;
}

class TeamApi {
  private baseUrl = '/team';

  /**
   * Get all team members (admin only)
   */
  async getAllTeamMembers(): Promise<TeamMember[]> {
    return await apiService.request<TeamMember[]>(this.baseUrl, {
      method: 'GET',
    });
  }

  /**
   * Get active team members (public)
   */
  async getActiveTeamMembers(): Promise<TeamMember[]> {
    return await apiService.request<TeamMember[]>(`${this.baseUrl}/active`, {
      method: 'GET',
    });
  }

  /**
   * Get a specific team member by ID (admin only)
   */
  async getTeamMember(id: number): Promise<TeamMember> {
    return await apiService.request<TeamMember>(`${this.baseUrl}/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Create a new team member (admin only)
   */
  async createTeamMember(data: CreateTeamMemberData): Promise<TeamMember> {
    return await apiService.request<TeamMember>(this.baseUrl, {
      method: 'POST',
      data,
    });
  }

  /**
   * Update a team member (admin only)
   */
  async updateTeamMember(id: number, data: UpdateTeamMemberData): Promise<TeamMember> {
    return await apiService.request<TeamMember>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      data,
    });
  }

  /**
   * Delete a team member (admin only)
   */
  async deleteTeamMember(id: number): Promise<void> {
    await apiService.request<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Toggle active status of a team member (admin only)
   */
  async toggleActive(id: number): Promise<TeamMember> {
    return await apiService.request<TeamMember>(`${this.baseUrl}/${id}/active`, {
      method: 'PUT',
    });
  }
}

export const teamApi = new TeamApi();
