import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Book } from "@/data/mockData";
import { useAuth } from "./AuthContext";
import { fetchUserBooks, addUserBookToTbr, markBookRead, removeUserBook } from "@/services/api";

interface BooksContextType {
  tbrBooks: Book[];
  collectionBooks: Book[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addToTbr: (book: Book) => Promise<void>;
  removeFromTbr: (isbn: string) => Promise<void>;
  isInTbr: (isbn: string) => boolean;
  moveToCollection: (isbn: string) => Promise<void>;
  addToCollection: (book: Book) => Promise<void>;
  removeFromCollection: (isbn: string) => Promise<void>;
  isInCollection: (isbn: string) => boolean;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export function BooksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tbrBooks, setTbrBooks] = useState<Book[]>([]);
  const [collectionBooks, setCollectionBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadBooks = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [tbr, collection] = await Promise.all([
        fetchUserBooks(user.id, true),
        fetchUserBooks(user.id, false),
      ]);
      setTbrBooks(tbr);
      setCollectionBooks(collection);
    } catch (e) {
      console.warn("Failed to load user books", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [user?.id]);

  const addToTbr = async (book: Book) => {
    if (!user?.id) return;
    await addUserBookToTbr(user.id, book);
    await loadBooks();
  };

  const removeFromTbr = async (isbn: string) => {
    if (!user?.id) return;
    const bookId = findBookIdByIsbn(tbrBooks, isbn);
    await removeUserBook(user.id, bookId, isbn);
    await loadBooks();
  };

  const moveToCollection = async (isbn: string) => {
    if (!user?.id) return;
    const bookId = findBookIdByIsbn(tbrBooks, isbn);
    const book = findBookByIsbn(tbrBooks, isbn);
    await markBookRead(user.id, bookId, isbn, book as Book);
    await loadBooks();
  };

  const addToCollection = async (book: Book) => {
    if (!user?.id) return;
    // Mark as read immediately
    await addUserBookToTbr(user.id, book);
    await markBookRead(user.id, (book as any).book_id || (book as any).bookId, book.isbn, book);
    await loadBooks();
  };

  const removeFromCollection = async (isbn: string) => {
    if (!user?.id) return;
    const bookId = findBookIdByIsbn(collectionBooks, isbn);
    await removeUserBook(user.id, bookId, isbn);
    await loadBooks();
  };

  const isInTbr = (isbn: string) => tbrBooks.some((b) => b.isbn === isbn);
  const isInCollection = (isbn: string) => collectionBooks.some((b) => b.isbn === isbn);

  return (
    <BooksContext.Provider
      value={{
        tbrBooks,
        collectionBooks,
        isLoading,
        searchQuery,
        setSearchQuery,
        addToTbr,
        removeFromTbr,
        isInTbr,
        moveToCollection,
        addToCollection,
        removeFromCollection,
        isInCollection,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

function findBookIdByIsbn(list: Book[], isbn: string): string | undefined {
  const match = list.find((b) => b.isbn === isbn);
  return (match as any)?.book_id || (match as any)?.bookId;
}

function findBookByIsbn(list: Book[], isbn: string): Book | undefined {
  return list.find((b) => b.isbn === isbn);
}

export function useBooks() {
  const context = useContext(BooksContext);
  if (!context) throw new Error("useBooks must be used within a BooksProvider");
  return context;
}
