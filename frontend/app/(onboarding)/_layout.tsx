import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="name" />
      <Stack.Screen name="genres" />
      <Stack.Screen name="format" />
      <Stack.Screen name="last-book" />
    </Stack>
  );
}
