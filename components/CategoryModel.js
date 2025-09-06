import React, { useState, useMemo } from 'react';
import {
  Modal,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import CategoryItem from './CategoryItem';
import { DEFAULT_CATEGORIES } from '../constants/category';

const CategoryModel = ({
  visible = false,
  onClose,
  onCategorySelect,
  selectedCategory = '',
  title = '',
}) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');

  // Filter categories based on search text
  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) {
      return DEFAULT_CATEGORIES;
    }
    
    return DEFAULT_CATEGORIES.filter((category) =>
      category.name.toLowerCase().includes(searchText.toLowerCase()) ||
      t(`categories.${category.name.toLowerCase()}`, { defaultValue: category.name })
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [searchText, t]);

  const handleCategorySelect = (categoryId, categoryData) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId, categoryData);
    }
    onClose?.();
  };

  const handleClose = () => {
    setSearchText(''); // Reset search when closing
    onClose?.();
  };

  const renderCategoryItem = ({ item }) => (
    <View className="w-1/4 p-2">
      <CategoryItem
        id={item.id}
        name={t(`categories.${item.name.toLowerCase()}`, { defaultValue: item.name })}
        icon={item.icon}
        color={item.color}
        isSelected={selectedCategory === item.id}
        onPress={handleCategorySelect}
        variant="grid"
        size="medium"
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
            <Text className="text-lg font-semibold text-black">
              {title || t('categories.selectCategory')}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="border-b border-gray-100 px-4 py-3">
            <View className="flex-row items-center rounded-lg border border-gray-200 px-3 py-2">
              <Feather name="search" size={16} color="#666" />
              <TextInput
                className="ml-2 flex-1 text-base text-black"
                placeholder={t('categories.searchCategories')}
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Feather name="x-circle" size={16} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Categories List */}
          <View className="flex-1 px-2 py-4">
            {filteredCategories.length > 0 ? (
              <FlatList
                data={filteredCategories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={4}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Feather name="search" size={48} color="#ccc" />
                <Text className="mt-4 text-base text-gray-500">
                  {t('categories.noCategoriesFound')}
                </Text>
                <Text className="mt-2 text-center text-sm text-gray-400">
                  {t('categories.tryDifferentSearch')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CategoryModel;