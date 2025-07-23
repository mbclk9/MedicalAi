import { QueryClient } from "@tanstack/react-query";

// Production'da Vercel'deki tam backend URL'sini, local'de ise boş string (proxy'yi kullanmak için) alır.
const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Tüm API istekleri için merkezi ve DÜZELTİLMİŞ fonksiyon.
 * - URL'ye /api önekini her zaman doğru şekilde ekler.
 * - Hata yönetimini merkezileştirir.
 * - Yanıtı otomatik olarak JSON'a çevirir.
 */
export async function apiRequest(method: string, url: string, data?: unknown): Promise<any> {
  const isFormData = data instanceof FormData;
  
  // Gelen URL'nin başında / olduğundan emin olalım (örn: /patients)
  const path = url.startsWith('/') ? url : `/${url}`;
  
  // NİHAİ DÜZELTME: API_BASE'i ve /api önekini doğru şekilde birleştir.
  // Production'da: 'https://backend.vercel.app' + '/api' + '/patients'
  // Local'de: '' + '/api' + '/patients' (proxy bunu yakalar)
  const fullUrl = `${API_BASE}/api${path}`;

  try {
    const response = await fetch(fullUrl, {
      method: method.toUpperCase(),
      headers: isFormData ? {} : data ? { "Content-Type": "application/json" } : {},
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP Hatası! Durum: ${response.status}`,
      }));
      throw new Error(errorData.message || 'Bilinmeyen bir sunucu hatası oluştu.');
    }
    
    if (response.status === 204) {
      return null;
    }

    return response.json();

  } catch (error) {
    console.error("API İstek Hatası:", url, error);
    throw error;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Artık URL'nin başında /api olmasına gerek yok, apiRequest fonksiyonu bunu hallediyor.
      // Örn: queryKey: ["/patients"]
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