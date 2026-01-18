import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Linking,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { mockBooks, Book } from "@/data/mockData";
import { useBooks } from "@/context/BooksContext";
import { useAuth } from "@/context/AuthContext";
import { getRecommendations } from "@/services/api";

export default function BookTab() {
    const insets = useSafeAreaInsets();
    const { addToTbr, isInTbr } = useBooks();
    const { user } = useAuth();
    const [recommended, setRecommended] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    useEffect(() => {
        const fetchRecs = async () => {
            if (!user?.id) {
                setRecommended(mockBooks.slice(0, 8));
                return;
            }
            setIsLoading(true);
            try {
                const data = await getRecommendations(user.id);
                if (data?.recommendations?.length) {
                    const mapped = data.recommendations.map((b: any) => ({
                        ...b,
                        cover_url:
                            b.cover_url ||
                            b.cover_url ||
                            "https://placehold.co/110x165?text=No+Cover",
                    }));
                    setRecommended(mapped.slice(0, 8));
                } else {
                    setRecommended(mockBooks.slice(0, 8));
                }
            } catch (e) {
                console.warn("Failed to fetch recommendations", e);
                setRecommended(mockBooks.slice(0, 8));
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecs();
    }, [user]);

    const handleAddBook = useCallback(
        async (book: Book) => {
            addToTbr(book);
        },
        [addToTbr]
    );

    const handlePurchase = useCallback((book: Book) => {
        const query = encodeURIComponent(`${book.title} ${book.author}`);
        Linking.openURL(`https://bookshop.org/search?keywords=${query}`);
    }, []);

    const renderBookCard = (book: Book) => {
        const isSaved = isInTbr(book.isbn);
        return (
            <TouchableOpacity
                key={book.isbn || book.title}
                style={styles.bookCard}
                activeOpacity={0.85}
                onPress={() => setSelectedBook(book)}
            >
                <Image
                    source={{
                        uri:
                            book.cover_url ||
                            "https://placehold.co/110x165?text=No+Cover",
                    }}
                    style={styles.bookCover}
                    resizeMode="cover"
                />
                <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{book.title}</Text>
                    <Text style={styles.bookAuthor}>{book.author}</Text>
                    {book.description ? (
                        <Text style={styles.bookDescription} numberOfLines={3}>
                            {book.description}
                        </Text>
                    ) : null}
                    {book.rating ? (
                        <Text
                            style={styles.bookRating}
                        >{`Rating: ${book.rating.toFixed(1)}/5`}</Text>
                    ) : null}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#FFF" }}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 20 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>See Book</Text>
                    <Text style={styles.subtitle}>Recommended for you</Text>
                </View>

                {isLoading ? (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color="#4A90A4" />
                        <Text style={styles.loadingText}>
                            Loading recommendations...
                        </Text>
                    </View>
                ) : (
                    recommended.map(renderBookCard)
                )}
            </ScrollView>

            {selectedBook && (
                <View style={styles.overlay} pointerEvents="box-none">
                    <TouchableOpacity
                        style={styles.overlayBack}
                        activeOpacity={1}
                        onPress={() => setSelectedBook(null)}
                    />
                    <View style={styles.previewContainer}>
                        <ScrollView contentContainerStyle={styles.previewCard}>
                            <View style={styles.previewHeader}>
                                <Image
                                    source={{
                                        uri:
                                            selectedBook.cover_url ||
                                            "https://placehold.co/120x170?text=No+Cover",
                                    }}
                                    style={styles.previewCover}
                                />
                                <View style={styles.previewText}>
                                    <Text style={styles.previewTitle}>
                                        {selectedBook.title}
                                    </Text>
                                    <Text style={styles.previewAuthor}>
                                        {selectedBook.author}
                                    </Text>
                                    {selectedBook.rating ? (
                                        <Text
                                            style={styles.previewRating}
                                        >{`Rating: ${selectedBook.rating.toFixed(
                                            1
                                        )}/5`}</Text>
                                    ) : null}
                                </View>
                                <TouchableOpacity
                                    onPress={() => setSelectedBook(null)}
                                >
                                    <Text style={styles.closeText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            {selectedBook.description ? (
                                <Text style={styles.previewDescription}>
                                    {selectedBook.description}
                                </Text>
                            ) : null}
                            <View style={styles.previewActions}>
                                <TouchableOpacity
                                    style={[
                                        styles.addButton,
                                        isInTbr(selectedBook.isbn) &&
                                            styles.addButtonDisabled,
                                    ]}
                                    onPress={() => handleAddBook(selectedBook)}
                                    disabled={isInTbr(selectedBook.isbn)}
                                >
                                    <Text style={styles.addButtonText}>
                                        {isInTbr(selectedBook.isbn)
                                            ? "In My Books"
                                            : "Add to My Books"}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.buyButton}
                                    onPress={() => handlePurchase(selectedBook)}
                                >
                                    <Text style={styles.buyButtonText}>
                                        Buy
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1A1A2E",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    bookCard: {
        flexDirection: "row",
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
        marginBottom: 12,
    },
    bookCover: {
        width: 110,
        height: 165,
        borderRadius: 8,
        backgroundColor: "#E8E8E8",
    },
    bookInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: "center",
        gap: 6,
    },
    bookTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1A1A2E",
    },
    bookAuthor: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    bookDescription: {
        fontSize: 12,
        color: "#555",
        marginTop: 4,
    },
    bookRating: {
        fontSize: 12,
        color: "#1A1A2E",
        fontWeight: "600",
    },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },
    addButton: {
        flex: 1,
        backgroundColor: "#4A90A4",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: "center",
    },
    addButtonDisabled: {
        backgroundColor: "#B8C9CE",
    },
    addButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    buyButton: {
        flex: 1,
        backgroundColor: "#0F172A",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: "center",
    },
    buyButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "700",
    },
    loader: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 8,
        color: "#666",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    overlayBack: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.35)",
    },
    previewContainer: {
        maxHeight: "70%",
        width: "90%",
        backgroundColor: "#FFF",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 10,
    },
    previewCard: {
        padding: 16,
        gap: 10,
    },
    previewHeader: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-start",
    },
    previewCover: {
        width: 110,
        height: 160,
        borderRadius: 8,
        backgroundColor: "#E8E8E8",
    },
    previewText: {
        flex: 1,
        gap: 4,
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A2E",
    },
    previewAuthor: {
        fontSize: 13,
        color: "#555",
    },
    previewRating: {
        fontSize: 12,
        color: "#1A1A2E",
        fontWeight: "700",
    },
    closeText: {
        fontSize: 18,
        color: "#666",
    },
    previewDescription: {
        marginTop: 10,
        fontSize: 13,
        color: "#444",
        lineHeight: 18,
    },
    previewActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },
});
