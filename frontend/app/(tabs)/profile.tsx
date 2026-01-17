import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const displayName = user?.name?.trim() || 'Reader';
  const username = user?.email ? user.email.split('@')[0] : 'reader';
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
        },
      ]}
    >
      <Text style={styles.screenTitle}>Profile</Text>

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

        <View style={styles.followRow}>
          <View style={styles.followStat}>
            <Text style={styles.followNumber}>248</Text>
            <Text style={styles.followLabel}>Following</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.followStat}>
            <Text style={styles.followNumber}>1.3k</Text>
            <Text style={styles.followLabel}>Followers</Text>
          </View>
        </View>
      </View>
    </View>
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
    marginBottom: 16,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 14,
  },
  followStat: {
    flex: 1,
    alignItems: 'center',
  },
  followNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  followLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
});
