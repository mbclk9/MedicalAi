import { QueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Tüm API istekleri için merkezi fonksiyon.
 * - URL'ye otomatik olarak /api önekini ekler.
 * - Hata yönetimini merkezileştirir.
 * - Yanıtı otomatik olarak JSON'a çevirir.
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

    if (!response.ok) {
      // Hata durumunda sunucudan gelen mesajı yakala
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status} ${response.statusText}`,
      }));
      throw new Error(errorData.message || 'Bilinmeyen bir sunucu hatası oluştu.');
    }
    
    // Yanıt gövdesi boş olabileceğinden (örn: 204 No Content) kontrol et
    if (response.status === 204) {
      return null;
    }

    return response.json();

  } catch (error) {
    console.error("API Request Error:", error);
    // Hatanın yeniden fırlatılması, React Query'nin onError callback'lerini tetikler.
    throw error;
  }
}

// Yeni QueryClient yapılandırması
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Varsayılan sorgu fonksiyonu artık doğrudan apiRequest'i kullanıyor.
      // queryKey'den gelen ilk elemanı URL olarak alıp GET isteği atacak.
      queryFn: ({ queryKey: [url] }) => apiRequest('GET', url as string),
      refetchOnWindowFocus: false, // Gereksiz yeniden fetch'leri önler
      staleTime: 1000 * 60 * 5, // Veriyi 5 dakika taze kabul et
      retry: 1, // Hata durumunda 1 kez yeniden dene
    },
    mutations: {
      // Varsayılan mutation fonksiyonunu da tanımlayabiliriz ancak genellikle
      // useMutation içinde doğrudan çağrılır.
      retry: false,
    },
  },
});