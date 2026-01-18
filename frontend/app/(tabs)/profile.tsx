import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { genres } from '@/data/genres';
import { updateFavoriteGenres, updateLastBookRead } from '@/services/api';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const displayName = user?.name?.trim() || 'Reader';
  const username = user?.email ? user.email.split('@')[0] : 'reader';
  const initials = displayName.slice(0, 1).toUpperCase();

  // State for editing
  const [isEditingGenres, setIsEditingGenres] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(user?.favoriteGenres || []);
  const [lastBook, setLastBook] = useState(user?.lastBookRead || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when user changes
  useEffect(() => {
    setSelectedGenres(user?.favoriteGenres || []);
    setLastBook(user?.lastBookRead || '');
  }, [user]);

  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSaveGenres = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      await updateFavoriteGenres(user.id, selectedGenres);
      setIsEditingGenres(false);
    } catch (error) {
      console.warn('Failed to save genres', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLastBook = async () => {
    if (!user?.id || !lastBook.trim()) return;
    setIsSaving(true);
    try {
      await updateLastBookRead(user.id, lastBook.trim());
    } catch (error) {
      console.warn('Failed to save last book', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get genre labels for display
  const selectedGenreLabels = genres
    .filter((g) => selectedGenres.includes(g.id))
    .map((g) => `${g.emoji} ${g.label}`);

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 20 }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Profile</Text>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{initials}</Text>
          </View>
          <View style={styles.cameraBadge}>
            <Ionicons name="camera-outline" size={14} color="#FFF" />
          </View>
        </View>

        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.username}>@{username}</Text>
      </View>

      {/* Create Post CTA */}
      <TouchableOpacity
        style={styles.createPostCard}
        activeOpacity={0.85}
        onPress={() => router.push('/create-post')}
      >
        <View style={styles.createPostLeft}>
          <Ionicons name="create-outline" size={20} color="#0F172A" />
          <View>
            <Text style={styles.createPostTitle}>Share a post</Text>
            <Text style={styles.createPostSubtitle}>
              Drop a quick review for the community feed.
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Last Book Read Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last Book I Read</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="book-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter the last book you read..."
            placeholderTextColor="#9CA3AF"
            value={lastBook}
            onChangeText={setLastBook}
            onBlur={handleSaveLastBook}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Favorite Genres Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Favorite Genres</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditingGenres(!isEditingGenres)}
          >
            <Ionicons
              name={isEditingGenres ? 'close' : 'pencil'}
              size={16}
              color="#4A90A4"
            />
            <Text style={styles.editButtonText}>
              {isEditingGenres ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {isEditingGenres ? (
          <>
            <View style={styles.genresGrid}>
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
                      <Ionicons name="checkmark-circle" size={16} color="#4A90A4" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveGenres}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                  <Text style={styles.saveButtonText}>Save Genres</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.genresDisplay}>
            {selectedGenreLabels.length > 0 ? (
              <View style={styles.genreTagsContainer}>
                {selectedGenreLabels.map((label, index) => (
                  <View key={index} style={styles.genreTag}>
                    <Text style={styles.genreTagText}>{label}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noGenresText}>
                No favorite genres selected. Tap Edit to add some!
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 24,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 12,
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E0ECF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2B4A5A',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4A90A4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  username: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: '#4A90A4',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A2E',
    paddingVertical: 14,
  },
  genresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 4,
  },
  genreChipSelected: {
    backgroundColor: '#F0F7FA',
    borderColor: '#4A90A4',
  },
  genreEmoji: {
    fontSize: 14,
  },
  genreLabel: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  genreLabelSelected: {
    color: '#4A90A4',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90A4',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#93B8C4',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  genresDisplay: {
    marginTop: -4,
  },
  createPostCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  createPostLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  createPostTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  createPostSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  genreTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: '#F0F7FA',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  genreTagText: {
    fontSize: 13,
    color: '#4A90A4',
    fontWeight: '500',
  },
  noGenresText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});
