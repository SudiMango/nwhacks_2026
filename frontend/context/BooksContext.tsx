import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Book, mockCollectionBooks } from "@/data/mockData";
import { fetchWithAuth } from "./AuthContext";

interface BooksContextType {
    // TBR (To Be Read) - books user wants to read
    tbrBooks: Book[];
    addToTbr: (book: Book) => void;
    removeFromTbr: (isbn: string) => void;
    isInTbr: (isbn: string) => boolean;
    moveToCollection: (isbn: string) => void;

    // Collection - books user has read/owns
    collectionBooks: Book[];
    addToCollection: (book: Book) => void;
    removeFromCollection: (isbn: string) => void;
    isInCollection: (isbn: string) => boolean;

    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Loading state
    isLoading: boolean;
    fetchMyBooks: () => void;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export function BooksProvider({ children }: { children: ReactNode }) {
    const [tbrBooks, setTbrBooks] = useState<Book[]>([]);
    const [collectionBooks, setCollectionBooks] =
        useState<Book[]>(mockCollectionBooks);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchMyBooks = async () => {
        console.log("loading books mine...");
        try {
            setIsLoading(true);
            const response = await fetchWithAuth("/get-book/my-books");
            if (!response.ok) {
                throw new Error("Failed to fetch books");
            }
            const books = await response.json();

            // Separate books by tbr status
            const tbr = books.filter((book: any) => book.tbr === true);
            const collection = books.filter((book: any) => book.tbr === false);

            setTbrBooks(tbr);
            setCollectionBooks(collection);

            console.log(tbrBooks);
        } catch (error) {
            console.error("Error fetching books:", error);
            // Keep mock data as fallback
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch user's books whenever tab is focused
    useEffect(() => {
        fetchMyBooks();
    }, []);

    // TBR functions
    const addToTbr = (book: Book) => {
        setTbrBooks((prev) => {
            if (prev.find((b) => b.isbn === book.isbn)) {
                return prev;
            }
            return [...prev, book];
        });
    };

    const removeFromTbr = (isbn: string) => {
        setTbrBooks((prev) => prev.filter((b) => b.isbn !== isbn));
    };

    const isInTbr = (isbn: string) => {
        return tbrBooks.some((b) => b.isbn === isbn);
    };

    const moveToCollection = (isbn: string) => {
        const book = tbrBooks.find((b) => b.isbn === isbn);
        if (book) {
            removeFromTbr(isbn);
            addToCollection(book);
        }
    };

    // Collection functions
    const addToCollection = (book: Book) => {
        setCollectionBooks((prev) => {
            if (prev.find((b) => b.isbn === book.isbn)) {
                return prev;
            }
            return [...prev, book];
        });
    };

    const removeFromCollection = (isbn: string) => {
        setCollectionBooks((prev) => prev.filter((b) => b.isbn !== isbn));
    };

    const isInCollection = (isbn: string) => {
        return collectionBooks.some((b) => b.isbn === isbn);
    };

    return (
        <BooksContext.Provider
            value={{
                tbrBooks,
                addToTbr,
                removeFromTbr,
                isInTbr,
                moveToCollection,
                collectionBooks,
                addToCollection,
                removeFromCollection,
                isInCollection,
                searchQuery,
                setSearchQuery,
                isLoading,
                fetchMyBooks,
            }}
        >
            {children}
        </BooksContext.Provider>
    );
}

export function useBooks() {
    const context = useContext(BooksContext);
    if (context === undefined) {
        throw new Error("useBooks must be used within a BooksProvider");
    }
    return context;
}
