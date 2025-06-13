import { env } from "@/env";

// Enhanced response wrapper for better error handling
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.NEXT_PUBLIC_API_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        success: false,
        error: "Network error",
      }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();

    // Handle backend API response format
    if (result.success === false) {
      throw new Error(result.error || "API request failed");
    }

    return result;
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();
