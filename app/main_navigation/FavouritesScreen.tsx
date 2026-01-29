import { t } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { styles } from './FavouritesScreen.styles';

export default function FavouritesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="heart-outline" size={64} color="#ccc" />
        <Text style={styles.text}>{t('placeholders.underDevelopment')}</Text>
      </View>
    </SafeAreaView>
  );
}

