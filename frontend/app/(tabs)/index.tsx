import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { mockBooks, mockLibraries, defaultRegion, getTikTokSource, Book } from '@/data/mockData';
import { useBooks } from '@/context/BooksContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { addToTbr, isInTbr } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book>(mockBooks[0]);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['30%', '55%'];

  const handleAddBook = useCallback(() => {
    addToTbr(selectedBook);
  }, [selectedBook, addToTbr]);

  const selectNextBook = useCallback(() => {
    const currentIndex = mockBooks.findIndex((b) => b.isbn === selectedBook.isbn);
    const nextIndex = (currentIndex + 1) % mockBooks.length;
    setSelectedBook(mockBooks[nextIndex]);
  }, [selectedBook]);

  const isSaved = isInTbr(selectedBook.isbn);
  const bookTikTokSource = getTikTokSource(selectedBook.isbn);

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Floating Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.appName}>Bookmarked</Text>
        <Text style={styles.subtitle}>From BookTok to your shelf</Text>
      </View>

      {/* Map View */}
      <MapView
        style={styles.map}
        initialRegion={defaultRegion}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {mockLibraries.map((library) => (
          <Marker
            key={library.id}
            coordinate={{
              latitude: library.latitude,
              longitude: library.longitude,
            }}
            title={library.name}
            description={library.type === 'library' ? 'Public Library' : 'Bookstore'}
            pinColor={library.type === 'library' ? '#4A90A4' : '#E07A5F'}
          />
        ))}
      </MapView>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
          {/* Book Card */}
          <View style={styles.bookCard}>
            <Image
              source={{ uri: selectedBook.coverUrl }}
              style={styles.bookCover}
              resizeMode="cover"
            />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{selectedBook.title}</Text>
              <Text style={styles.bookAuthor}>{selectedBook.author}</Text>
              {bookTikTokSource && (
                <View style={styles.tiktokBadge}>
                  <Ionicons name="logo-tiktok" size={10} color="#FFF" />
                  <Text style={styles.tiktokBadgeText}>BookTok</Text>
                </View>
              )}
              {selectedBook.description && (
                <Text style={styles.bookDescription} numberOfLines={2}>
                  {selectedBook.description}
                </Text>
              )}

              <TouchableOpacity
                style={[
                  styles.addButton,
                  isSaved && styles.addButtonDisabled,
                ]}
                onPress={handleAddBook}
                disabled={isSaved}
              >
                <Text style={styles.addButtonText}>
                  {isSaved ? 'Added to TBR' : 'Add to TBR'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Next Book Button */}
          {mockBooks.length > 1 && (
            <TouchableOpacity style={styles.nextButton} onPress={selectNextBook}>
              <Text style={styles.nextButtonText}>
                See Another Book ({mockBooks.findIndex((b) => b.isbn === selectedBook.isbn) + 1}/{mockBooks.length})
              </Text>
            </TouchableOpacity>
          )}

          {/* Library Info */}
          <View style={styles.libraryInfo}>
            <Text style={styles.libraryInfoTitle}>Nearby Places</Text>
            {mockLibraries.slice(0, 3).map((library) => (
              <View key={library.id} style={styles.libraryItem}>
                <View
                  style={[
                    styles.libraryDot,
                    {
                      backgroundColor:
                        library.type === 'library' ? '#4A90A4' : '#E07A5F',
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
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  map: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.7,
  },
  bottomSheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  handleIndicator: {
    backgroundColor: '#DDD',
    width: 40,
  },
  bottomSheetContent: {
    padding: 20,
    paddingBottom: 100,
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
    width: 100,
    height: 150,
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
    marginBottom: 6,
  },
  tiktokBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
    gap: 4,
  },
  tiktokBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  bookDescription: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
    lineHeight: 16,
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
  nextButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  libraryInfo: {
    marginTop: 24,
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
