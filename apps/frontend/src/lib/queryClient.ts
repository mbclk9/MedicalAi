import { QueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Tüm API istekleri için merkezi ve sağlamlaştırılmış fonksiyon.
 */
export async function apiRequest(method: string, url: string, data?: unknown): Promise<any> {
  const isFormData = data instanceof FormData;
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;

  try {
    const response = await fetch(fullUrl, {
      method: method.toUpperCase(),
      headers: isFormData ? {} : data ? { "Content-Type": "application/json" } : {},
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    // Hata durumunu yönet
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP hatası! Durum: ${response.status} ${response.statusText}`,
      }));
      throw new Error(errorData.message || 'Bilinmeyen bir sunucu hatası oluştu.');
    }
    
    // *** ÇÖZÜM BURADA ***
    // Başarılı yanıtın gövdesinin boş olup olmadığını kontrol et.
    const contentType = response.headers.get("content-type");
    if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
      // 204 No Content ise veya yanıt JSON değilse, gövdeyi işlemeye çalışma.
      return null;
    }

    // Yanıtın gövdesi varsa ve JSON ise, işle.
    return response.json();

  } catch (error) {
    console.error("API İstek Hatası:", url, error);
    throw error; // Hatanın React Query tarafından yakalanması için yeniden fırlat.
  }
}

// QueryClient yapılandırması aynı kalabilir.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey: [url] }) => apiRequest('GET', url as string),
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});