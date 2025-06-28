// utils/rtlStyles.js
import { I18nManager } from 'react-native';

// Check if current layout direction is RTL
export const isRTL = I18nManager.isRTL;

// RTL-aware style helpers
export const rtlStyles = {
  // Text alignment
  textLeft: {
    textAlign: isRTL ? 'right' : 'left',
  },
  textRight: {
    textAlign: isRTL ? 'left' : 'right',
  },

  // Flex direction
  row: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
  },
  rowReverse: {
    flexDirection: isRTL ? 'row' : 'row-reverse',
  },

  // Margin helpers
  marginLeft: (value) => ({
    [isRTL ? 'marginRight' : 'marginLeft']: value,
  }),
  marginRight: (value) => ({
    [isRTL ? 'marginLeft' : 'marginRight']: value,
  }),
  marginStart: (value) => ({
    [isRTL ? 'marginRight' : 'marginLeft']: value,
  }),
  marginEnd: (value) => ({
    [isRTL ? 'marginLeft' : 'marginRight']: value,
  }),

  // Padding helpers
  paddingLeft: (value) => ({
    [isRTL ? 'paddingRight' : 'paddingLeft']: value,
  }),
  paddingRight: (value) => ({
    [isRTL ? 'paddingLeft' : 'paddingRight']: value,
  }),
  paddingStart: (value) => ({
    [isRTL ? 'paddingRight' : 'paddingLeft']: value,
  }),
  paddingEnd: (value) => ({
    [isRTL ? 'paddingLeft' : 'paddingRight']: value,
  }),

  // Position helpers
  left: (value) => ({
    [isRTL ? 'right' : 'left']: value,
  }),
  right: (value) => ({
    [isRTL ? 'left' : 'right']: value,
  }),

  // Border radius helpers
  borderTopLeftRadius: (value) => ({
    [isRTL ? 'borderTopRightRadius' : 'borderTopLeftRadius']: value,
  }),
  borderTopRightRadius: (value) => ({
    [isRTL ? 'borderTopLeftRadius' : 'borderTopRightRadius']: value,
  }),
  borderBottomLeftRadius: (value) => ({
    [isRTL ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: value,
  }),
  borderBottomRightRadius: (value) => ({
    [isRTL ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: value,
  }),
};

// Tailwind-like class helpers for RTL
export const rtlClasses = {
  // Flex direction
  'flex-row': isRTL ? 'flex-row-reverse' : 'flex-row',
  'flex-row-reverse': isRTL ? 'flex-row' : 'flex-row-reverse',

  // Text alignment
  'text-left': isRTL ? 'text-right' : 'text-left',
  'text-right': isRTL ? 'text-left' : 'text-right',

  // Margin classes
  ml: (size) => (isRTL ? `mr-${size}` : `ml-${size}`),
  mr: (size) => (isRTL ? `ml-${size}` : `mr-${size}`),

  // Padding classes
  pl: (size) => (isRTL ? `pr-${size}` : `pl-${size}`),
  pr: (size) => (isRTL ? `pl-${size}` : `pr-${size}`),

  // Position classes
  left: (size) => (isRTL ? `right-${size}` : `left-${size}`),
  right: (size) => (isRTL ? `left-${size}` : `right-${size}`),
};

// Icon direction helper
export const getIconDirection = (iconName) => {
  const rtlIcons = {
    'chevron-left': isRTL ? 'chevron-right' : 'chevron-left',
    'chevron-right': isRTL ? 'chevron-left' : 'chevron-right',
    'arrow-left': isRTL ? 'arrow-right' : 'arrow-left',
    'arrow-right': isRTL ? 'arrow-left' : 'arrow-right',
  };

  return rtlIcons[iconName] || iconName;
};

// Format number for RTL languages
export const formatNumber = (number, locale = 'en') => {
  if (isRTL && locale.startsWith('ar')) {
    // Convert to Arabic-Indic digits if needed
    return number.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  }
  return number.toString();
};

// Format currency for RTL languages
export const formatCurrency = (amount, currency = 'USD', locale = 'en') => {
  if (isRTL && locale.startsWith('ar')) {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
