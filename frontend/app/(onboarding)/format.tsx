import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { readingFormats } from '@/data/genres';

export default function OnboardingFormatScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ name: string; genres: string }>();
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  const toggleFormat = (formatId: string) => {
    setSelectedFormats((prev) =>
      prev.includes(formatId)
        ? prev.filter((id) => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleContinue = () => {
    router.push({
      pathname: '/(onboarding)/last-book',
      params: {
        name: params.name,
        genres: params.genres,
        formats: selectedFormats.join(','),
      },
    });
  };

  const handleSkip = () => {
    router.push({
      pathname: '/(onboarding)/last-book',
      params: {
        name: params.name,
        genres: params.genres,
        formats: '',
      },
    });
  };

  return (
    <Pressable style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]} onPress={Keyboard.dismiss}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.progressDotCompleted]} />
        <View style={[styles.progressDot, styles.progressDotCompleted]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>

      {/* Title */}
      <Text style={styles.title}>How do you read?</Text>
      <Text style={styles.subtitle}>
        Select all that apply - we'll help you find books in your preferred format
      </Text>

      {/* Format Options */}
      <View style={styles.formatsContainer}>
        {readingFormats.map((format) => {
          const isSelected = selectedFormats.includes(format.id);
          return (
            <TouchableOpacity
              key={format.id}
              style={[styles.formatCard, isSelected && styles.formatCardSelected]}
              onPress={() => toggleFormat(format.id)}
              activeOpacity={0.7}
            >
              <View style={styles.formatContent}>
                <Text style={styles.formatEmoji}>{format.emoji}</Text>
                <View style={styles.formatTextContainer}>
                  <Text style={[styles.formatLabel, isSelected && styles.formatLabelSelected]}>
                    {format.label}
                  </Text>
                  <Text style={styles.formatDescription}>{format.description}</Text>
                </View>
              </View>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFF" />
      </TouchableOpacity>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  formatsContainer: {
    gap: 12,
  },
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formatCardSelected: {
    backgroundColor: '#F0F7FA',
    borderColor: '#4A90A4',
  },
  formatContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  formatEmoji: {
    fontSize: 32,
  },
  formatTextContainer: {
    flex: 1,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  formatLabelSelected: {
    color: '#4A90A4',
  },
  formatDescription: {
    fontSize: 13,
    color: '#888',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4A90A4',
    borderColor: '#4A90A4',
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
