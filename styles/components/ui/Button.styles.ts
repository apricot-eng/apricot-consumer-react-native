import { StyleSheet } from 'react-native';

import { FigmaColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: FigmaColors.earthBrown,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: FigmaColors.earthBrown,
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: FigmaColors.white,
  },
  secondaryText: {
    color: FigmaColors.earthBrown,
  },
  tertiaryText: {
    color: FigmaColors.earthBrown,
  },
});

export default styles;
