import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { BooksProvider } from "@/context/BooksContext";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <AuthProvider>
            <BooksProvider>
                <ThemeProvider
                    value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                >
                    <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                            name="(auth)"
                            options={{ gestureEnabled: false }}
                        />
                        <Stack.Screen name="(onboarding)" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="create-post" />
                        <Stack.Screen
                            name="modal"
                            options={{ presentation: "modal", title: "Modal" }}
                        />
                    </Stack>
                    <StatusBar style="auto" />
                </ThemeProvider>
            </BooksProvider>
        </AuthProvider>
    );
}
