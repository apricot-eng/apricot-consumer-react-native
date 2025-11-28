/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 * 
 * Colors are based on Figma design tokens.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// Figma Design Tokens
export const FigmaColors = {
  // Earth tones
  earthBrown: '#794509',
  earthDarker: '#65421a',
  earthUnsaturatedDarker: '#50463a',
  
  // Grays
  white: '#FFFFFF',
  graysWhite: '#ffffff',
  
  // Text colors
  textSaveMe: '#3e3e3e',
  textSecondary: '#8d8d8d',
  textTertiary: '#8f8f8f',
  textBlack: '#000000',
  
  // Background colors
  backgroundLight: '#fffaf5',
  warningBackground: 'rgba(228,177,133,0.3)',
  warningText: '#c4320a',
  
  // Border colors
  borderDashed: '#b0b0b0',
  borderLight: '#a4a7ae',
  
  // Navigation
  navButtonBackground: 'rgba(255,255,255,0.22)',
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Figma colors
    ...FigmaColors,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Figma colors (same for now, will be updated when dark mode is implemented)
    ...FigmaColors,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
