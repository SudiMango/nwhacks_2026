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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: (profile: Partial<UserProfile>) => Promise<void>;
  skipOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Stub auth provider. All methods are no-ops; user is always unauthenticated.
 * This replaces the previous Supabase-based implementation so you can rebuild auth.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const noOp = async () => {};

  const completeOnboarding = async (profile: Partial<UserProfile>) => {
    // simple local merge to keep app flows working
    setUser((prev) => {
      const base: UserProfile = {
        id: 'local',
        email: '',
        name: '',
        favoriteGenres: [],
        readingFormat: null,
        lastBookRead: '',
        onboardingCompleted: false,
      };
      return { ...(prev || base), ...profile, onboardingCompleted: true };
    });
  };

  const skipOnboarding = () => {
    setUser((prev) => {
      const base: UserProfile = {
        id: 'local',
        email: '',
        name: '',
        favoriteGenres: [],
        readingFormat: null,
        lastBookRead: '',
        onboardingCompleted: false,
      };
      return { ...(prev || base), onboardingCompleted: true };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: false,
        isOnboarded: user?.onboardingCompleted ?? false,
        isLoading,
        signIn: noOp,
        signUp: noOp,
        signInWithGoogle: noOp,
        signOut: noOp,
        completeOnboarding,
        skipOnboarding,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
