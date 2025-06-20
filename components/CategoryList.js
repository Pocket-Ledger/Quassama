import React from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import CategoryItem from './CategoryItem';

const CategoryList = ({
  categories = [],
  selectedCategories = '',
  onCategorySelect,
  layout = 'grid',
  size = 'medium',
  numColumns = 5,
  title = '',
  showTitle = true,
  multiSelect = false,
  customStyle = {},
  itemCustomStyle = {},
}) => {
  const { t } = useTranslation();

  // Normalize selected categories to array for consistent handling
  const selectedArray = Array.isArray(selectedCategories)
    ? selectedCategories
    : selectedCategories
      ? [selectedCategories]
      : [];

  // Check if a category is selected
  const isCategorySelected = (categoryId) => {
    return selectedArray.includes(categoryId);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId, categoryData) => {
    if (!onCategorySelect) return;

    if (multiSelect) {
      let newSelected;
      if (isCategorySelected(categoryId)) {
        // Remove from selection
        newSelected = selectedArray.filter((id) => id !== categoryId);
      } else {
        // Add to selection
        newSelected = [...selectedArray, categoryId];
      }
      onCategorySelect(newSelected, categoryData);
    } else {
      // Single select
      onCategorySelect(categoryId, categoryData);
    }
  };

  // Render individual category item
  const renderCategoryItem = ({ item, index }) => (
    <View
      className={layout === 'grid' ? `w-[${100 / numColumns}%]` : ''}
      style={layout === 'grid' ? { width: `${100 / numColumns}%` } : {}}>
      <CategoryItem
        id={item.id}
        name={t(`categories.${item.name.toLowerCase()}`, { defaultValue: item.name })}
        icon={item.icon}
        color={item.color}
        isSelected={isCategorySelected(item.id)}
        onPress={handleCategorySelect}
        variant={layout === 'horizontal' ? 'grid' : layout}
        size={size}
        customStyle={itemCustomStyle}
      />
    </View>
  );

  // Get container styles based on layout
  const getContainerStyles = () => {
    switch (layout) {
      case 'list':
        return 'border border-gray-200 rounded-lg';
      case 'horizontal':
        return '';
      case 'grid':
      default:
        return '';
    }
  };

  // Get the display title
  const getDisplayTitle = () => {
    return title || t('categories.category');
  };

  // Render based on layout type
  const renderContent = () => {
    if (layout === 'horizontal') {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className={customStyle.scrollView || ''}>
          <View className="flex-row space-x-3">
            {categories.map((item, index) => (
              <CategoryItem
                key={item.id}
                id={item.id}
                name={t(`categories.${item.name.toLowerCase()}`, { defaultValue: item.name })}
                icon={item.icon}
                color={item.color}
                isSelected={isCategorySelected(item.id)}
                onPress={handleCategorySelect}
                variant="grid"
                size={size}
                customStyle={itemCustomStyle}
              />
            ))}
          </View>
        </ScrollView>
      );
    }

    return (
      <View className={getContainerStyles()}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={layout === 'grid' ? numColumns : 1}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={customStyle.flatList}
        />
      </View>
    );
  };

  return (
    <View className={customStyle.container || ''}>
      {showTitle && (
        <Text className={`mb-3 text-base font-medium text-black ${customStyle.title || ''}`}>
          {getDisplayTitle()}
        </Text>
      )}

      {renderContent()}

      {/* Optional helper text for multi-select */}
      {multiSelect && selectedArray.length > 0 && (
        <Text className={`mt-2 text-sm text-gray-500 ${customStyle.helperText || ''}`}>
          {t('categories.categoriesSelected', { count: selectedArray.length })}
        </Text>
      )}
    </View>
  );
};

export default CategoryList;
