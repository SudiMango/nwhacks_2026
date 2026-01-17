import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  favoriteGenres: string[];
  readingFormat: 'library' | 'ebook' | 'both' | null;
  lastBookRead: string;
  onboardingCompleted: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;

  // Auth methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;

  // Onboarding
  completeOnboarding: (profile: Partial<UserProfile>) => Promise<void>;
  skipOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = user !== null;
  const isOnboarded = user?.onboardingCompleted ?? false;

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Connect to Supabase
      // For now, simulate sign in
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUser({
        id: '1',
        email,
        name: '',
        favoriteGenres: [],
        readingFormat: null,
        lastBookRead: '',
        onboardingCompleted: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Connect to Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUser({
        id: '1',
        email,
        name: '',
        favoriteGenres: [],
        readingFormat: null,
        lastBookRead: '',
        onboardingCompleted: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // TODO: Connect to Supabase Google OAuth
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUser({
        id: '1',
        email: 'user@gmail.com',
        name: '',
        favoriteGenres: [],
        readingFormat: null,
        lastBookRead: '',
        onboardingCompleted: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // TODO: Connect to Supabase
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (profile: Partial<UserProfile>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // TODO: Save to Supabase
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUser({
        ...user,
        ...profile,
        onboardingCompleted: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const skipOnboarding = () => {
    if (!user) return;

    setUser({
      ...user,
      name: user.name || 'Reader',
      onboardingCompleted: true,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isOnboarded,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        completeOnboarding,
        skipOnboarding,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
