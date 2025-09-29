import { config } from './config';
import { apiService } from './api';

export interface ExecutiveLeadership {
  id: number;
  name: string;
  position: string;
  description: string;
  image?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateExecutiveLeadershipData {
  name: string;
  position: string;
  description: string;
  image?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateExecutiveLeadershipData {
  name?: string;
  position?: string;
  description?: string;
  image?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

class ExecutiveApi {
  private baseUrl = '/executive';

  /**
   * Get all executive leadership (admin only)
   */
  async getAllExecutiveLeadership(): Promise<ExecutiveLeadership[]> {
    return await apiService.request<ExecutiveLeadership[]>(this.baseUrl, {
      method: 'GET',
    });
  }

  /**
   * Get active executive leadership (public)
   */
  async getActiveExecutiveLeadership(): Promise<ExecutiveLeadership[]> {
    return await apiService.request<ExecutiveLeadership[]>(`${this.baseUrl}/active`, {
      method: 'GET',
    });
  }

  /**
   * Get a specific executive leadership by ID (admin only)
   */
  async getExecutiveLeadership(id: number): Promise<ExecutiveLeadership> {
    return await apiService.request<ExecutiveLeadership>(`${this.baseUrl}/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Create a new executive leadership (admin only)
   */
  async createExecutiveLeadership(data: CreateExecutiveLeadershipData): Promise<ExecutiveLeadership> {
    return await apiService.request<ExecutiveLeadership>(this.baseUrl, {
      method: 'POST',
      data,
    });
  }

  /**
   * Update an executive leadership (admin only)
   */
  async updateExecutiveLeadership(id: number, data: UpdateExecutiveLeadershipData): Promise<ExecutiveLeadership> {
    return await apiService.request<ExecutiveLeadership>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      data,
    });
  }

  /**
   * Delete an executive leadership (admin only)
   */
  async deleteExecutiveLeadership(id: number): Promise<void> {
    await apiService.request<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Toggle active status of an executive leadership (admin only)
   */
  async toggleActive(id: number): Promise<ExecutiveLeadership> {
    return await apiService.request<ExecutiveLeadership>(`${this.baseUrl}/${id}/active`, {
      method: 'PUT',
    });
  }
}

export const executiveApi = new ExecutiveApi();
