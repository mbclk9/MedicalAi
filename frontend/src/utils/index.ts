/**
 * TıpScribe Utility Functions
 * Common helper functions used throughout the application
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind CSS class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Istanbul',
  };

  return new Intl.DateTimeFormat('tr-TR', { ...defaultOptions, ...options }).format(dateObj);
};

export const formatTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  }).format(dateObj);
};

export const formatDateTime = (date: Date | string) => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

// TC Kimlik validation
export const validateTCKimlik = (tcKimlik: string): boolean => {
  if (!tcKimlik || tcKimlik.length !== 11) return false;
  
  const digits = tcKimlik.split('').map(Number);
  
  // First digit cannot be 0
  if (digits[0] === 0) return false;
  
  // TC Kimlik algorithm check
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  
  const checkDigit1 = ((oddSum * 7) - evenSum) % 10;
  const checkDigit2 = (oddSum + evenSum + digits[9]) % 10;
  
  return digits[9] === checkDigit1 && digits[10] === checkDigit2;
};

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('90')) {
    const number = cleaned.slice(2);
    return `+90 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 8)} ${number.slice(8, 10)}`;
  }
  
  if (cleaned.startsWith('0')) {
    const number = cleaned.slice(1);
    return `+90 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 8)} ${number.slice(8, 10)}`;
  }
  
  return `+90 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
};

// Age calculation
export const calculateAge = (birthDate: Date | string): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Duration formatting
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Text processing utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  return text.split(' ').map(capitalizeFirst).join(' ');
};

// Medical specialty translations
export const getSpecialtyDisplayName = (specialty: string): string => {
  const specialtyMap: Record<string, string> = {
    'dahiliye': 'Dahiliye',
    'kardiyoloji': 'Kardiyoloji',
    'noroloji': 'Nöroloji',
    'endokrinoloji': 'Endokrinoloji',
    'gastroenteroloji': 'Gastroenteroloji',
    'gogus-hastaliklari': 'Göğüs Hastalıkları',
    'uroloji': 'Üroloji',
    'kadin-dogum': 'Kadın Doğum',
    'cocuk-sagligi': 'Çocuk Sağlığı ve Hastalıkları',
    'psikiyatri': 'Psikiyatri',
    'dermatoloji': 'Dermatoloji',
    'goz-hastaliklari': 'Göz Hastalıkları',
    'kbb': 'Kulak Burun Boğaz',
    'ortopedi': 'Ortopedi',
    'genel-cerrahi': 'Genel Cerrahi',
  };
  
  return specialtyMap[specialty.toLowerCase()] || capitalizeWords(specialty);
};

// Visit type translations
export const getVisitTypeDisplayName = (visitType: string): string => {
  const visitTypeMap: Record<string, string> = {
    'ilk': 'İlk Muayene',
    'kontrol': 'Kontrol Muayenesi',
    'konsultasyon': 'Konsültasyon',
  };
  
  return visitTypeMap[visitType] || capitalizeWords(visitType);
};

// Status badge styling
export const getStatusBadgeVariant = (status: string): string => {
  const statusVariants: Record<string, string> = {
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800',
  };
  
  return statusVariants[status] || 'bg-gray-100 text-gray-800';
};

// Audio utilities
export const createAudioBlob = (chunks: BlobPart[], mimeType = 'audio/webm'): Blob => {
  return new Blob(chunks, { type: mimeType });
};

export const downloadFile = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Local storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch {
      return defaultValue ?? null;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Error handling utilities
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Bilinmeyen bir hata oluştu';
};

// Medical note text processing
export const cleanMedicalText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/([.!?])\s*([a-zçğıöşü])/gi, '$1 $2') // Fix spacing after punctuation
    .trim();
};

export const extractKeywords = (text: string): string[] => {
  const stopWords = new Set([
    'bir', 'bu', 'şu', 've', 'ile', 'için', 'da', 'de', 'ta', 'te',
    'den', 'dan', 'lar', 'ler', 'ya', 'ye', 'na', 'ne', 'nin', 'nun',
    'si', 'sı', 'su', 'sü', 'ki', 'mi', 'mı', 'mu', 'mü'
  ]);
  
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
    .slice(0, 10); // Limit to 10 keywords
};