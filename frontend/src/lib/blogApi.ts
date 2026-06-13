import { BlogPost } from '@/contexts/BlogContext';
import { apiService } from './api';

class BlogApiService {
  private async uploadFile(
    file: File,
    fieldName: string = 'file',
  ): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

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

    const axiosInstance = apiService.getAxiosInstance();

    const response = await axiosInstance.post(
      `/upload/image?type=${uploadType}`,
      formData,
    );

    return response.data.url;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return apiService.request<BlogPost[]>('/blog', {
      method: 'GET',
    });
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return apiService.request<BlogPost[]>('/blog/published', {
      method: 'GET',
    });
  }

  async getBlogPost(id: number): Promise<BlogPost> {
    return apiService.request<BlogPost>(`/blog/${id}`, {
      method: 'GET',
    });
  }

  async createBlogPost(
    postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BlogPost> {
    return apiService.request<BlogPost>('/blog', {
      method: 'POST',
      data: postData,
    });
  }

  async updateBlogPost(
    id: number,
    postData: Partial<BlogPost>,
  ): Promise<BlogPost> {
    return apiService.request<BlogPost>(`/blog/${id}`, {
      method: 'PUT',
      data: postData,
    });
  }

  async deleteBlogPost(id: number): Promise<void> {
    return apiService.request<void>(`/blog/${id}`, {
      method: 'DELETE',
    });
  }

  async togglePublish(id: number): Promise<BlogPost> {
    return apiService.request<BlogPost>(`/blog/${id}/publish`, {
      method: 'PUT',
    });
  }

  async uploadImage(file: File, fieldName: string = 'file'): Promise<string> {
    return this.uploadFile(file, fieldName);
  }
}

export const blogApi = new BlogApiService();