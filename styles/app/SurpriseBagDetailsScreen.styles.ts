import { StyleSheet } from 'react-native';

import { FigmaColors } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FigmaColors.backgroundLight
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100, // Space for CTA button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: FigmaColors.earthBrown,
    borderRadius: 8,
  },
  retryButtonText: {
    color: FigmaColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Hero Section
  heroContainer: {
    height: 238,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 103,
    backgroundColor: 'rgba(38, 38, 38, 0.5)',
  },
  navContainer: {
    position: 'absolute',
    top: 12,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: FigmaColors.navButtonBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    width: 21,
    height: 21,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: FigmaColors.borderLight,
    backgroundColor: FigmaColors.white,
    overflow: 'hidden',
    padding: 2,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: FigmaColors.white,
    flex: 1,
  },
  // Content Section
  contentSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  warningBanner: {
    backgroundColor: FigmaColors.warningBackground,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  warningIcon: {
    width: 24,
    height: 24,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTextBold: {
    fontSize: 16,
    fontWeight: '600',
    color: FigmaColors.textBlack,
  },
  warningText: {
    fontSize: 16,
    fontWeight: '400',
    color: FigmaColors.textSaveMe,
  },
  categoryPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 20,
    height: 20,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: FigmaColors.textBlack,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: FigmaColors.textSecondary,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: FigmaColors.earthBrown,
    letterSpacing: -1,
  },
  pickupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickupIcon: {
    width: 20,
    height: 20,
  },
  pickupText: {
    fontSize: 16,
    fontWeight: '500',
    color: FigmaColors.textSaveMe,
  },
  oiPill: {
    backgroundColor: '#fff6ed',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  oiPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: FigmaColors.warningText,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 16,
  },
  ratingNumber: {
    fontWeight: '700',
    color: FigmaColors.textSaveMe,
    letterSpacing: -0.16,
  },
  ratingCount: {
    fontWeight: '400',
    color: FigmaColors.textTertiary,
  },
  dottedSeparator: {
    borderTopWidth: 1,
    borderTopColor: FigmaColors.borderDashed,
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  dottedSeparatorTop: {
    borderTopWidth: 1,
    borderTopColor: FigmaColors.borderDashed,
    borderStyle: 'dashed',
    marginTop: 16,
    marginBottom: 0,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 16,
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: FigmaColors.earthDarker,
    lineHeight: 24,
  },
  descriptionSection: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FigmaColors.textBlack,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    fontWeight: '400',
    color: FigmaColors.textSaveMe,
    lineHeight: 24,
  },
  allergenLink: {
    paddingVertical: 16,
  },
  allergenLinkText: {
    fontSize: 16,
    fontWeight: '400',
    color: FigmaColors.textSaveMe,
  },
  disclaimerText: {
    fontSize: 16,
    fontWeight: '400',
    color: FigmaColors.textSaveMe,
    lineHeight: 24,
    paddingVertical: 8,
  },
  mapSection: {
    paddingTop: 0,
    paddingBottom: 40,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: FigmaColors.textBlack,
    marginTop: 16,
    marginBottom: 10,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#999',
  },
  // CTA Button
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: FigmaColors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButton: {
    backgroundColor: FigmaColors.earthUnsaturatedDarker,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: FigmaColors.white,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: FigmaColors.white,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: FigmaColors.textBlack,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: FigmaColors.textSaveMe,
    lineHeight: 24,
  },
});

export default styles;
