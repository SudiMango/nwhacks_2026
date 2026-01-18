import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { genres } from '@/data/genres';
import { updateFavoriteGenres, generateRecommendations } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingGenresScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ name: string }>();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleContinue = async () => {
    try {
      setIsSaving(true);
      if (user?.id && selectedGenres.length > 0) {
        await updateFavoriteGenres(user.id, selectedGenres);
        // Kick off recommendations generation (fire-and-forget)
        generateRecommendations(user.id).catch((err) =>
          console.warn('Failed to generate recommendations', err),
        );
      }
    } catch (error) {
      console.warn('Failed to save favorite genres', error);
    } finally {
      setIsSaving(false);
      router.push({
        pathname: '/(onboarding)/format',
        params: { name: params.name, genres: selectedGenres.join(',') },
      });
    }
  };

  const handleSkip = () => {
    router.push({
      pathname: '/(onboarding)/format',
      params: { name: params.name, genres: '' },
    });
  };

  return (
    <Pressable style={[styles.container, { paddingTop: insets.top + 20 }]} onPress={Keyboard.dismiss}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.progressDotCompleted]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
        <View style={styles.progressDot} />
      </View>

      {/* Title */}
      <Text style={styles.title}>What do you love to read?</Text>
      <Text style={styles.subtitle}>
        Select your favorite genres (pick as many as you like)
      </Text>

      {/* Genres Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.genresGrid}
        showsVerticalScrollIndicator={false}
      >
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.id);
          return (
            <TouchableOpacity
              key={genre.id}
              style={[styles.genreChip, isSelected && styles.genreChipSelected]}
              onPress={() => toggleGenre(genre.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.genreEmoji}>{genre.emoji}</Text>
              <Text style={[styles.genreLabel, isSelected && styles.genreLabelSelected]}>
                {genre.label}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={18} color="#4A90A4" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>
        {selectedGenres.length > 0 && (
          <Text style={styles.selectedCount}>
            {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
          </Text>
        )}
        <TouchableOpacity
          style={[styles.continueButton, isSaving && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={isSaving}
        >
          <Text style={styles.continueButtonText}>{isSaving ? 'Saving…' : 'Continue'}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8E8E8',
  },
  progressDotActive: {
    backgroundColor: '#4A90A4',
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: '#4A90A4',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  genresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  genreChipSelected: {
    backgroundColor: '#F0F7FA',
    borderColor: '#4A90A4',
  },
  genreEmoji: {
    fontSize: 16,
  },
  genreLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  genreLabelSelected: {
    color: '#4A90A4',
  },
  bottom: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  selectedCount: {
    fontSize: 14,
    color: '#4A90A4',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90A4',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#4A90A4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
