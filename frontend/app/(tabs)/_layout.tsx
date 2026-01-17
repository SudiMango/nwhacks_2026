import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const navWidth = width * 0.6;
  const sideOffset = (width - navWidth) / 2;
  const barHeight = Math.max(58, width * 0.14);
  const barHorizontalPadding = width * 0.05;
  const barVerticalPadding = width * 0.015;
  const barRadius = barHeight / 2;
  const bottomOffset = width * 0.04;
  const tabIconSize = width * 0.06;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#0F172A',
        tabBarInactiveTintColor: '#A0A0AE',
        tabBarButton: HapticTab,
        tabBarStyle: [
          styles.tabBar,
          {
            left: sideOffset,
            right: sideOffset,
            height: barHeight,
            paddingHorizontal: barHorizontalPadding,
            paddingTop: barVerticalPadding,
            paddingBottom: barVerticalPadding,
            borderRadius: barRadius,
            bottom: bottomOffset,
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="map-outline" size={tabIconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="book"
        options={{
          title: 'See Book',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="book-outline" size={tabIconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mybooks"
        options={{
          title: 'My Books',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="book-outline" size={tabIconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 18,
  },
  tabBarItem: {
    marginTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
