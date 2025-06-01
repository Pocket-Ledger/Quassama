import React from 'react';
import { View, Text } from 'react-native';
import CategoryItem from './CategoryItem';

const CategorySelector = ({
  categories,
  selectedCategory,
  onCategorySelect,
  title = 'Category',
  error = null,
  size = 'medium',
  showTitle = true,
  layout = 'grid', // 'grid' | 'horizontal' | 'vertical'
  itemsPerRow = null, // Auto-calculate if null
  showNames = true,
}) => {
  // Calculate items per row based on layout and size
  const getItemsPerRow = () => {
    if (itemsPerRow) return itemsPerRow;

    if (layout === 'horizontal') return categories.length;
    if (layout === 'vertical') return 1;

    // Grid layout - auto-calculate based on size
    switch (size) {
      case 'small':
        return 6;
      case 'medium':
        return 5;
      case 'large':
        return 4;
      default:
        return 5;
    }
  };

  const renderCategories = () => {
    const perRow = getItemsPerRow();

    if (layout === 'horizontal') {
      return (
        <View className="flex-row justify-between gap-2">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onPress={onCategorySelect}
              size={size}
              showName={showNames}
            />
          ))}
        </View>
      );
    }

    if (layout === 'vertical') {
      return (
        <View className="gap-2">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onPress={onCategorySelect}
              size={size}
              showName={showNames}
            />
          ))}
        </View>
      );
    }

    // Grid layout
    const rows = [];
    for (let i = 0; i < categories.length; i += perRow) {
      const rowItems = categories.slice(i, i + perRow);
      rows.push(
        <View key={i} className="flex-row justify-between gap-1">
          {rowItems.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onPress={onCategorySelect}
              size={size}
              showName={showNames}
            />
          ))}
          {/* Fill remaining space if row is not complete */}
          {Array.from({ length: perRow - rowItems.length }).map((_, index) => (
            <View
              key={`empty-${index}`}
              className={size === 'small' ? 'w-[50px]' : size === 'large' ? 'w-[80px]' : 'w-[61px]'}
            />
          ))}
        </View>
      );
    }

    return <View className="gap-2">{rows}</View>;
  };

  return (
    <View className="">
      {showTitle && (
        <Text className="input-label mb-3 text-base font-medium text-black">{title}</Text>
      )}
      {renderCategories()}
      {error && <Text className="error-text mt-2 text-sm text-red-500">{error}</Text>}
    </View>
  );
};

export default CategorySelector;
