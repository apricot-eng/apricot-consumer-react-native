import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { LocationProvider } from '@/contexts/LocationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserLocation } from '@/hooks/useUserLocation';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { hasLocation, loading } = useUserLocation();

  // Show loading state while checking location
  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#794509" />
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  // App always proceeds - default location (Palermo) is set automatically if needed
  // Location screen is still accessible via navigation if users want to change location
  return (
    <SafeAreaProvider>
      <LocationProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="surprise-bag-details" 
              options={{ 
                presentation: 'card',
                headerShown: false,
              }} 
            />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen 
              name="location" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
              }} 
            />
          </Stack>
          <StatusBar style="auto" />
          <Toast />
        </ThemeProvider>
      </LocationProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
