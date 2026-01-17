import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Book } from '@/data/mockData';

interface BooksContextType {
  savedBooks: Book[];
  addBook: (book: Book) => void;
  removeBook: (bookId: string) => void;
  isBookSaved: (bookId: string) => boolean;
}

const BooksContext = createContext<BooksContextType | undefined>(undefined);

export function BooksProvider({ children }: { children: ReactNode }) {
  const [savedBooks, setSavedBooks] = useState<Book[]>([]);

  const addBook = (book: Book) => {
    setSavedBooks((prev) => {
      if (prev.find((b) => b.id === book.id)) {
        return prev;
      }
      return [...prev, book];
    });
  };

  const removeBook = (bookId: string) => {
    setSavedBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  const isBookSaved = (bookId: string) => {
    return savedBooks.some((b) => b.id === bookId);
  };

  return (
    <BooksContext.Provider value={{ savedBooks, addBook, removeBook, isBookSaved }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BooksProvider');
  }
  return context;
}
