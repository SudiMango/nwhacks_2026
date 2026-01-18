import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";

const BACKEND_URL = "http://172.20.10.8:8000";
const TOKEN_KEY = "auth_token";

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
    signOut: () => Promise<void>;
    completeOnboarding: (profile: Partial<UserProfile>) => Promise<void>;
    skipOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchWithAuth(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)[
            "Authorization"
        ] = `Bearer ${token}`;
    }

    return fetch(`${BACKEND_URL}${endpoint}`, { ...options, headers });
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserFromToken = async () => {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token) {
                try {
                    const response = await fetchWithAuth("/users/me");
                    if (response.ok) {
                        const profile = await response.json();
                        setUser(profile);
                    } else {
                        await SecureStore.deleteItemAsync(TOKEN_KEY);
                    }
                } catch (e) {
                    console.error("Failed to fetch user profile", e);
                }
            }
            setIsLoading(false);
        };

        loadUserFromToken();
    }, []);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Sign in failed");
            }

            const { accessToken } = data;
            if (!accessToken) {
                throw new Error("No access token in response");
            }

            await SecureStore.setItemAsync(TOKEN_KEY, accessToken);

            // Fetch user profile after successful login
            const profileResponse = await fetchWithAuth("/users/me");
            if (profileResponse.ok) {
                const profile = await profileResponse.json();
                setUser(profile);
            }
        } catch (error: any) {
            console.error("Sign in error:", error);
            Alert.alert("Sign In Failed", error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}/users/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const response2 = await fetch(`${BACKEND_URL}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            console.log(response2);
            const data = await response2.json();

            if (!response2.ok) {
                throw new Error(data.detail || "Sign up failed");
            }

            const { accessToken } = data;
            if (!accessToken) {
                throw new Error("No access token in response");
            }

            await SecureStore.setItemAsync(TOKEN_KEY, accessToken);

            // Fetch user profile after successful signup
            const profileResponse = await fetchWithAuth("/users/me");
            if (profileResponse.ok) {
                const profile = await profileResponse.json();
                setUser(profile);
            }
        } catch (error: any) {
            console.error("Sign up error:", error);
            Alert.alert("Sign Up Failed", error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        setUser(null);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    };

    const completeOnboarding = async (profile: Partial<UserProfile>) => {
        if (!user) return;

        setIsLoading(true);
        try {
            const response = await fetchWithAuth("/users/me", {
                method: "PATCH",
                body: JSON.stringify({
                    display_name: profile.name,
                    favorite_genres: profile.favoriteGenres,
                    reading_format: profile.readingFormat,
                    onboarding_completed: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to update profile");
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
        } catch (error: any) {
            console.error("Onboarding error:", error);
            Alert.alert("Onboarding Failed", error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const skipOnboarding = () => {
        if (!user) return;
        setUser({
            ...user,
            name: user.name || "Reader",
            onboardingCompleted: true,
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isOnboarded: user?.onboardingCompleted ?? false,
                isLoading,
                signIn,
                signUp,
                signOut,
                completeOnboarding,
                skipOnboarding,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
