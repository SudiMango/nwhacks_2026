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
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { locationPresets, LocationKey, recommendedByGenre, Book } from '@/data/mockData';
import { useBooks } from '@/context/BooksContext';
import { useLocalSearchParams, router } from 'expo-router';

import { useShareIntentContext } from "expo-share-intent";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const horizontalInset = Math.max(16, width * 0.07);
  const navEstimatedHeight = Math.max(58, width * 0.14); // mirror tab bar height logic
  const bottomOffset = Math.max(insets.bottom + 10, width * 0.02); // safe-area aware gap above tab bar
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationKey>('vancouver');
  const mapRef = useRef<MapView | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [highlightedLibraries, setHighlightedLibraries] = useState<any[]>([]);
  const [bookInfo, setBookInfo] = useState<{ title: string; author: string } | null>(null);

  const { addToTbr, isInTbr } = useBooks();

  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentContext();

  useEffect(() => {
    if (!hasShareIntent) return;

    const url = shareIntent?.webUrl;

    if (url?.includes("tiktok.com")) {
      console.log("IDSUHDSBIBSUHIBFHUBHIJNBHSJIHBHIHUH")
      resetShareIntent(); // VERY important
    }
  }, [hasShareIntent]);

  const genreButtons = useMemo(
    () => [
      { id: 'fantasy', label: 'Fantasy', icon: 'planet-outline', color: '#6D28D9' },
      { id: 'romance', label: 'Romance', icon: 'heart-outline', color: '#E07A5F' },
      { id: 'thriller', label: 'Thriller', icon: 'flash-outline', color: '#0F172A' },
    ],
    [],
  );

  const selectedGenreLabel = genreButtons.find((g) => g.id === selectedGenre)?.label;
  const genreBooks = selectedGenre ? recommendedByGenre[selectedGenre] || [] : [];

  const location = locationPresets[selectedLocation];

  useEffect(() => {
    const onShow = (e: any) => {
      setKeyboardOffset(e.endCoordinates?.height ?? 0);
      setKeyboardVisible(true);
      setSelectedGenre(null);
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
  const searchIdParam = params.searchId as string | undefined; // Unique ID to force refresh

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

        // Center map on user location if provided
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

  const handleAddToTbr = (book: Book) => {
    addToTbr(book);
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
        {/* Show highlighted libraries if available, otherwise show all libraries */}
        {(highlightedLibraries.length > 0 ? highlightedLibraries : location.libraries).map((library) => {
          const isHighlighted = highlightedLibraries.length > 0;
          const isAvailable = library.is_available === true;
          const availableAtBranch = library.available_at_this_branch === true;
          const notInCatalog = library.not_found === true;

          // Determine colors and icon
          let bgColor = '#4A90A4'; // Default blue for libraries
          let iconName: keyof typeof Ionicons.glyphMap = 'library';
          let statusText = '';

          if (isHighlighted) {
            if (availableAtBranch) {
              bgColor = '#10B981'; // Green - available here
              iconName = 'checkmark-circle';
              statusText = `Available (${library.copies || 0} copies)`;
            } else if (isAvailable) {
              bgColor = '#F59E0B'; // Orange - available elsewhere
              iconName = 'time';
              statusText = `At other branches`;
            } else if (notInCatalog) {
              bgColor = '#9CA3AF'; // Gray - not in catalog
              iconName = 'help-circle';
              statusText = 'Not in catalog';
            } else {
              bgColor = '#EF4444'; // Red - not available
              iconName = 'close-circle';
              statusText = `${library.holds || 0} holds`;
            }
          }

          // Build description
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

      {/* Genre quick picks above search */}
      {!keyboardVisible && (
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
            {genreButtons.map((genre) => (
              <TouchableOpacity
                key={genre.id}
                style={[styles.genreChip, selectedGenre === genre.id && styles.genreChipActive]}
                onPress={() => setSelectedGenre(genre.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.genreIconWrap]}>
                  <Ionicons name={genre.icon as any} size={18} color={genre.color} />
                </View>
                <Text style={styles.genreChipText}>{genre.label}</Text>
              </TouchableOpacity>
            ))}
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
          placeholder="spots to cowork from"
          placeholderTextColor="#C4C4CC"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchIcon} activeOpacity={0.7}>
          <Ionicons name="search" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Genre recommendations sheet */}
      {selectedGenre && !keyboardVisible && (
        <View style={styles.genreOverlay}>
          <TouchableOpacity
            style={styles.overlayBack}
            activeOpacity={1}
            onPress={() => setSelectedGenre(null)}
          />
          <View style={styles.genreSheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleRow}>
                <Ionicons name="sparkles" size={16} color="#0F172A" />
                <Text style={styles.sheetTitle}>Top {selectedGenreLabel} picks</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedGenre(null)}>
                <Ionicons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {genreBooks.map((book) => {
                const saved = isInTbr(book.isbn);
                return (
                  <View key={book.isbn} style={styles.sheetBookRow}>
                    <Image source={{ uri: book.coverUrl }} style={styles.sheetCover} />
                    <View style={styles.sheetText}>
                      <Text style={styles.sheetBookTitle} numberOfLines={2}>
                        {book.title}
                      </Text>
                      <Text style={styles.sheetBookAuthor} numberOfLines={1}>
                        {book.author}
                      </Text>
                      <View style={styles.sheetMetaRow}>
                        <Ionicons name="star" size={14} color="#F5A524" />
                        <Text style={styles.sheetMetaText}>
                          {book.rating ? book.rating.toFixed(1) : '4.5'} • {book.genre || 'Fiction'}
                        </Text>
                      </View>
                      <Text style={styles.sheetDescription} numberOfLines={2}>
                        {book.description}
                      </Text>
                      <View style={styles.sheetActions}>
                        <TouchableOpacity
                          style={[styles.sheetButton, saved && styles.sheetButtonDisabled]}
                          onPress={() => handleAddToTbr(book)}
                          disabled={saved}
                        >
                          <Text style={[styles.sheetButtonText, saved && styles.sheetButtonTextMuted]}>
                            {saved ? 'In TBR' : 'Add to TBR'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.sheetButton, styles.sheetFindButton]}
                          onPress={() => setSelectedGenre(null)}
                        >
                          <Ionicons name="location-outline" size={16} color="#0F172A" />
                          <Text style={styles.sheetFindText}>Find</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
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
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
