import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';

import { locationPresets, LocationKey, recommendedByGenre, Book } from '@/data/mockData';
import { useBooks } from '@/context/BooksContext';
import { useAuth } from '@/context/AuthContext';
import { useLocalSearchParams, router } from 'expo-router';
import { getBookRecommendations, RecommendedBook, findBookLibraries } from '@/services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const horizontalInset = Math.max(16, width * 0.07);
  const navEstimatedHeight = Math.max(58, width * 0.14);
  const bottomOffset = Math.max(insets.bottom + 10, width * 0.02);
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationKey>('vancouver');
  const mapRef = useRef<MapView | null>(null);
  const [highlightedLibraries, setHighlightedLibraries] = useState<any[]>([]);
  const [bookInfo, setBookInfo] = useState<{ title: string; author: string } | null>(null);

  // AI Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendedBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBook, setSelectedBook] = useState<RecommendedBook | null>(null);
  const [isFindingLibraries, setIsFindingLibraries] = useState(false);

  const { addToTbr, isInTbr, tbrBooks } = useBooks();
  const { user } = useAuth();




  const location = locationPresets[selectedLocation];

  useEffect(() => {
    const onShow = (e: any) => {
      setKeyboardOffset(e.endCoordinates?.height ?? 0);
      setKeyboardVisible(true);
    };
    const onHide = () => {
      setKeyboardOffset(0);
      setKeyboardVisible(false);
    };

    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      onShow,
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      onHide,
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Extract specific param values to use as dependencies
  const highlightLibrariesParam = params.highlightLibraries as string | undefined;
  const bookTitleParam = params.bookTitle as string | undefined;
  const bookAuthorParam = params.bookAuthor as string | undefined;
  const centerLatParam = params.centerLat as string | undefined;
  const centerLngParam = params.centerLng as string | undefined;
  const searchIdParam = params.searchId as string | undefined;

  // Parse highlighted libraries from params
  useEffect(() => {
    console.log('Search params changed, searchId:', searchIdParam);

    if (highlightLibrariesParam) {
      try {
        const libraries = JSON.parse(highlightLibrariesParam);
        console.log('Setting highlighted libraries:', libraries.length);
        setHighlightedLibraries(libraries);
        setBookInfo({
          title: bookTitleParam || '',
          author: bookAuthorParam || '',
        });

        if (centerLatParam && centerLngParam && mapRef.current) {
          const lat = parseFloat(centerLatParam);
          const lng = parseFloat(centerLngParam);
          mapRef.current.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }, 500);
        }
      } catch (e) {
        console.error('Error parsing library data:', e);
      }
    } else {
      setHighlightedLibraries([]);
      setBookInfo(null);
    }
  }, [highlightLibrariesParam, bookTitleParam, bookAuthorParam, centerLatParam, centerLngParam, searchIdParam]);

  useEffect(() => {
    if (mapRef.current && location?.region && highlightedLibraries.length === 0) {
      mapRef.current.animateToRegion(location.region, 450);
    }
  }, [location, highlightedLibraries]);

  useEffect(() => {
    if (mapRef.current && highlightedLibraries.length > 0) {
      const coords = highlightedLibraries
        .filter((lib) => typeof lib.latitude === 'number' && typeof lib.longitude === 'number')
        .map((lib) => ({
          latitude: lib.latitude,
          longitude: lib.longitude,
        }));
      if (coords.length > 0) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 80, bottom: 200, left: 80, right: 80 },
          animated: true,
        });
      }
    }
  }, [highlightedLibraries]);

  const handleAddToTbr = (book: Book) => {
    addToTbr(book);
  };

  // Handle AI search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    Keyboard.dismiss();
    setIsSearching(true);
    setRecommendations([]);

    try {
      // Get recent book titles from TBR for context
      const recentBooks = tbrBooks.slice(0, 5).map((b) => b.title);

      const books = await getBookRecommendations(
        searchQuery.trim(),
        user?.favoriteGenres,
        recentBooks,
        5
      );

      setRecommendations(books);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle finding a book at libraries
  const handleFindOnMap = async (book: RecommendedBook) => {
    if (!book.isbn) {
      console.warn('No ISBN for book:', book.title);
      return;
    }

    setIsFindingLibraries(true);
    setSelectedBook(null);

    try {
      // Get user's location
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 49.2827;
      let lng = -123.1207;

      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        // Check for simulator default (San Francisco)
        if (Math.abs(loc.coords.latitude - 37.785834) < 0.01 && Math.abs(loc.coords.longitude + 122.406417) < 0.01) {
          console.log('Detected simulator location, using Vancouver');
        } else {
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      }

      const result = await findBookLibraries(book.isbn, lat, lng, 15);

      if (result.libraries && result.libraries.length > 0) {
        setHighlightedLibraries(result.libraries);
        setBookInfo({ title: book.title, author: book.author });

        // Clear recommendations to show map
        setRecommendations([]);
        setSearchQuery('');

        // Fit map to libraries
        if (mapRef.current) {
          const coords = result.libraries.map((lib: any) => ({
            latitude: lib.latitude,
            longitude: lib.longitude,
          }));
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 100, bottom: 200, left: 80, right: 80 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error('Error finding libraries:', error);
    } finally {
      setIsFindingLibraries(false);
    }
  };

  // Handle adding recommended book to collection
  const handleAddRecommendedBook = (book: RecommendedBook) => {
    const bookForTbr: Book = {
      isbn: book.isbn || book.id || '',
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url,
      description: book.description,
    };
    addToTbr(bookForTbr);
  };

  const isBookInTbr = (book: RecommendedBook) => {
    return isInTbr(book.isbn || book.id || '');
  };

  return (
    <View style={styles.container}>
      {/* Book Search Banner */}
      {bookInfo && highlightedLibraries.length > 0 && (
        <View style={styles.searchBanner}>
          <View style={styles.searchBannerContent}>
            <Ionicons name="book" size={20} color="#4A90A4" />
            <View style={styles.searchBannerText}>
              <Text style={styles.searchBannerTitle}>Finding: {bookInfo.title}</Text>
              <Text style={styles.searchBannerSubtitle}>by {bookInfo.author}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setHighlightedLibraries([]);
                setBookInfo(null);
              }}
              style={styles.searchBannerClose}
            >
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={locationPresets.vancouver.region}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {(highlightedLibraries.length > 0 ? highlightedLibraries : location.libraries).map((library) => {
          const isHighlighted = highlightedLibraries.length > 0;
          const isAvailable = library.is_available === true;
          const availableAtBranch = library.available_at_this_branch === true;
          const notInCatalog = library.not_found === true || library.not_in_catalog === true;

          let bgColor = '#4A90A4';
          let iconName: keyof typeof Ionicons.glyphMap = 'library';
          let statusText = '';

          if (isHighlighted) {
            if (availableAtBranch) {
              bgColor = '#10B981';
              iconName = 'checkmark-circle';
              statusText = `Available (${library.copies || 0} copies)`;
            } else if (isAvailable) {
              bgColor = '#F59E0B';
              iconName = 'time';
              statusText = `At other branches`;
            } else if (notInCatalog) {
              bgColor = '#9CA3AF';
              iconName = 'help-circle';
              statusText = 'Not in catalog';
            } else {
              bgColor = '#EF4444';
              iconName = 'close-circle';
              statusText = `${library.holds || 0} holds`;
            }
          }

          let description = library.type === 'library' ? 'Public Library' : 'Bookstore';
          if (isHighlighted && statusText) {
            description = statusText;
          }

          return (
            <Marker
              key={library.id}
              coordinate={{
                latitude: library.latitude,
                longitude: library.longitude,
              }}
              title={library.name}
              description={description}
            >
              <View style={[styles.customMarker, { backgroundColor: bgColor }]}>
                <Ionicons name={iconName} size={18} color="#FFF" />
              </View>
              {isHighlighted && availableAtBranch && (
                <View style={styles.markerPulse} />
              )}
            </Marker>
          );
        })}
      </MapView>

      {/* AI Recommendations Results */}
      {recommendations.length > 0 && !keyboardVisible && (
        <View
          style={[
            styles.recommendationsContainer,
            {
              left: horizontalInset,
              right: horizontalInset,
              bottom: bottomOffset + navEstimatedHeight + 72,
            },
          ]}
        >
          <View style={styles.recommendationsHeader}>
            <View style={styles.recommendationsTitleRow}>
              <Ionicons name="sparkles" size={14} color="#4A90A4" />
              <Text style={styles.recommendationsTitle}>Recommendations</Text>
            </View>
            <TouchableOpacity onPress={() => setRecommendations([])}>
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendationsScroll}
          >
            {recommendations.map((book, index) => (
              <TouchableOpacity
                key={book.id || index}
                style={styles.recommendationCard}
                onPress={() => setSelectedBook(book)}
                activeOpacity={0.9}
              >
                {book.cover_url ? (
                  <Image source={{ uri: book.cover_url }} style={styles.recommendationCover} />
                ) : (
                  <View style={[styles.recommendationCover, styles.recommendationCoverPlaceholder]}>
                    <Ionicons name="book" size={24} color="#9CA3AF" />
                  </View>
                )}
                <Text style={styles.recommendationTitle} numberOfLines={2}>
                  {book.title}
                </Text>
                <Text style={styles.recommendationAuthor} numberOfLines={1}>
                  {book.author}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Genre quick picks above search (hidden when recommendations are showing) */}
      {!keyboardVisible && recommendations.length === 0 && (
        <View
          style={[
            styles.genreBar,
            {
              left: horizontalInset,
              right: horizontalInset,
              bottom: bottomOffset + navEstimatedHeight + keyboardOffset + 72,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreChips}
          >
          </ScrollView>
        </View>
      )}

      {/* Search pill above nav */}
      <View
        style={[
          styles.searchBar,
          {
            left: horizontalInset,
            right: horizontalInset,
            bottom: bottomOffset + navEstimatedHeight + keyboardOffset * 0.85,
          },
        ]}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="books like harry potter..."
          placeholderTextColor="#C4C4CC"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchIcon}
          activeOpacity={0.7}
          onPress={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons name="search" size={18} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Loading overlay for finding libraries */}
      {isFindingLibraries && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#4A90A4" />
            <Text style={styles.loadingText}>Finding libraries...</Text>
          </View>
        </View>
      )}

      {/* Book Detail Modal */}
      <Modal
        visible={selectedBook !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBook(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedBook(null)}
          />
          {selectedBook && (
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  {selectedBook.cover_url ? (
                    <Image source={{ uri: selectedBook.cover_url }} style={styles.modalCover} />
                  ) : (
                    <View style={[styles.modalCover, styles.modalCoverPlaceholder]}>
                      <Ionicons name="book" size={40} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.modalHeaderText}>
                    <Text style={styles.modalTitle}>{selectedBook.title}</Text>
                    <Text style={styles.modalAuthor}>by {selectedBook.author}</Text>
                    {selectedBook.published_date && (
                      <Text style={styles.modalMeta}>
                        Published: {selectedBook.published_date}
                      </Text>
                    )}
                    {selectedBook.page_count && (
                      <Text style={styles.modalMeta}>{selectedBook.page_count} pages</Text>
                    )}
                  </View>
                </View>

                {selectedBook.description && (
                  <View style={styles.modalDescriptionSection}>
                    <Text style={styles.modalSectionTitle}>Description</Text>
                    <Text style={styles.modalDescription}>{selectedBook.description}</Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.modalFindButton,
                      !selectedBook.isbn && styles.modalButtonDisabled,
                    ]}
                    onPress={() => handleFindOnMap(selectedBook)}
                    disabled={!selectedBook.isbn || isFindingLibraries}
                  >
                    <Ionicons name="map" size={20} color="#FFF" />
                    <Text style={styles.modalFindButtonText}>
                      {selectedBook.isbn ? 'Find on Map' : 'No ISBN Available'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.modalAddButton,
                      isBookInTbr(selectedBook) && styles.modalButtonDisabled,
                    ]}
                    onPress={() => {
                      handleAddRecommendedBook(selectedBook);
                    }}
                    disabled={isBookInTbr(selectedBook)}
                  >
                    <Ionicons
                      name={isBookInTbr(selectedBook) ? 'checkmark' : 'add'}
                      size={20}
                      color={isBookInTbr(selectedBook) ? '#6B7280' : '#0F172A'}
                    />
                    <Text
                      style={[
                        styles.modalAddButtonText,
                        isBookInTbr(selectedBook) && styles.modalAddButtonTextDisabled,
                      ]}
                    >
                      {isBookInTbr(selectedBook) ? 'In Collection' : 'Add to Collection'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setSelectedBook(null)}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBannerText: {
    flex: 1,
  },
  searchBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  searchBannerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  searchBannerClose: {
    padding: 4,
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
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationChipActive: {
    backgroundColor: '#E0ECF2',
    borderColor: '#4A90A4',
  },
  locationChipText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  locationChipTextActive: {
    color: '#0F1115',
  },
  map: {
    width: '100%',
    height: SCREEN_HEIGHT,
    flex: 1,
  },
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    top: -7,
    left: -7,
  },
  searchBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#050505',
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 4.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
  },
  searchInput: {
    flex: 1,
    color: '#F7F7F7',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 10,
  },
  searchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Recommendations styles
  recommendationsContainer: {
    position: 'absolute',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  recommendationsScroll: {
    gap: 12,
  },
  recommendationCard: {
    width: 100,
    alignItems: 'center',
  },
  recommendationCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
  },
  recommendationCoverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 6,
  },
  recommendationAuthor: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  modalCover: {
    width: 100,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#E8E8E8',
  },
  modalCoverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  modalMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  modalDescriptionSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  modalActions: {
    gap: 12,
    paddingBottom: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  modalFindButton: {
    backgroundColor: '#4A90A4',
  },
  modalFindButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  modalAddButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalAddButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalAddButtonTextDisabled: {
    color: '#6B7280',
  },
  modalButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  // Genre styles
  genreBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  genreLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    marginLeft: 4,
  },
  genreChips: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  genreChipActive: {
    borderColor: '#4A90A4',
    backgroundColor: '#EFF8FC',
  },
  genreIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genreChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  genreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  overlayBack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  genreSheet: {
    maxHeight: '70%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -6 },
    shadowRadius: 12,
    elevation: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetBookRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  sheetCover: {
    width: 64,
    height: 92,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
  },
  sheetText: {
    flex: 1,
    gap: 4,
  },
  sheetBookTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetBookAuthor: {
    fontSize: 12,
    color: '#6B7280',
  },
  sheetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sheetMetaText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  sheetDescription: {
    fontSize: 12,
    color: '#4B5563',
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  sheetButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 10,
    alignItems: 'center',
  },
  sheetButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  sheetButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  sheetButtonTextMuted: {
    color: '#6B7280',
  },
  sheetFindButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sheetFindText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
});
