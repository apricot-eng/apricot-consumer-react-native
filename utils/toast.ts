import { t } from '@/i18n';
import { ErrorType } from '@/utils/error';
import Toast from 'react-native-toast-message';

interface ErrorInfo {
  title: string;
  message: string;
}

const getErrorInfo = (type: ErrorType, customMessage?: string): ErrorInfo => {
  const basePath = `errors.${type}`;
  
  return {
    title: t(`${basePath}.title`),
    message: customMessage || t(`${basePath}.message`),
  };
};

export const showErrorToast = (
  type: ErrorType,
  customMessage?: string
) => {
  const errorInfo = getErrorInfo(type, customMessage);
  
  Toast.show({
    type: 'error',
    text1: errorInfo.title,
    text2: errorInfo.message,
    position: 'top',
    visibilityTime: 4000,
  });
};

export const showSuccessToast = (message: string) => {
  Toast.show({
    type: 'success',
    text1: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showInfoToast = (message: string) => {
  Toast.show({
    type: 'info',
    text1: message,
    position: 'top',
    visibilityTime: 3000,
  });
};
