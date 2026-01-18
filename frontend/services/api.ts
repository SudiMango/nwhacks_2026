import { Book } from "@/data/mockData";
import { fetchWithAuth } from "@/context/AuthContext";
// Configure your backend URL here
// For mobile devices, use your computer's IP address instead of localhost
// e.g., 'http://192.168.1.100:8000'
const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://10.19.134.189:8000";

export interface VideoSubmitResponse {
    books: Book[];
}

export interface ApiError {
    message: string;
    code?: string;
}

/**
 * Update user's favorite genres
 */
export async function updateFavoriteGenres(
    userId: string,
    genres: string[]
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/users/${userId}/favorite-genres`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ genres }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update favorite genres");
    }
}

/**
 * Update user's preferred reading formats
 */
export async function updatePreferredFormats(
    userId: string,
    formats: string[]
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/users/${userId}/reading-formats`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ formats }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update reading formats");
    }
}

/**
 * Generate recommendations for a user
 */
export async function generateRecommendations(userId: string): Promise<any> {
    const response = await fetch(
        `${API_BASE_URL}/users/${userId}/recommendations`
    );

    if (!response.ok) {
        throw new Error("Failed to generate recommendations");
    }

    return response.json();
}

/**
 * Fetch recommendations for a user (also triggers generation server-side)
 */
export async function getRecommendations(
    userId: string
): Promise<{ recommendations: Book[] }> {
    const response = await fetch(
        `${API_BASE_URL}/users/${userId}/recommendations`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
    }

    return response.json();
}

/**
 * Add a book to a user's TBR (also syncs user_books)
 */
export async function addUserBookToTbr(
    userId: string,
    book: Book
): Promise<void> {
    const payload = {
        book_id: (book as any).book_id || (book as any).bookId,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        description: book.description,
    };

    const response = await fetch(`${API_BASE_URL}/users/${userId}/tbr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Failed to add book to TBR");
    }
}

/**
 * Mark a TBR book as read (sets tbr = false in user_books)
 */
export async function markBookRead(
    userId: string,
    bookId?: string,
    isbn?: string,
    book?: Book
): Promise<void> {
    const payload = {
        book_id: bookId || (book as any)?.book_id || (book as any)?.bookId,
        isbn: isbn || book?.isbn,
        title: book?.title,
        author: book?.author,
        cover_url: book?.cover_url,
        description: book?.description,
    };

    const response = await fetch(
        `${API_BASE_URL}/users/${userId}/tbr/mark-read`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to mark book as read");
    }
}

export async function removeUserBook(
    userId: string,
    bookId?: string,
    isbn?: string
): Promise<void> {
    const targetId = bookId || "00000000-0000-0000-0000-000000000000";
    const url = new URL(`${API_BASE_URL}/users/${userId}/tbr/${targetId}`);
    if (isbn) url.searchParams.set("isbn", isbn);

    const response = await fetch(url.toString(), {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to remove book");
    }
}

/**
 * Fetch user_books entries. If tbrOnly is true, returns only TBR entries; if false, only collection.
 */
export async function fetchUserBooks(
    userId: string,
    tbrOnly: boolean
): Promise<Book[]> {
    const url = new URL(`${API_BASE_URL}/users/${userId}/tbr`);
    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error("Failed to fetch user books");
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    const filtered = data.filter((item: any) => {
        return tbrOnly ? item.tbr === true : item.tbr === false;
    });

    return filtered.map((item: any) => ({
        isbn: item.isbn || "",
        title: item.title || "",
        author: item.author || "",
        cover_url: item.cover_url || item.cover_url || "",
        description: item.description || "",
        book_id: item.book_id || item.bookId,
        bookId: item.book_id || item.bookId,
        tbr: item.tbr,
    }));
}

/**
 * Update user's name
 */
export async function updateUserName(
    userId: string,
    name: string
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/name`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        throw new Error("Failed to update name");
    }
}

/**
 * Update user's last book read
 */
export async function updateLastBookRead(
    userId: string,
    bookName: string
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/last-book`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ book_name: bookName }),
    });

    if (!response.ok) {
        throw new Error("Failed to update last book read");
    }
}

/**
 * Submit a TikTok URL to extract books from
 */
export async function submitTikTokUrl(
    url: string
): Promise<VideoSubmitResponse> {
    try {
        const response = await fetchWithAuth("/get-book/from-tiktok", {
            method: "POST",
            body: JSON.stringify({
                tiktok_url: url,
            }),
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${await response.text()}`
            );
        }

        return response.json();
    } catch (error) {
        console.error("submitTikTokUrl error:", error);
        throw error;
    }
}

/**
 * Get books from a previously submitted video
 */
export async function getVideoBooks(videoId: string): Promise<Book[]> {
    const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/books`);

    if (!response.ok) {
        throw new Error("Failed to fetch books");
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
        throw new Error("Failed to search libraries");
    }

    const data = await response.json();
    return data.libraries;
}

/**
 * Search books using Google Books API
 */
export async function searchBooks(
    query: string,
    maxResults: number = 20
): Promise<Book[]> {
    try {
        const url = `${API_BASE_URL}/get-book/search?q=${encodeURIComponent(
            query
        )}&max_results=${maxResults}`;
        console.log("Searching books at:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "Search books response error:",
                response.status,
                errorText
            );
            throw new Error(`Failed to search books: ${response.status}`);
        }

        const data = await response.json();
        console.log("Search books response:", data);

        // Handle both { books: [...] } and direct array response
        let booksArray = data.books;
        if (!booksArray && Array.isArray(data)) {
            booksArray = data;
        }

        if (!booksArray || !Array.isArray(booksArray)) {
            console.warn("Invalid response format:", data);
            return [];
        }

        // Convert Google Books API format to our Book format
        return booksArray.map((book: any) => ({
            isbn: book.isbn || book.id || "",
            title: book.title || "",
            author: book.author || "",
            cover_url: book.cover_url || "",
            description: book.description || "",
        }));
    } catch (error: any) {
        console.error("Error searching books:", error);
        if (error.message?.includes("Network request failed")) {
            console.error("Network error - make sure:");
            console.error("1. Backend server is running");
            console.error("2. API_BASE_URL is correct:", API_BASE_URL);
            console.error(
                "3. For mobile, use your computer IP instead of localhost"
            );
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
    maxDistance: number = 10
): Promise<any> {
    try {
        const url = `${API_BASE_URL}/get-book/find?isbn=${encodeURIComponent(
            isbn
        )}&lat=${latitude}&lng=${longitude}&max_distance=${maxDistance}`;
        console.log("Finding libraries at:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                "Find libraries response error:",
                response.status,
                errorText
            );
            throw new Error(`Failed to find libraries: ${response.status}`);
        }

        const data = await response.json();
        console.log("Find libraries response:", data);
        return data;
    } catch (error: any) {
        console.error("Error finding libraries:", error);
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

export interface RecommendedBook {
    id: string | null;
    title: string;
    author: string;
    description: string;
    cover_url: string;
    isbn: string | null;
    page_count: number | null;
    published_date: string;
    categories?: string[];
    recommended_title?: string;
    recommended_author?: string;
    not_found_on_google_books?: boolean;
}

/**
 * Get AI-powered book recommendations based on a natural language query
 */
export async function getBookRecommendations(
    query: string,
    favoriteGenres?: string[],
    recentBooks?: string[],
    count: number = 8
): Promise<RecommendedBook[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/get-book/recommend`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                favorite_genres: favoriteGenres,
                recent_books: recentBooks,
                count,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Recommend books error:", response.status, errorText);
            throw new Error(
                `Failed to get recommendations: ${response.status}`
            );
        }

        const data = await response.json();
        console.log("Recommendations response:", data);

        return data.books || [];
    } catch (error: any) {
        console.error("Error getting recommendations:", error);
        throw error;
    }
}
