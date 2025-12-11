import { getStoreById, Store } from '@/api/stores';
import { getSurpriseBagById, SurpriseBag } from '@/api/surpriseBags';
import { FigmaColors } from '@/constants/theme';
import { t } from '@/i18n';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { formatArgentinePeso } from '@/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from '@/styles/app/SurpriseBagDetailsScreen.styles';

export default function SurpriseBagDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [surpriseBag, setSurpriseBag] = useState<SurpriseBag | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allergenModalVisible, setAllergenModalVisible] = useState(false);

  // Only fetch when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadDetails = async () => {
        try {
          setLoading(true);
          const id = parseInt(params.id as string);
          if (isNaN(id)) {
            throw new Error(t('errors.invalidId'));
          }
          const data = await getSurpriseBagById(id);
          setSurpriseBag(data);

          // Fetch full store details only if authenticated and store_id is available
          if (data.store_id) {
            try {
              // Check if user is authenticated before attempting to fetch store details
              const token = await AsyncStorage.getItem('auth_token');
              if (token) {
                const storeData = await getStoreById(data.store_id);
                setStore(storeData);
              }
              // If not authenticated, silently use the store data from surprise bag response
            } catch (storeError: any) {
              // Only log if it's not a 401 (unauthorized) error
              // 401 is expected when user is not authenticated
              if (storeError?.response?.status !== 401) {
                console.warn('Could not fetch full store details:', storeError);
              }
              // Silently fall back to using store data from surprise bag
            }
          }
        } catch (err: any) {
          console.error('Error loading surprise bag details:', err);
          setError(t('errors.loadDetails'));
        } finally {
          setLoading(false);
        }
      };

      if (params.id) {
        loadDetails();
      }
    }, [params.id])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={FigmaColors.earthBrown} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !surpriseBag) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>{error || t('errors.notFound')}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const categoryIcon = getCategoryIcon(surpriseBag.category);
  const displayStore = store || surpriseBag.store;
  
  // Format address for display
  const formattedAddress = store?.address
    ? `${store.address}${store.postal_code ? `, ${store.postal_code}` : ''}${store.city ? `\n${store.city}` : ''}${store.province ? `, ${store.province}` : ''}`
    : displayStore?.neighbourhood || '';

  // Show warning if bags_left is 1 (hidden for now as per requirements)
  const showWarning = false; // surpriseBag.bags_left === 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          {surpriseBag.photo ? (
            <ExpoImage
              source={{ uri: surpriseBag.photo }}
              style={styles.heroImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.heroImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={64} color="#ccc" />
            </View>
          )}

          {/* Gradient Overlay */}
          <View style={styles.gradientOverlay} />

          {/* Navigation Buttons */}
          <View style={styles.navContainer}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ExpoImage
                source={require('@/assets/images/nav/back.svg')}
                style={styles.navIcon}
                contentFit="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                // TODO: Implement favorites API
              }}
              activeOpacity={0.7}
            >
              <ExpoImage
                source={require('@/assets/images/nav/favourite.svg')}
                style={styles.navIcon}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Title and Logo */}
          <View style={styles.titleContainer}>
            {displayStore?.logo && (
              <View style={styles.logoContainer}>
                <ExpoImage
                  source={{ uri: displayStore.logo }}
                  style={styles.logo}
                  contentFit="cover"
                  transition={200}
                />
              </View>
            )}
            <Text style={styles.heroTitle}>{surpriseBag.title}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Warning Banner (hidden for now) */}
          {showWarning && (
            <View style={styles.warningBanner}>
              <ExpoImage
                source={require('@/assets/images/ui-icons/alert.svg')}
                style={styles.warningIcon}
                contentFit="contain"
              />
              <View style={styles.warningTextContainer}>
                <Text style={styles.warningTextBold}>
                  {t('details.quedaSolo')} 1{'\n'}
                </Text>
                <Text style={styles.warningText}>
                  {t('details.compraAntes')}
                </Text>
              </View>
            </View>
          )}

          {/* Category and Price Row */}
          <View style={styles.categoryPriceRow}>
            <View style={styles.categoryContainer}>
              {categoryIcon && (
                <ExpoImage
                  source={categoryIcon}
                  style={styles.categoryIcon}
                  contentFit="contain"
                />
              )}
              <Text style={styles.categoryText}>
                {surpriseBag.category.charAt(0).toUpperCase() + surpriseBag.category.slice(1)}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              {surpriseBag.original_price && parseFloat(surpriseBag.original_price) > parseFloat(surpriseBag.price) && (
                <Text style={styles.originalPrice}>
                  {formatArgentinePeso(surpriseBag.original_price)}
                </Text>
              )}
              <Text style={styles.discountedPrice}>
                {formatArgentinePeso(surpriseBag.price)}
              </Text>
            </View>
          </View>

          {/* Pickup Time and OI Pill */}
          <View style={styles.pickupRow}>
            <View style={styles.pickupContainer}>
              <ExpoImage
                source={require('@/assets/images/ui-icons/clock.svg')}
                style={styles.pickupIcon}
                contentFit="contain"
              />
              <Text style={styles.pickupText}>
                {t('details.pickup')}: {surpriseBag.pickup_time_window || '9:00 - 14:00'} hs
              </Text>
            </View>
            <View style={styles.oiPill}>
              <Text style={styles.oiPillText}>{t('details.pickupHoy')}</Text>
            </View>
          </View>

          {/* Rating */}
          {surpriseBag.star_rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>
                <Text style={styles.ratingNumber}>
                  {parseFloat(surpriseBag.star_rating).toFixed(1)}{' '}
                </Text>
                <Text style={styles.ratingCount}>(245)</Text>
              </Text>
            </View>
          )}

          {/* Dotted Separator */}
          <View style={styles.dottedSeparator} />

          {/* Location */}
          <View style={styles.locationContainer}>
            <ExpoImage
              source={require('@/assets/images/ui-icons/location-pin.svg')}
              style={styles.locationIcon}
              contentFit="contain"
            />
            <Text style={styles.locationText}>{formattedAddress}</Text>
          </View>

          {/* Dotted Separator */}
          <View style={styles.dottedSeparator} />

          {/* What You Can Receive */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>{t('details.quePodesRecibir')}</Text>
            {surpriseBag.description && (
              <Text style={styles.descriptionText}>{surpriseBag.description}</Text>
            )}
          </View>

          {/* Allergens Link */}
          <TouchableOpacity
            style={styles.allergenLink}
            onPress={() => setAllergenModalVisible(true)}
          >
            <Text style={styles.allergenLinkText}>
              {t('details.ingredientesYAlergenos')}
            </Text>
          </TouchableOpacity>

          {/* Dotted Separator */}
          <View style={styles.dottedSeparator} />

          {/* Reusable Bag Disclaimer */}
          <Text style={styles.disclaimerText}>
            {t('details.reusableBagDisclaimer')}
          </Text>

          {/* Map Section (Placeholder) */}
          <View style={styles.mapSection}>
            <View style={styles.dottedSeparatorTop} />
            <Text style={styles.mapTitle}>{t('details.mapa')}</Text>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>
                {t('details.comingSoon')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA Button */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
          <Text style={styles.ctaButtonText}>{t('details.comprar')}</Text>
        </TouchableOpacity>
      </View>

      {/* Allergen Modal */}
      <Modal
        visible={allergenModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAllergenModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('details.ingredientesYAlergenos')}
              </Text>
              <TouchableOpacity
                onPress={() => setAllergenModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={FigmaColors.textBlack} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>
                {surpriseBag.allergens || t('details.comingSoon')}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}