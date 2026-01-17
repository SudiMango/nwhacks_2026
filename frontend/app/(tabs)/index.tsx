import React from 'react';
import { View, Text, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { mockLibraries, defaultRegion } from '@/data/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalInset = Math.max(16, width * 0.07);
  const bottomOffset = Math.max(12, width * 0.02);
  const navEstimatedHeight = Math.max(72, width * 0.18);

  return (
    <View style={styles.container}>
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

      {/* Search pill above nav */}
      <View
        style={[
          styles.searchBar,
          {
            left: horizontalInset,
            right: horizontalInset,
            bottom: bottomOffset + navEstimatedHeight,
          },
        ]}
      >
        <Text style={styles.searchText}>spots to cowork from</Text>
        <View style={styles.searchIcon}>
          <Ionicons name="search" size={18} color="#FFF" />
        </View>
      </View>
    </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    height: SCREEN_HEIGHT,
    flex: 1,
  },
  searchBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1115',
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 14,
  },
  searchText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
