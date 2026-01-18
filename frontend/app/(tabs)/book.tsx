import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mockBooks, mockLibraries, Book } from '@/data/mockData';
import { useBooks } from '@/context/BooksContext';

export default function BookTab() {
  const insets = useSafeAreaInsets();
  const { addToTbr, isInTbr } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book>(mockBooks[0]);

  const handleAddBook = useCallback(() => {
    addToTbr(selectedBook);
  }, [addToTbr, selectedBook]);

  const handlePurchase = useCallback(() => {
    const query = encodeURIComponent(`${selectedBook.title} ${selectedBook.author}`);
    Linking.openURL(`https://bookshop.org/search?keywords=${query}`);
  }, [selectedBook]);

  const selectNextBook = useCallback(() => {
    const currentIndex = mockBooks.findIndex((b) => b.isbn === selectedBook.isbn);
    const nextIndex = (currentIndex + 1) % mockBooks.length;
    setSelectedBook(mockBooks[nextIndex]);
  }, [selectedBook]);

  const isSaved = isInTbr(selectedBook.isbn);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>See Book</Text>
        <Text style={styles.subtitle}>From BookTok to your shelf</Text>
      </View>

      <View style={styles.bookCard}>
        <Image
          source={{ uri: selectedBook.coverUrl }}
          style={styles.bookCover}
          resizeMode="cover"
        />
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle}>{selectedBook.title}</Text>
          <Text style={styles.bookAuthor}>{selectedBook.author}</Text>
          {(selectedBook as any).tiktokSource && (
            <Text style={styles.tiktokSource}>
              Found from BookTok video by {(selectedBook as any).tiktokSource}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.addButton, isSaved && styles.addButtonDisabled]}
            onPress={handleAddBook}
            disabled={isSaved}
          >
            <Text style={styles.addButtonText}>
              {isSaved ? 'Added to My Books' : 'Add to My Books'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buyButton} onPress={handlePurchase}>
            <Text style={styles.buyButtonText}>Buy on Bookshop.org</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={selectNextBook}>
        <Text style={styles.nextButtonText}>See Another Book</Text>
      </TouchableOpacity>

      <View style={styles.libraryInfo}>
        <Text style={styles.libraryInfoTitle}>Nearby Places</Text>
        {mockLibraries.slice(0, 3).map((library) => (
          <View key={library.id} style={styles.libraryItem}>
            <View
              style={[
                styles.libraryDot,
                {
                  backgroundColor: library.type === 'library' ? '#4A90A4' : '#E07A5F',
                },
              ]}
            />
            <Text style={styles.libraryName}>{library.name}</Text>
            <Text style={styles.libraryType}>
              {library.type === 'library' ? 'Library' : 'Bookstore'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    fontWeight: '700',
    color: '#1A1A2E',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  bookCover: {
    width: 110,
    height: 165,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  tiktokSource: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#4A90A4',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#B8C9CE',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buyButton: {
    marginTop: 10,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  nextButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  nextButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  libraryInfo: {
    marginTop: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  libraryInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  libraryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  libraryName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  libraryType: {
    fontSize: 12,
    color: '#888',
  },
});
