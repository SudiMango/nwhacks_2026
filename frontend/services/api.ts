import { Book } from '@/data/mockData';

// Configure your backend URL here
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

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
