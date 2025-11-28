import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SurpriseBag } from '@/api/surpriseBags';
import { formatArgentinePeso } from '@/utils/currency';

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
            <Text style={styles.bagsLeftText}>Quedan {bags_left}</Text>
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
            Buscar: {pickup_time_window} hs
          </Text>
        )}

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.discountedPrice}>
            {formatArgentinePeso(price)}
          </Text>
          {original_price && parseFloat(original_price) > parseFloat(price) && (
            <Text style={styles.originalPrice}>
              {formatArgentinePeso(original_price)} pesos
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
          <Text style={styles.distance}>0 km</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bagsLeftBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  bagsLeftText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  pickupTime: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  storeLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  placeholderLogo: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  distance: {
    fontSize: 13,
    color: '#666',
  },
});

