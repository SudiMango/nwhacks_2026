import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBooks } from '@/context/BooksContext';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOOK_WIDTH = (SCREEN_WIDTH - 60) / 3;
const BOOK_HEIGHT = BOOK_WIDTH * 1.5;

export default function MyBooksScreen() {
  const insets = useSafeAreaInsets();
  const { savedBooks, removeBook } = useBooks();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>My Books</Text>
        <Text style={styles.subtitle}>To Be Read</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {savedBooks.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={80} color="#CCC" />
            <Text style={styles.emptyTitle}>Your shelf is empty</Text>
            <Text style={styles.emptySubtitle}>
              Discover books from BookTok and add them here
            </Text>
          </View>
        ) : (
          /* Bookshelf Grid */
          <View style={styles.bookshelfContainer}>
            <View style={styles.bookGrid}>
              {savedBooks.map((book) => (
                <TouchableOpacity
                  key={book.id}
                  style={styles.bookCard}
                  activeOpacity={0.8}
                  onLongPress={() => removeBook(book.id)}
                >
                  <View style={styles.bookCoverContainer}>
                    <Image
                      source={{ uri: book.coverUrl }}
                      style={styles.bookCover}
                      resizeMode="cover"
                    />
                    <View style={styles.bookmarkBadge}>
                      <Ionicons name="bookmark" size={14} color="#4A90A4" />
                    </View>
                  </View>
                  <Text style={styles.bookTitle} numberOfLines={2}>
                    {book.title}
                  </Text>
                  <Text style={styles.bookAuthor} numberOfLines={1}>
                    {book.author}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Shelf decoration lines */}
            {savedBooks.length > 0 && (
              <View style={styles.shelfLine} />
            )}
          </View>
        )}

        {/* Book count */}
        {savedBooks.length > 0 && (
          <View style={styles.countContainer}>
            <Text style={styles.countText}>
              {savedBooks.length} {savedBooks.length === 1 ? 'book' : 'books'} in your TBR
            </Text>
            <Text style={styles.hintText}>Long press to remove a book</Text>
          </View>
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
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
    paddingTop: 100,
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
  bookshelfContainer: {
    paddingTop: 20,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
  },
  bookCard: {
    width: BOOK_WIDTH,
    marginHorizontal: 5,
    marginBottom: 20,
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
  bookmarkBadge: {
    position: 'absolute',
    top: -5,
    right: 5,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    height: 8,
    backgroundColor: '#DDD',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  countContainer: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  countText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  hintText: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 4,
  },
});
