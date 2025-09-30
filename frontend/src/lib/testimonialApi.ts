import { apiService } from './api';

export interface Testimonial {
  id: number;
  name: string;
  position?: string;
  company?: string;
  content: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonialData {
  name: string;
  position?: string;
  company?: string;
  content: string;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdateTestimonialData {
  name?: string;
  position?: string;
  company?: string;
  content?: string;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
}

class TestimonialApi {
  private baseUrl = '/testimonials';

  /**
   * Get all testimonials (admin only)
   */
  async getAllTestimonials(): Promise<Testimonial[]> {
    return await apiService.request<Testimonial[]>(this.baseUrl, {
      method: 'GET',
    });
  }

  /**
   * Get active testimonials (public)
   */
  async getActiveTestimonials(): Promise<Testimonial[]> {
    return await apiService.request<Testimonial[]>(`${this.baseUrl}/active`, {
      method: 'GET',
    });
  }

  /**
   * Get a specific testimonial by ID (admin only)
   */
  async getTestimonial(id: number): Promise<Testimonial> {
    return await apiService.request<Testimonial>(`${this.baseUrl}/${id}`, {
      method: 'GET',
    });
  }

  /**
   * Create a new testimonial (admin only)
   */
  async createTestimonial(data: CreateTestimonialData): Promise<Testimonial> {
    return await apiService.request<Testimonial>(this.baseUrl, {
      method: 'POST',
      data,
    });
  }

  /**
   * Update a testimonial (admin only)
   */
  async updateTestimonial(id: number, data: UpdateTestimonialData): Promise<Testimonial> {
    return await apiService.request<Testimonial>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      data,
    });
  }

  /**
   * Delete a testimonial (admin only)
   */
  async deleteTestimonial(id: number): Promise<void> {
    await apiService.request<void>(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Toggle active status of a testimonial (admin only)
   */
  async toggleActive(id: number): Promise<Testimonial> {
    return await apiService.request<Testimonial>(`${this.baseUrl}/${id}/active`, {
      method: 'PUT',
    });
  }
}

export const testimonialApi = new TestimonialApi();
