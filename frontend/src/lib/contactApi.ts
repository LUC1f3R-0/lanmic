import { config } from './config';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
}

export interface ContactResponse {
  message: string;
  success: boolean;
}

class ContactApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const requestConfig: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(`${config.api.baseURL}${endpoint}`, requestConfig);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async submitContactForm(formData: ContactFormData): Promise<ContactResponse> {
    return this.request<ContactResponse>('/contact', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }
}

export const contactApiService = new ContactApiService();
