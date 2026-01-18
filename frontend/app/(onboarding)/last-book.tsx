import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { updateLastBookRead } from '@/services/api';

export default function OnboardingLastBookScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ name: string; genres: string; formats: string }>();
  const { completeOnboarding, isLoading } = useAuth();
  const { user } = useAuth();
  const [lastBook, setLastBook] = useState('');

  const handleFinish = async () => {
    await maybePersistLastBook(lastBook.trim());
    await completeOnboarding({
      name: params.name || 'Reader',
      favoriteGenres: params.genres ? params.genres.split(',') : [],
      readingFormat: params.formats?.includes('library')
        ? 'library'
        : params.formats?.includes('ebook')
        ? 'ebook'
        : 'both',
      lastBookRead: lastBook.trim(),
    });
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await maybePersistLastBook('');
    await completeOnboarding({
      name: params.name || 'Reader',
      favoriteGenres: params.genres ? params.genres.split(',') : [],
      readingFormat: params.formats?.includes('library')
        ? 'library'
        : params.formats?.includes('ebook')
        ? 'ebook'
        : 'both',
      lastBookRead: '',
    });
    router.replace('/(tabs)');
  };

  const maybePersistLastBook = async (bookName: string) => {
    try {
      if (user?.id) {
        await updateLastBookRead(user.id, bookName);
      }
    } catch (error) {
      console.warn('Failed to save last book read', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={isLoading}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="book-outline" size={48} color="#E07A5F" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Last book you read?</Text>
        <Text style={styles.subtitle}>
          This helps us understand your reading taste and recommend similar books
        </Text>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g., Fourth Wing by Rebecca Yarros"
            placeholderTextColor="#999"
            value={lastBook}
            onChangeText={setLastBook}
            autoCapitalize="words"
            multiline
            numberOfLines={2}
            textAlignVertical="center"
          />
        </View>

        {/* Suggestions */}
        <Text style={styles.orText}>or choose from popular picks:</Text>
        <View style={styles.suggestions}>
          {['Fourth Wing', 'It Ends with Us', 'ACOTAR'].map((book) => (
            <TouchableOpacity
              key={book}
              style={[styles.suggestionChip, lastBook === book && styles.suggestionChipSelected]}
              onPress={() => setLastBook(book)}
            >
              <Text style={[styles.suggestionText, lastBook === book && styles.suggestionTextSelected]}>
                {book}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Finish Button */}
        <TouchableOpacity
          style={[styles.finishButton, isLoading && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.finishButtonText}>Get Started</Text>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Welcome Message */}
        <Text style={styles.welcomeText}>
          Welcome to Bookmarked, {params.name || 'Reader'}! 📚
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
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
    backgroundColor: '#E07A5F',
    width: 24,
  },
  progressDotCompleted: {
    backgroundColor: '#4A90A4',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDF0ED',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    minHeight: 50,
  },
  orText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
  },
  suggestions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  suggestionChipSelected: {
    backgroundColor: '#E07A5F',
    borderColor: '#E07A5F',
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  suggestionTextSelected: {
    color: '#FFF',
  },
  finishButton: {
    flexDirection: 'row',
    backgroundColor: '#E07A5F',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#E07A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});
