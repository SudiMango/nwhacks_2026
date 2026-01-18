import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { supabase } from "../lib/supabase";
import { Alert } from "react-native";

// 1. Critical: Allows the browser popup to close itself correctly
WebBrowser.maybeCompleteAuthSession();

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    favoriteGenres: string[];
    readingFormat: "library" | "ebook" | "both" | null;
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

const BACKEND_URL = "YOUR_BACKEND_URL"; // Update this for your FastAPI server

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initial load: Check for existing session
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    await loadUserProfile(session.user.id);
                } else {
                    setUser(null);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const loadUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) throw error;

            setUser({
                id: data.id,
                email: data.email,
                name: data.display_name || "",
                favoriteGenres: data.favorite_genres || [],
                readingFormat: data.reading_format || null,
                lastBookRead: data.last_book_read || "",
                onboardingCompleted: data.onboarding_completed || false,
            });
        } catch (error) {
            console.error("Profile load error:", error);
        }
    };

    const signInWithGoogle = async () => {
        setIsLoading(true);
        try {
            console.log("1. Starting Google sign-in");
            const redirectUrl = "frontend://google-auth";

            console.log("2. Creating OAuth request");
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            console.log("3. OAuth request created");
            if (error) throw error;

            console.log("4. Opening browser");
            const result = await WebBrowser.openAuthSessionAsync(
                data.url,
                redirectUrl
            );

            console.log("5. Browser returned");

            if (result.type === "success") {
                const { url } = result;

                console.log("6. Parsing tokens from URL");
                const getParam = (name: string) => {
                    const regex = new RegExp(`[#?&]${name}=([^&]*)`);
                    const match = url.match(regex);
                    return match ? decodeURIComponent(match[1]) : null;
                };

                const accessToken = getParam("access_token");
                const refreshToken = getParam("refresh_token");

                console.log("7. Tokens extracted");
                console.log("   Access Token length:", accessToken?.length);
                console.log("   Refresh Token:", refreshToken);

                if (!accessToken) {
                    throw new Error("No access token received from Google");
                }

                console.log("8. Setting session with tokens");

                try {
                    // setSession returns the session directly, not {data, error}
                    const session = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken || "",
                    });

                    console.log("9. Session set successfully");
                    console.log("11. Session data:", session);

                    // The onAuthStateChange listener will automatically
                    // pick up the session and load the profile
                } catch (sessionError) {
                    console.error("10. Session error:", sessionError);
                    throw sessionError;
                }
            } else if (result.type === "cancel") {
                console.log("User cancelled Google sign-in");
            }
        } catch (error: any) {
            console.error("Error in signInWithGoogle:", error);
            Alert.alert(
                "Login Error",
                error.message || "An error occurred during sign-in"
            );
        } finally {
            console.log("Done. Setting isLoading to false");
            setIsLoading(false);
        }
    };

    const syncWithBackend = async (token: string) => {
        try {
            await fetch(`${BACKEND_URL}/auth/sync-user`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
        } catch (e) {
            console.error("Backend sync failed:", e);
        }
    };

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session && data.user) {
                await SecureStore.setItemAsync(
                    "session_token",
                    data.session.access_token
                );
                await loadUserProfile(data.user.id);
            }
        } catch (error) {
            console.error("Sign in error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            if (data.session && data.user) {
                await SecureStore.setItemAsync(
                    "session_token",
                    data.session.access_token
                );
                await loadUserProfile(data.user.id);
            }
        } catch (error) {
            console.error("Sign up error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        await SecureStore.deleteItemAsync("session_token");
        setUser(null);
    };

    const completeOnboarding = async (profile: Partial<UserProfile>) => {
        if (!user) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("users")
                .update({
                    display_name: profile.name,
                    favorite_genres: profile.favoriteGenres,
                    reading_format: profile.readingFormat,
                    onboarding_completed: true,
                })
                .eq("id", user.id);

            if (error) throw error;

            setUser({
                ...user,
                ...profile,
                onboardingCompleted: true,
            });
        } catch (error) {
            console.error("Onboarding error:", error);
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
                signInWithGoogle,
                signOut,
                completeOnboarding,
                skipOnboarding,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
