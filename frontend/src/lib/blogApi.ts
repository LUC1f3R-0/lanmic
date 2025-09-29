import { BlogPost } from '@/contexts/BlogContext';
import { config } from './config';
import { apiService } from './api';

class BlogApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important: Include cookies in requests
      ...options,
    };

    const response = await fetch(`${config.api.baseURL}${endpoint}`, requestConfig);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async uploadFile(file: File, fieldName: string = 'file'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file); // Always use 'file' as the field name

    // Map field names to upload types
    let uploadType = 'file';
    if (fieldName === 'authorImage') {
      uploadType = 'authorImage';
    } else if (fieldName === 'blogImage') {
      uploadType = 'blogImage';
    } else if (fieldName === 'team-images') {
      uploadType = 'teamImage';
    } else if (fieldName === 'executiveImage') {
      uploadType = 'executiveImage';
    }

    // Use the authenticated axios instance from apiService
    const axiosInstance = apiService.getAxiosInstance();
    
    const response = await axiosInstance.post(`/upload/image?type=${uploadType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return this.request<BlogPost[]>('/blog');
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    // This endpoint should be public, so we don't need authentication
    const response = await fetch(`${config.api.baseURL}/blog/published`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getBlogPost(id: number): Promise<BlogPost> {
    return this.request<BlogPost>(`/blog/${id}`);
  }

  async createBlogPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
    return this.request<BlogPost>('/blog', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updateBlogPost(id: number, postData: Partial<BlogPost>): Promise<BlogPost> {
    return this.request<BlogPost>(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deleteBlogPost(id: number): Promise<void> {
    return this.request<void>(`/blog/${id}`, {
      method: 'DELETE',
    });
  }

  async togglePublish(id: number): Promise<BlogPost> {
    return this.request<BlogPost>(`/blog/${id}/publish`, {
      method: 'PUT',
    });
  }

  async uploadImage(file: File, fieldName: string = 'file'): Promise<string> {
    return this.uploadFile(file, fieldName);
  }
}

export const blogApi = new BlogApiService();
