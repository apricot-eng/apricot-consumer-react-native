import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSurpriseBagById, SurpriseBag } from '@/api/surpriseBags';

export default function SurpriseBagDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [surpriseBag, setSurpriseBag] = useState<SurpriseBag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const id = parseInt(params.id as string);
        if (isNaN(id)) {
          throw new Error('Invalid surprise bag ID');
        }
        const data = await getSurpriseBagById(id);
        setSurpriseBag(data);
      } catch (err: any) {
        console.error('Error loading surprise bag details:', err);
        setError(err.message || 'Error al cargar los detalles');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !surpriseBag) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error || 'No se encontró la bolsa sorpresa'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.placeholderContainer}>
          <Ionicons name="information-circle-outline" size={64} color="#0a7ea4" />
          <Text style={styles.placeholderTitle}>Coming Soon</Text>
          <Text style={styles.placeholderText}>
            Full details page will be implemented later.
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{surpriseBag.title}</Text>
            {surpriseBag.description && (
              <Text style={styles.infoText}>{surpriseBag.description}</Text>
            )}
            {surpriseBag.store?.store_name && (
              <Text style={styles.infoText}>Store: {surpriseBag.store.store_name}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
});

