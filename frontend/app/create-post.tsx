import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function CreatePostScreen() {
    const insets = useSafeAreaInsets();
    const [bookTitle, setBookTitle] = useState("");
    const [bookAuthor, setBookAuthor] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [rating, setRating] = useState(4);
    const [review, setReview] = useState("");

    const handleSubmit = () => {
        if (!bookTitle.trim() || !bookAuthor.trim() || !review.trim()) {
            Alert.alert("Missing info", "Please add a title, author, and review.");
            return;
        }

        Alert.alert(
            "Post created",
            "This is a demo form. In production this would publish your review to the feed.",
            [
                {
                    text: "View posts",
                    onPress: () => router.replace("/(tabs)/posts"),
                },
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#F8F9FA" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{
                    paddingTop: insets.top + 12,
                    paddingBottom: insets.bottom + 28,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={18} color="#0F172A" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Create Post</Text>
                <Text style={styles.subtitle}>
                    Share a quick take on what you just read. Add a rating, cover, and why it stuck with you.
                </Text>

                <View style={styles.card}>
                    <Text style={styles.label}>Book Title</Text>
                    <TextInput
                        placeholder="E.g., Fourth Wing"
                        placeholderTextColor="#9CA3AF"
                        value={bookTitle}
                        onChangeText={setBookTitle}
                        style={styles.input}
                    />

                    <Text style={styles.label}>Author</Text>
                    <TextInput
                        placeholder="Rebecca Yarros"
                        placeholderTextColor="#9CA3AF"
                        value={bookAuthor}
                        onChangeText={setBookAuthor}
                        style={styles.input}
                    />

                    <Text style={styles.label}>Cover Image URL (optional)</Text>
                    <TextInput
                        placeholder="https://..."
                        placeholderTextColor="#9CA3AF"
                        value={coverUrl}
                        onChangeText={setCoverUrl}
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>Rating</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((value) => (
                            <TouchableOpacity
                                key={value}
                                onPress={() => setRating(value)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={value <= rating ? "star" : "star-outline"}
                                    size={26}
                                    color={value <= rating ? "#F5A524" : "#D1D5DB"}
                                />
                            </TouchableOpacity>
                        ))}
                        <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
                    </View>

                    <Text style={styles.label}>Review</Text>
                    <TextInput
                        placeholder="What did you love? Who should pick this up next?"
                        placeholderTextColor="#9CA3AF"
                        value={review}
                        onChangeText={setReview}
                        style={[styles.input, styles.textArea]}
                        multiline
                    />

                    <View style={styles.tipBox}>
                        <Ionicons name="bulb-outline" size={18} color="#4A90A4" />
                        <Text style={styles.tipText}>
                            Tip: call out pacing, vibes, or content warnings so the community can find the right fit faster.
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        activeOpacity={0.9}
                    >
                        <Ionicons name="send" size={18} color="#FFF" />
                        <Text style={styles.submitText}>Publish Post</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 18,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
    },
    backText: {
        fontSize: 14,
        color: "#0F172A",
        fontWeight: "600",
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: "#0F172A",
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 6,
        marginBottom: 16,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        gap: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#1F2937",
    },
    input: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        color: "#111827",
        backgroundColor: "#F9FAFB",
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: "top",
    },
    starsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    ratingValue: {
        marginLeft: 6,
        fontWeight: "700",
        color: "#92400E",
    },
    tipBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        padding: 12,
        backgroundColor: "#F0F7FA",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#D8E6ED",
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: "#1F2937",
        lineHeight: 18,
    },
    submitButton: {
        marginTop: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#0F172A",
        borderRadius: 12,
        paddingVertical: 14,
    },
    submitText: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "700",
    },
});

