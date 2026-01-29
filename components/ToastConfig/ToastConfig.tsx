import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ToastConfigParams } from 'react-native-toast-message';

import styles from '@/styles/components/ToastConfig.styles';

interface ErrorRetryToastProps {
  onRetry?: () => void;
}

export const toastConfig = {
  errorRetry: ({ text1, text2, props }: ToastConfigParams<ErrorRetryToastProps>) => (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{text1}</Text>
        <Text style={styles.message}>{text2}</Text>
      </View>
      <TouchableOpacity 
        style={styles.button} 
        onPress={props.onRetry}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  ),
};