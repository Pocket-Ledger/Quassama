// hooks/useRTL.js
import { useTranslation } from 'react-i18next';
import { I18nManager } from 'react-native';
import { useMemo } from 'react';

export const useRTL = () => {
  const { i18n } = useTranslation();

  const isRTL = useMemo(() => {
    try {
      return I18nManager.isRTL || ['ar', 'he', 'fa', 'ur'].includes(i18n?.language || 'en');
    } catch (error) {
      console.warn('Error determining RTL direction:', error);
      return false;
    }
  }, [i18n?.language]);

  // Centralized RTL helper functions for Tailwind classes
  const getFlexDirection = () => (isRTL ? 'flex-row-reverse' : 'flex-row');

  const getTextAlign = (align = 'left') => {
    if (align === 'left') return isRTL ? 'text-right' : 'text-left';
    if (align === 'right') return isRTL ? 'text-left' : 'text-right';
    return align;
  };

  const getMargin = (side, size) => {
    if (side === 'left') return isRTL ? `mr-${size}` : `ml-${size}`;
    if (side === 'right') return isRTL ? `ml-${size}` : `mr-${size}`;
    return `m${side}-${size}`;
  };

  const getPadding = (side, size) => {
    if (side === 'left') return isRTL ? `pr-${size}` : `pl-${size}`;
    if (side === 'right') return isRTL ? `pl-${size}` : `pr-${size}`;
    return `p${side}-${size}`;
  };

  const getPosition = (side, size) => {
    if (side === 'left') return isRTL ? `right-${size}` : `left-${size}`;
    if (side === 'right') return isRTL ? `left-${size}` : `right-${size}`;
    return `${side}-${size}`;
  };

  const getBorder = (side, size) => {
    if (side === 'left') return isRTL ? `border-r-${size}` : `border-l-${size}`;
    if (side === 'right') return isRTL ? `border-l-${size}` : `border-r-${size}`;
    return `border-${side}-${size}`;
  };

  const getRounded = (corner, size = '') => {
    const sizeStr = size ? `-${size}` : '';
    switch (corner) {
      case 'tl': // top-left
        return isRTL ? `rounded-tr${sizeStr}` : `rounded-tl${sizeStr}`;
      case 'tr': // top-right
        return isRTL ? `rounded-tl${sizeStr}` : `rounded-tr${sizeStr}`;
      case 'bl': // bottom-left
        return isRTL ? `rounded-br${sizeStr}` : `rounded-bl${sizeStr}`;
      case 'br': // bottom-right
        return isRTL ? `rounded-bl${sizeStr}` : `rounded-br${sizeStr}`;
      case 'l': // left
        return isRTL ? `rounded-r${sizeStr}` : `rounded-l${sizeStr}`;
      case 'r': // right
        return isRTL ? `rounded-l${sizeStr}` : `rounded-r${sizeStr}`;
      default:
        return `rounded-${corner}${sizeStr}`;
    }
  };

  // Icon direction helper
  const getIconDirection = (iconName) => {
    const rtlIcons = {
      'chevron-left': isRTL ? 'chevron-right' : 'chevron-left',
      'chevron-right': isRTL ? 'chevron-left' : 'chevron-right',
      'arrow-left': isRTL ? 'arrow-right' : 'arrow-left',
      'arrow-right': isRTL ? 'arrow-left' : 'arrow-right',
      'chevron-back': isRTL ? 'chevron-forward' : 'chevron-back',
    };

    return rtlIcons[iconName] || iconName;
  };

  return {
    isRTL,
    getFlexDirection,
    getTextAlign,
    getMargin,
    getPadding,
    getPosition,
    getBorder,
    getRounded,
    getIconDirection,
  };
};
