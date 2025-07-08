import { QueryClient } from "@tanstack/react-query";

// Create a single query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.status >= 400 && error?.status < 500 && error?.status !== 408 && error?.status !== 429) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Enhanced API request function
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  data?: any,
  options: RequestInit = {}
): Promise<Response> {
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Handle FormData (for file uploads)
  if (data instanceof FormData) {
    // Remove Content-Type header for FormData (browser will set it with boundary)
    delete (config.headers as any)["Content-Type"];
    config.body = data;
  } else if (data && method !== "GET") {
    config.body = JSON.stringify(data);
  }

  console.log(`🌐 API Request: ${method} ${url}`, {
    data: data instanceof FormData ? 'FormData' : data,
    headers: config.headers
  });

  try {
    const response = await fetch(url, config);
    
    console.log(`📡 API Response: ${method} ${url} - ${response.status}`, {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = null;
      
      try {
        const errorData = await response.json();
        errorDetails = errorData;
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.error(`❌ API Error Details:`, errorData);
      } catch (parseError) {
        console.error(`❌ Failed to parse error response:`, parseError);
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorDetails;
      throw error;
    }

    return response;
  } catch (error) {
    console.error(`💥 API Request Failed: ${method} ${url}`, error);
    
    // Re-throw with additional context
    if (error instanceof Error) {
      const enhancedError = new Error(`API Request Failed: ${error.message}`);
      (enhancedError as any).originalError = error;
      (enhancedError as any).url = url;
      (enhancedError as any).method = method;
      throw enhancedError;
    }
    
    throw error;
  }
}

// Type-safe query keys
export const queryKeys = {
  patients: ['patients'] as const,
  patient: (id: number) => ['patients', id] as const,
  visits: ['visits'] as const,
  visit: (id: number) => ['visits', id] as const,
  recentVisits: ['visits', 'recent'] as const,
  templates: ['templates'] as const,
  template: (id: number) => ['templates', id] as const,
  doctor: (id: number) => ['doctor', id] as const,
  health: ['health'] as const,
} as const;