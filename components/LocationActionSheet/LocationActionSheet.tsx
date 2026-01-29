import { LocationSearchResult } from '@/api/locations';
import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { Button } from '@/components/Button';
import { styles } from '@/components/LocationActionSheet/LocationActionSheet.styles';

interface LocationActionSheetProps {
  distance: number;
  onDistanceChange: (value: number) => void;
  onDistanceSliderComplete: (value: number) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  isSearching: boolean;
  searchResults: LocationSearchResult[];
  onLocationSelect: (location: LocationSearchResult) => void;
  onUseCurrentLocation: () => void;
  onSelect: () => void;
  saving: boolean;
  selectedLocation?: LocationSearchResult | null;
}

export default function LocationActionSheet({
  distance,
  onDistanceChange,
  onDistanceSliderComplete,
  searchQuery,
  onSearchQueryChange,
  isSearching,
  searchResults,
  onLocationSelect,
  onUseCurrentLocation,
  onSelect,
  saving,
  selectedLocation,
}: LocationActionSheetProps) {
  return (
    <View style={styles.bottomSheet}>
      <ScrollView
        contentContainerStyle={styles.bottomSheetScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Distance Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>{t('location.distanceLabel')}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={50}
            value={distance}
            onValueChange={onDistanceChange}
            onSlidingComplete={onDistanceSliderComplete}
            minimumTrackTintColor="#794509"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#794509"
          />
          <Text style={styles.distanceValue}>{Math.round(distance)} km</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('location.searchPlaceholder')}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSearching && (
            <ActivityIndicator size="small" color="#666" style={styles.searchLoader} />
          )}

          {/* Predictive Search Overlay */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.id}
                  style={styles.searchResultItem}
                  onPress={() => onLocationSelect(result)}
                >
                  <Ionicons name="location" size={16} color="#794509" />
                  <Text style={styles.searchResultText} numberOfLines={1}>
                    {result.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {searchQuery.trim() && 
           searchResults.length === 0 && 
           !isSearching && 
           searchQuery !== selectedLocation?.display_name && (
            <View style={styles.searchResults}>
              <Text style={styles.noResultsText}>{t('location.noResults')}</Text>
            </View>
          )}
        </View>

        {/* Use Current Location */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={onUseCurrentLocation}
        >
          <Ionicons name="compass" size={20} color="#794509" />
          <Text style={styles.currentLocationText}>
            {t('location.useCurrentLocation')}
          </Text>
        </TouchableOpacity>

        {/* Select Button */}
        <Button
          variant="primary"
          onPress={onSelect}
          loading={saving}
          disabled={saving}
        >
          {t('location.select')}
        </Button>
      </ScrollView>
    </View>
  );
}
