import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { mockPosts, Post, Comment } from "@/data/mockPosts";

function RatingBadge({ rating }: { rating: number }) {
    return (
        <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#F5A524" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
    );
}

function CommentItem({ comment }: { comment: Comment }) {
    return (
        <View style={styles.commentRow}>
            <Text style={styles.commentUser}>{comment.user}</Text>
            <Text style={styles.commentText}>{comment.text}</Text>
            <Text style={styles.commentMeta}>{comment.timeAgo}</Text>
        </View>
    );
}

function PostCard({ post }: { post: Post }) {
    const hasComments = post.comments && post.comments.length > 0;
    const commentsPreview = post.comments.slice(0, 2);
    const remainingCount =
        post.comments.length > 2 ? post.comments.length - 2 : 0;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View
                    style={[
                        styles.avatar,
                        { backgroundColor: post.avatarColor || "#E0ECF2" },
                    ]}
                >
                    <Text style={styles.avatarInitial}>
                        {post.user.slice(0, 1).toUpperCase()}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.authorName}>{post.user}</Text>
                    <Text style={styles.postMeta}>{post.createdAt}</Text>
                </View>
                <RatingBadge rating={post.rating} />
            </View>

            <View style={styles.bookRow}>
                <Image
                    source={{ uri: post.book.cover_url }}
                    style={styles.cover}
                    resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.bookTitle}>{post.book.title}</Text>
                    <Text style={styles.bookAuthor}>{post.book.author}</Text>
                    <View style={styles.genrePill}>
                        <Ionicons name="book-outline" size={14} color="#4B5563" />
                        <Text style={styles.genreText}>
                            {post.book.genre || "Fiction"}
                        </Text>
                    </View>
                </View>
            </View>

            <Text style={styles.review}>{post.review}</Text>

            <View style={styles.footerRow}>
                <View style={styles.footerLeft}>
                    <Ionicons name="heart-outline" size={16} color="#EF4444" />
                    <Text style={styles.footerText}>{post.likes} likes</Text>
                </View>
                <View style={styles.footerLeft}>
                    <Ionicons name="chatbubble-ellipses-outline" size={16} color="#6B7280" />
                    <Text style={styles.footerText}>
                        {post.comments.length} comments
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            {hasComments ? (
                <View style={styles.commentsContainer}>
                    {commentsPreview.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                    {remainingCount > 0 && (
                        <Text style={styles.viewMoreText}>
                            View {remainingCount} more comment
                            {remainingCount > 1 ? "s" : ""}
                        </Text>
                    )}
                </View>
            ) : (
                <Text style={styles.noCommentsText}>
                    Be the first to share a thought on this post.
                </Text>
            )}
        </View>
    );
}

export default function PostsScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[
                    styles.content,
                    { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 120 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.screenTitle}>Posts</Text>
                        <Text style={styles.subtitle}>
                            See what readers are saying about their latest picks.
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={() => router.push("/create-post")}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="add" size={18} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {mockPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F6F7FB",
    },
    content: {
        paddingHorizontal: 16,
        gap: 16,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    screenTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#0F172A",
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0F172A",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    createButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 6,
        gap: 12,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInitial: {
        color: "#0F172A",
        fontSize: 18,
        fontWeight: "700",
    },
    authorName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0F172A",
    },
    postMeta: {
        fontSize: 12,
        color: "#6B7280",
        marginTop: 2,
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#FFF4E5",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#92400E",
    },
    bookRow: {
        flexDirection: "row",
        gap: 12,
    },
    cover: {
        width: 68,
        height: 96,
        borderRadius: 10,
        backgroundColor: "#E5E7EB",
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },
    bookAuthor: {
        fontSize: 13,
        color: "#6B7280",
        marginTop: 2,
    },
    genrePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        alignSelf: "flex-start",
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
    },
    genreText: {
        fontSize: 12,
        color: "#374151",
        fontWeight: "600",
    },
    review: {
        fontSize: 14,
        color: "#111827",
        lineHeight: 20,
    },
    footerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    footerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    footerText: {
        fontSize: 13,
        color: "#4B5563",
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: "#EEF0F3",
    },
    commentsContainer: {
        gap: 10,
    },
    commentRow: {
        backgroundColor: "#F6F7FB",
        borderRadius: 10,
        padding: 10,
    },
    commentUser: {
        fontSize: 13,
        fontWeight: "700",
        color: "#0F172A",
        marginBottom: 4,
    },
    commentText: {
        fontSize: 13,
        color: "#1F2937",
        lineHeight: 18,
    },
    commentMeta: {
        fontSize: 11,
        color: "#6B7280",
        marginTop: 6,
    },
    viewMoreText: {
        fontSize: 12,
        color: "#4A90A4",
        fontWeight: "700",
    },
    noCommentsText: {
        fontSize: 12,
        color: "#9CA3AF",
    },
});

