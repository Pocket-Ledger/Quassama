import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

/**
 * CategoryItem Component
 *
 * A reusable component for displaying individual category items
 *
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the category
 * @param {string} props.name - Display name of the category
 * @param {string} props.icon - Feather icon name
 * @param {string} props.color - Icon and selection color (default: '#2979FF')
 * @param {boolean} props.isSelected - Whether this category is selected
 * @param {Function} props.onPress - Callback function when item is pressed
 * @param {'grid'|'list'|'icon-only'} props.variant - Display variant (default: 'grid')
 * @param {string} props.size - Size variant ('small'|'medium'|'large') (default: 'medium')
 * @param {boolean} props.showLabel - Whether to show the category label (default: true)
 * @param {Object} props.customStyle - Custom styles to override defaults
 */
const CategoryItem = ({
  id,
  name,
  icon,
  color = '#2979FF',
  isSelected = false,
  onPress,
  variant = 'grid',
  size = 'medium',
  showLabel = true,
  customStyle = {},
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      iconContainer: 'h-8 w-8',
      iconSize: 16,
      textSize: 'text-xs',
      containerPadding: 'p-1',
    },
    medium: {
      iconContainer: 'h-12 w-12',
      iconSize: 20,
      textSize: 'text-sm',
      containerPadding: 'p-2',
    },
    large: {
      iconContainer: 'h-16 w-16',
      iconSize: 24,
      textSize: 'text-base',
      containerPadding: 'p-3',
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.medium;

  // Variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'list':
        return {
          container: 'flex-row items-center p-3 border-b border-gray-100',
          iconContainer: `${currentSize.iconContainer} mr-3`,
          textContainer: 'flex-1',
          textStyle: `${currentSize.textSize} font-medium`,
        };

      case 'icon-only':
        return {
          container: `${currentSize.containerPadding} items-center justify-center`,
          iconContainer: currentSize.iconContainer,
          textContainer: 'hidden',
          textStyle: '',
        };

      case 'grid':
      default:
        return {
          container: `items-center ${currentSize.containerPadding}`,
          iconContainer: `${currentSize.iconContainer} mb-2`,
          textContainer: '',
          textStyle: `${currentSize.textSize} font-medium text-center`,
        };
    }
  };

  const styles = getVariantStyles();

  // Background and text colors based on selection state
  const getColors = () => {
    if (isSelected) {
      return {
        backgroundColor: `${color}`, // 20% opacity
        iconColor: '#fff',
        textColor: '#000',
      };
    }
    return {
      backgroundColor: `#E6F0FF`, // Light gray background
      iconColor: `${color}`,
      textColor: '#000',
    };
  };

  const colors = getColors();

  const handlePress = () => {
    if (onPress) {
      onPress(id, { id, name, icon, color });
    }
  };

  return (
    <TouchableOpacity
      className={`${styles.container} ${customStyle.container || ''}`}
      onPress={handlePress}
      activeOpacity={0.7}>
      <View
        className={`${styles.iconContainer} items-center justify-center rounded-full`}
        style={{
          backgroundColor: colors.backgroundColor,
          ...customStyle.iconContainer,
        }}>
        <Feather name={icon} size={currentSize.iconSize} color={colors.iconColor} />
      </View>

      {showLabel && variant !== 'icon-only' && (
        <View className={styles.textContainer}>
          <Text
            className={styles.textStyle}
            style={{
              color: colors.textColor,
              ...customStyle.text,
            }}
            numberOfLines={1}>
            {name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CategoryItem;
