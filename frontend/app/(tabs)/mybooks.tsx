import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBooks } from '@/context/BooksContext';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '@/data/mockData';
import { submitTikTokUrl, isValidTikTokUrl } from '@/services/api';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOOK_WIDTH = (SCREEN_WIDTH - 60) / 3;
const BOOK_HEIGHT = BOOK_WIDTH * 1.5;

interface BookCardProps {
  book: Book;
  onLongPress: () => void;
  badgeIcon: 'time-outline' | 'checkmark-circle';
  badgeColor: string;
}

function BookCard({ book, onLongPress, badgeIcon, badgeColor }: BookCardProps) {
  return (
    <TouchableOpacity
      style={styles.bookCard}
      activeOpacity={0.8}
      onLongPress={onLongPress}
    >
      <View style={styles.bookCoverContainer}>
        <Image
          source={{ uri: book.coverUrl }}
          style={styles.bookCover}
          resizeMode="cover"
        />
        <View style={[styles.bookBadge, { backgroundColor: badgeColor }]}>
          <Ionicons name={badgeIcon} size={12} color="#FFF" />
        </View>
      </View>
      <Text style={styles.bookTitle} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>
        {book.author}
      </Text>
    </TouchableOpacity>
  );
}

export default function MyBooksScreen() {
  const insets = useSafeAreaInsets();
  const {
    tbrBooks,
    collectionBooks,
    removeFromTbr,
    removeFromCollection,
    moveToCollection,
    addToTbr,
    searchQuery,
    setSearchQuery,
  } = useBooks();

  // TikTok URL input state
  const [showTiktokInput, setShowTiktokInput] = useState(false);
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleTiktokInput = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowTiktokInput((prev) => !prev);
    if (showTiktokInput) {
      setTiktokUrl('');
      Keyboard.dismiss();
    }
  }, [showTiktokInput]);

  const handleSubmitUrl = useCallback(async () => {
    if (!tiktokUrl.trim()) {
      Alert.alert('Error', 'Please enter a TikTok URL');
      return;
    }

    if (!isValidTikTokUrl(tiktokUrl.trim())) {
      Alert.alert('Invalid URL', 'Please enter a valid TikTok URL');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const response = await submitTikTokUrl(tiktokUrl.trim());

      if (response.books && response.books.length > 0) {
        // Add all books to TBR
        response.books.forEach((book) => addToTbr(book));
        Alert.alert(
          'Success!',
          `Added ${response.books.length} book(s) to your TBR from this TikTok!`
        );
        setTiktokUrl('');
        setShowTiktokInput(false);
      } else {
        Alert.alert('No Books Found', "We couldn't find any books mentioned in this video.");
      }
    } catch (error) {
      console.error('Error submitting TikTok URL:', error);
      Alert.alert(
        'Demo Mode',
        'Backend not connected. In production, books from the TikTok would be added to your TBR.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [tiktokUrl, addToTbr]);

  // Filter books based on search query
  const filteredTbrBooks = useMemo(() => {
    if (!searchQuery.trim()) return tbrBooks;
    const query = searchQuery.toLowerCase();
    return tbrBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
  }, [tbrBooks, searchQuery]);

  const filteredCollectionBooks = useMemo(() => {
    if (!searchQuery.trim()) return collectionBooks;
    const query = searchQuery.toLowerCase();
    return collectionBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
    );
  }, [collectionBooks, searchQuery]);

  const hasBooks = tbrBooks.length > 0 || collectionBooks.length > 0;
  const hasFilteredBooks = filteredTbrBooks.length > 0 || filteredCollectionBooks.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>My Books</Text>

        {/* Search Bar + TikTok Button Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your books..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* TikTok Button */}
          <TouchableOpacity
            style={[
              styles.tiktokButton,
              showTiktokInput && styles.tiktokButtonActive,
            ]}
            onPress={toggleTiktokInput}
          >
            <Ionicons
              name="logo-tiktok"
              size={20}
              color={showTiktokInput ? '#FFF' : '#1A1A2E'}
            />
          </TouchableOpacity>
        </View>

        {/* Expandable TikTok URL Input */}
        {showTiktokInput && (
          <View style={styles.tiktokInputContainer}>
            <View style={styles.tiktokInputWrapper}>
              <TextInput
                style={styles.tiktokInput}
                placeholder="Paste TikTok URL..."
                placeholderTextColor="#999"
                value={tiktokUrl}
                onChangeText={setTiktokUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={handleSubmitUrl}
                editable={!isLoading}
                autoFocus
              />
              {tiktokUrl.length > 0 && !isLoading && (
                <TouchableOpacity onPress={() => setTiktokUrl('')}>
                  <Ionicons name="close-circle" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmitUrl}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="add" size={22} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!hasBooks ? (
          /* Empty State - No books at all */
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={80} color="#CCC" />
            <Text style={styles.emptyTitle}>Your shelf is empty</Text>
            <Text style={styles.emptySubtitle}>
              Tap the TikTok button above to add books from BookTok videos
            </Text>
          </View>
        ) : !hasFilteredBooks && searchQuery ? (
          /* No search results */
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={60} color="#CCC" />
            <Text style={styles.emptyTitle}>No books found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different search term
            </Text>
          </View>
        ) : (
          <>
            {/* TBR Section */}
            {filteredTbrBooks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time-outline" size={20} color="#E07A5F" />
                  <Text style={styles.sectionTitle}>To Be Read</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{filteredTbrBooks.length}</Text>
                  </View>
                </View>
                <View style={styles.bookGrid}>
                  {filteredTbrBooks.map((book) => (
                    <BookCard
                      key={book.isbn}
                      book={book}
                      onLongPress={() => {
                        moveToCollection(book.isbn);
                      }}
                      badgeIcon="time-outline"
                      badgeColor="#E07A5F"
                    />
                  ))}
                </View>
                <View style={styles.shelfLine} />
                <Text style={styles.hintText}>Long press to mark as read</Text>
              </View>
            )}

            {/* Collection Section */}
            {filteredCollectionBooks.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="library" size={20} color="#4A90A4" />
                  <Text style={styles.sectionTitle}>My Collection</Text>
                  <View style={[styles.badge, { backgroundColor: '#4A90A4' }]}>
                    <Text style={styles.badgeText}>{filteredCollectionBooks.length}</Text>
                  </View>
                </View>
                <View style={styles.bookGrid}>
                  {filteredCollectionBooks.map((book) => (
                    <BookCard
                      key={book.isbn}
                      book={book}
                      onLongPress={() => removeFromCollection(book.isbn)}
                      badgeIcon="checkmark-circle"
                      badgeColor="#4A90A4"
                    />
                  ))}
                </View>
                <View style={[styles.shelfLine, { backgroundColor: '#B8D4E3' }]} />
                <Text style={styles.hintText}>Long press to remove</Text>
              </View>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{tbrBooks.length}</Text>
                <Text style={styles.statLabel}>To Read</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{collectionBooks.length}</Text>
                <Text style={styles.statLabel}>Read</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{tbrBooks.length + collectionBooks.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  tiktokButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  tiktokButtonActive: {
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
  },
  tiktokInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  tiktokInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  tiktokInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E07A5F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E07A5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginLeft: 8,
    flex: 1,
  },
  badge: {
    backgroundColor: '#E07A5F',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  bookCard: {
    width: BOOK_WIDTH,
    marginHorizontal: 5,
    marginBottom: 16,
  },
  bookCoverContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  bookCover: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    borderRadius: 4,
    backgroundColor: '#E8E8E8',
  },
  bookBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    lineHeight: 16,
  },
  bookAuthor: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  shelfLine: {
    height: 6,
    backgroundColor: '#F0D5CF',
    marginHorizontal: 15,
    marginTop: 8,
    borderRadius: 3,
  },
  hintText: {
    fontSize: 11,
    color: '#AAA',
    textAlign: 'center',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EEE',
  },
});
