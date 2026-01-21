import { StyleSheet } from 'react-native';

import { FigmaColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    height: 80,
    width: '90%',
    backgroundColor: '#FEF2F2',
    borderLeftColor: FigmaColors.warningText,
    borderLeftWidth: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: FigmaColors.textBlack,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#B91C1C',
  },
  button: {
    backgroundColor: FigmaColors.warningText,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: FigmaColors.white,
    fontWeight: '600',
    fontSize: 12,
  },
});

export default styles;
