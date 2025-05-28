interface WordPressConfig {
  url: string;
  username: string;
  password: string; // Application password
}

interface WordPressPost {
  title: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'publish' | 'private';
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  meta?: {
    [key: string]: any;
  };
}

interface WordPressResponse {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  status: string;
  link: string;
  date: string;
  modified: string;
}

export class WordPressService {
  private config: WordPressConfig;
  private baseUrl: string;

  constructor(config: WordPressConfig) {
    this.config = config;
    this.baseUrl = `${config.url.replace(/\/$/, '')}/wp-json/wp/v2`;
  }

  private getAuthHeaders(): HeadersInit {
    const credentials = btoa(`${this.config.username}:${this.config.password}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const user = await response.json();
        return {
          success: true,
          message: `Connected successfully as ${user.name}`,
        };
      } else {
        return {
          success: false,
          message: `Authentication failed: ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async createPost(post: WordPressPost): Promise<WordPressResponse> {
    const response = await fetch(`${this.baseUrl}/posts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create post: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async updatePost(postId: number, post: Partial<WordPressPost>): Promise<WordPressResponse> {
    const response = await fetch(`${this.baseUrl}/posts/${postId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(post),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update post: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async deletePost(postId: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/posts/${postId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return response.ok;
  }

  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    const response = await fetch(`${this.baseUrl}/categories`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  async createCategory(name: string, slug?: string): Promise<{ id: number; name: string; slug: string }> {
    const response = await fetch(`${this.baseUrl}/categories`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create category: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async getTags(): Promise<Array<{ id: number; name: string; slug: string }>> {
    const response = await fetch(`${this.baseUrl}/tags`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }

    return response.json();
  }

  async createTag(name: string, slug?: string): Promise<{ id: number; name: string; slug: string }> {
    const response = await fetch(`${this.baseUrl}/tags`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create tag: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async uploadMedia(file: File, title?: string, altText?: string): Promise<{ id: number; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (altText) formData.append('alt_text', altText);

    const response = await fetch(`${this.baseUrl}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to upload media: ${error.message || response.statusText}`);
    }

    const media = await response.json();
    return {
      id: media.id,
      url: media.source_url,
    };
  }

  async getPosts(params?: {
    status?: string;
    per_page?: number;
    page?: number;
    search?: string;
  }): Promise<WordPressResponse[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(`${this.baseUrl}/posts?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return response.json();
  }
}

export default WordPressService; 