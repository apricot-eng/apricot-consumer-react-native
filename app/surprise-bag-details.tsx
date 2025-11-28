import { getStoreById, Store } from '@/api/stores';
import { getSurpriseBagById, SurpriseBag } from '@/api/surpriseBags';
import { FigmaColors } from '@/constants/theme';
import { t } from '@/i18n';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { formatArgentinePeso } from '@/utils/currency';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SurpriseBagDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [surpriseBag, setSurpriseBag] = useState<SurpriseBag | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allergenModalVisible, setAllergenModalVisible] = useState(false);

  useEffect(() => {
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
  }, [params.id]);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FigmaColors.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100, // Space for CTA button
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: FigmaColors.earthBrown,
    borderRadius: 8,
  },
  retryButtonText: {
    color: FigmaColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Hero Section
  heroContainer: {
    height: 238,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 103,
    backgroundColor: 'rgba(38, 38, 38, 0.5)',
  },
  navContainer: {
    position: 'absolute',
    top: 12,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: FigmaColors.navButtonBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    width: 21,
    height: 21,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: FigmaColors.borderLight,
    backgroundColor: FigmaColors.white,
    overflow: 'hidden',
    padding: 2,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: FigmaColors.white,
    flex: 1,
  },
  // Content Section
  contentSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  warningBanner: {
    backgroundColor: FigmaColors.warningBackground,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  warningIcon: {
    width: 24,
    height: 24,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTextBold: {
    fontSize: 16,
    fontWeight: '600',
    color: FigmaColors.textBlack,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '400',
    color: FigmaColors.textSaveMe,
  },
  categoryPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 20,
    height: 20,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: FigmaColors.textBlack,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: FigmaColors.textSecondary,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: FigmaColors.earthBrown,
    letterSpacing: -1,
  },
  pickupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickupIcon: {
    width: 20,
    height: 20,
  },
  pickupText: {
    fontSize: 16,
    fontWeight: '500',
    color: FigmaColors.textSaveMe,
  },
  oiPill: {
    backgroundColor: '#fff6ed',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  oiPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: FigmaColors.warningText,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 16,
  },
  ratingNumber: {
    fontWeight: '700',
    color: FigmaColors.textSaveMe,
    letterSpacing: -0.16,
  },
  ratingCount: {
    fontWeight: '400',
    color: FigmaColors.textTertiary,
  },
  dottedSeparator: {
    borderTopWidth: 1,
    borderTopColor: FigmaColors.borderDashed,
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  dottedSeparatorTop: {
    borderTopWidth: 1,
    borderTopColor: FigmaColors.borderDashed,
    borderStyle: 'dashed',
    marginTop: 16,
    marginBottom: 0,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 16,
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: FigmaColors.earthDarker,
    lineHeight: 24,
  },
  descriptionSection: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FigmaColors.textBlack,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '400',
    color: FigmaColors.textSaveMe,
    lineHeight: 24,
  },
  allergenLink: {
    paddingVertical: 16,
  },
  allergenLinkText: {
    fontSize: 16,
    fontWeight: '400',
    color: FigmaColors.textSaveMe,
  },
  disclaimerText: {
    fontSize: 16,
    fontWeight: '400',
    color: FigmaColors.textSaveMe,
    lineHeight: 24,
    paddingVertical: 8,
  },
  mapSection: {
    paddingTop: 0,
    paddingBottom: 40,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: FigmaColors.textBlack,
    marginTop: 16,
    marginBottom: 10,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#999',
  },
  // CTA Button
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: FigmaColors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButton: {
    backgroundColor: FigmaColors.earthUnsaturatedDarker,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: FigmaColors.white,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: FigmaColors.white,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: FigmaColors.textBlack,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: FigmaColors.textSaveMe,
    lineHeight: 24,
  },
});
