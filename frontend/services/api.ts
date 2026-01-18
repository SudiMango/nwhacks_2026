import { Book } from '@/data/mockData';

// Configure your backend URL here
// For mobile devices, use your computer's IP address instead of localhost
// e.g., 'http://192.168.1.100:8000'
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface VideoSubmitResponse {
  success: boolean;
  videoId: string;
  books: Book[];
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

/**
 * Update user's favorite genres
 */
export async function updateFavoriteGenres(userId: string, genres: string[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/favorite-genres`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ genres }),
  });

  if (!response.ok) {
    throw new Error('Failed to update favorite genres');
  }
}

/**
 * Update user's name
 */
export async function updateUserName(userId: string, name: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/name`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error('Failed to update name');
  }
}

/**
 * Update user's last book read
 */
export async function updateLastBookRead(userId: string, bookName: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/last-book`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ book_name: bookName }),
  });

  if (!response.ok) {
    throw new Error('Failed to update last book read');
  }
}

/**
 * Submit a TikTok URL to extract books from
 */
export async function submitTikTokUrl(url: string): Promise<VideoSubmitResponse> {
  const response = await fetch(`${API_BASE_URL}/api/videos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      platform: 'tiktok',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to submit video' }));
    throw new Error(error.message || 'Failed to submit video');
  }

  return response.json();
}

/**
 * Get books from a previously submitted video
 */
export async function getVideoBooks(videoId: string): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/books`);

  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  const data = await response.json();
  return data.books;
}

/**
 * Search for libraries near a location
 */
export async function searchLibraries(
  isbn: string,
  latitude: number,
  longitude: number
): Promise<any[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/libraries/search?isbn=${isbn}&lat=${latitude}&lng=${longitude}`
  );

  if (!response.ok) {
    throw new Error('Failed to search libraries');
  }

  const data = await response.json();
  return data.libraries;
}

/**
 * Search books using Google Books API
 */
export async function searchBooks(query: string, maxResults: number = 20): Promise<Book[]> {
  try {
    const url = `${API_BASE_URL}/get-book/search?q=${encodeURIComponent(query)}&max_results=${maxResults}`;
    console.log('Searching books at:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search books response error:', response.status, errorText);
      throw new Error(`Failed to search books: ${response.status}`);
    }

    const data = await response.json();
    console.log('Search books response:', data);
    
    if (!data.books || !Array.isArray(data.books)) {
      console.warn('Invalid response format:', data);
      return [];
    }
    
    // Convert Google Books API format to our Book format
    return data.books.map((book: any) => ({
      isbn: book.isbn || book.id || '',
      title: book.title || '',
      author: book.author || '',
      coverUrl: book.cover_url || '',
      description: book.description || '',
    }));
  } catch (error: any) {
    console.error('Error searching books:', error);
    if (error.message?.includes('Network request failed')) {
      console.error('Network error - make sure:');
      console.error('1. Backend server is running');
      console.error('2. API_BASE_URL is correct:', API_BASE_URL);
      console.error('3. For mobile, use your computer IP instead of localhost');
    }
    return [];
  }
}

/**
 * Find nearby libraries with book availability
 */
export async function findBookLibraries(
  isbn: string,
  latitude: number,
  longitude: number,
  maxDistance: number = 15
): Promise<any> {
  try {
    const url = `${API_BASE_URL}/books/find?isbn=${encodeURIComponent(isbn)}&lat=${latitude}&lng=${longitude}&max_distance=${maxDistance}`;
    console.log('Finding libraries at:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Find libraries response error:', response.status, errorText);
      throw new Error(`Failed to find libraries: ${response.status}`);
    }

    const data = await response.json();
    console.log('Find libraries response:', data);
    return data;
  } catch (error: any) {
    console.error('Error finding libraries:', error);
    throw error;
  }
}

/**
 * Validate if a URL is a valid TikTok URL
 */
export function isValidTikTokUrl(url: string): boolean {
  const tiktokPatterns = [
    /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
    /^https?:\/\/(vm|vt)\.tiktok\.com\/[\w]+/,
    /^https?:\/\/(www\.)?tiktok\.com\/t\/[\w]+/,
  ];

  return tiktokPatterns.some((pattern) => pattern.test(url));
}
