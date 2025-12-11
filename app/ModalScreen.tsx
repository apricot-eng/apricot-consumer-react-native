import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { styles } from '@/styles/app/ModalScreen.styles';

export default function ModalScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    router.dismiss();
    router.push('/main_navigation/IndexScreen' as any);
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
