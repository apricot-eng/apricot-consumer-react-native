import { Redirect } from 'expo-router';
import { useLocationContext } from '@/contexts/LocationContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isLoadingLocation } = useLocationContext();

  if (isLoadingLocation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#794509" />
      </View>
    );
  }

  // Guard Logic:
  // If we ever want to skip LocationScreen when a location is already saved,
  // we would check for it here.
  // For now, consistent with previous behavior, we always show LocationScreen first.
  
  return <Redirect href="/LocationScreen" />;
}
