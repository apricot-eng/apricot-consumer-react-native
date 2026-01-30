import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { toastConfig } from '@/components/ToastConfig';
import { LocationProvider } from '@/contexts/LocationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUserLocation } from '@/hooks/useUserLocation';

import { styles } from './_layoutx.styles';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { loading } = useUserLocation();

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
          <Stack
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Screen 
              name="SurpriseBagDetailsScreen" 
              options={{ 
                presentation: 'card',
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="ModalScreen" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
              }} 
            />
            <Stack.Screen 
              name="LocationScreen" 
              options={{ 
                presentation: 'card',
                animation: 'slide_from_bottom',
                gestureDirection: 'vertical',
                gestureEnabled: true,
                headerShown: false,
              }} 
            />
          </Stack>
          <StatusBar style="auto" />
          <Toast config={toastConfig} />
        </ThemeProvider>
      </LocationProvider>
    </SafeAreaProvider>
  );
}
