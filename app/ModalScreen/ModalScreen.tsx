import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { styles } from './ModalScreen.styles';

export function ModalScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    router.dismiss();
    router.push('/main_navigation/SupriseBagsBrowse' as any);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <TouchableOpacity onPress={handleGoHome} style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
