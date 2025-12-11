import { getSurpriseBags, SurpriseBag } from '@/api/surpriseBags';
import SurpriseBagCard from '@/components/SurpriseBagCard';
import { useLocationContext } from '@/contexts/LocationContext';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/styles/app/main_navigation/IndexScreen.styles';

export default function InicioScreen() {
  const router = useRouter();
  const { currentNeighbourhood, isLoadingLocation } = useLocationContext();
  const [surpriseBags, setSurpriseBags] = useState<SurpriseBag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSurpriseBags = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use neighbourhood from user's location or default (Palermo)
      const data = await getSurpriseBags(currentNeighbourhood);
      setSurpriseBags(data);
    } catch (err: any) {
      console.error('Error loading surprise bags:', err);
      // Error toast is already shown by the API function
      setError(t('errors.loadSurpriseBags'));
    } finally {
      setLoading(false);
    }
  };

  // Only fetch when screen is focused and location is loaded
  useFocusEffect(
    useCallback(() => {
      if (!isLoadingLocation && currentNeighbourhood) {
        loadSurpriseBags();
      }
    }, [currentNeighbourhood, isLoadingLocation])
  );

  const handleCardPress = (surpriseBag: SurpriseBag) => {
    router.push({
      pathname: '/SurpriseBagDetailsScreen',
      params: { id: surpriseBag.id.toString() },
    });
  };

  const renderItem = ({ item }: { item: SurpriseBag }) => (
    <SurpriseBagCard
      surpriseBag={item}
      onPress={() => handleCardPress(item)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.locationButton} disabled>
            <Text style={styles.locationText}>{t('inicio.location')}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={styles.loadingText}>{t('inicio.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.locationButton} disabled>
            <Text style={styles.locationText}>{t('inicio.location')}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadSurpriseBags}
          >
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationButton} disabled>
          <Text style={styles.locationText}>{t('inicio.location')}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      {surpriseBags.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>{t('inicio.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={surpriseBags}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
