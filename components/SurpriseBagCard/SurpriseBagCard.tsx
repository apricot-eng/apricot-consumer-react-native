import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SurpriseBag } from '@/api/surpriseBags';
import { formatArgentinePeso } from '@/utils/currency';
import { t } from '@/i18n';
import { styles } from './SurpriseBagCard.styles';

interface SurpriseBagCardProps {
  surpriseBag: SurpriseBag;
  onPress: () => void;
}

export default function SurpriseBagCard({ surpriseBag, onPress }: SurpriseBagCardProps) {
  const {
    title,
    description,
    price,
    original_price,
    star_rating,
    photo,
    store,
    bags_left,
    pickup_time_window,
  } = surpriseBag;

  // Truncate description to 2 lines
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const displayDescription = description ? truncateText(description, 80) : '';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Image Container with Rating Badge */}
      <View style={styles.imageContainer}>
        {photo ? (
          <ExpoImage
            source={{ uri: photo }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
        
        {/* Rating Badge */}
        {star_rating && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{parseFloat(star_rating).toFixed(1)}</Text>
          </View>
        )}

        {/* Bags Left Badge */}
        {bags_left !== undefined && bags_left !== null && (
          <View style={styles.bagsLeftBadge}>
            <Text style={styles.bagsLeftText}>{t('surpriseBag.quedan')} {bags_left}</Text>
          </View>
        )}
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* Description */}
        {displayDescription && (
          <Text style={styles.description} numberOfLines={2}>
            {displayDescription}
          </Text>
        )}

        {/* Pickup Time Window */}
        {pickup_time_window && (
          <Text style={styles.pickupTime}>
            {t('surpriseBag.buscar')}: {pickup_time_window} hs
          </Text>
        )}

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.discountedPrice}>
            {formatArgentinePeso(price)}
          </Text>
          {original_price && parseFloat(original_price) > parseFloat(price) && (
            <Text style={styles.originalPrice}>
              {formatArgentinePeso(original_price)} {t('surpriseBag.pesos')}
            </Text>
          )}
        </View>

        {/* Store Info */}
        <View style={styles.storeRow}>
          {store?.logo ? (
            <ExpoImage
              source={{ uri: store.logo }}
              style={styles.storeLogo}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.storeLogo, styles.placeholderLogo]}>
              <Ionicons name="storefront-outline" size={16} color="#666" />
            </View>
          )}
          {store?.store_name && (
            <Text style={styles.storeName} numberOfLines={1}>
              {store.store_name}
            </Text>
          )}
          <Text style={styles.distance}>0 {t('surpriseBag.km')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}



