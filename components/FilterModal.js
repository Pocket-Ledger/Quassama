// FilterModal.js - Updated sections
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import FilterDateRange from './FilterDateRange';
import FilterAmountRange from './FilterAmountRange';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const FilterModal = ({
  visible,
  onClose,
  initialFilter,
  onApplyFilter,
  onResetFilter,
  categories = [],
  groups = [],
  currency = '$',
  resultCount = 80,
}) => {
  const { t } = useTranslation();
  const [localFilter, setLocalFilter] = useState(initialFilter);

  const dateRanges = [
    t('filters.dateRanges.today'),
    t('filters.dateRanges.last7Days'),
    t('filters.dateRanges.last30Days'),
    t('filters.dateRanges.thisMonth'),
  ];

  const handleApplyFilter = () => {
    onApplyFilter(localFilter);
    onClose();
  };

  const handleResetFilter = () => {
    const resetFilter = {
      dateRange: '',
      selectedCategories: [],
      amountRange: { min: 1, max: 10000, selectedMin: 0, selectedMax: 10000 },
      selectedGroup: groups[0]?.id || '',
      customStartDate: null,
      customEndDate: null,
    };
    setLocalFilter(resetFilter);

    if (onResetFilter) {
      onResetFilter(resetFilter);
    }

    onClose();
  };

  const toggleCategory = (categoryId) => {
    setLocalFilter((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter((id) => id !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }));
  };

  const handleRangeSelect = (range) => {
    setLocalFilter((prev) => ({ ...prev, dateRange: range }));
  };

  const handleCustomDateChange = (startDate, endDate) => {
    setLocalFilter((prev) => ({
      ...prev,
      customStartDate: startDate,
      customEndDate: endDate,
    }));
  };

  const handleAmountRangeChange = (newRange) => {
    setLocalFilter((prev) => ({ ...prev, amountRange: newRange }));
  };

  const handleGroupSelect = () => {
    console.log('Group selection not implemented yet');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Modal Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-base text-gray-500">{t('filters.cancel')}</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-black">{t('filters.title')}</Text>
            <TouchableOpacity onPress={handleResetFilter}>
              <Text className="text-base text-gray-500">{t('filters.reset')}</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-8 px-4 py-6">
            {/* Date Range */}
            <FilterDateRange
              selectedRange={localFilter.dateRange}
              onRangeSelect={handleRangeSelect}
              ranges={dateRanges}
              customStartDate={localFilter.customStartDate}
              customEndDate={localFilter.customEndDate}
              onCustomDateChange={handleCustomDateChange}
            />

            {/* Categories */}
            <View>
              <Text className="mb-4 text-base font-medium text-black">
                {t('filters.categories.title')}
              </Text>
              <View className="flex-row flex-wrap justify-between gap-1">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    className="mb-4 items-center"
                    onPress={() => toggleCategory(category.id)}>
                    <View
                      className={`mb-2 h-12 w-12 items-center justify-center rounded-full ${
                        localFilter.selectedCategories.includes(category.id)
                          ? 'bg-primary'
                          : 'bg-primary-50'
                      }`}>
                      <Feather
                        name={category.icon}
                        size={20}
                        color={
                          localFilter.selectedCategories.includes(category.id) ? 'white' : '#2979FF'
                        }
                      />
                    </View>
                    <Text
                      className={`text-sm font-medium ${
                        localFilter.selectedCategories.includes(category.id)
                          ? 'text-primary'
                          : 'text-gray-600'
                      }`}>
                      {t(`categories.${category.name.toLowerCase()}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Amount Range */}
            <FilterAmountRange
              amountRange={localFilter.amountRange}
              onRangeChange={handleAmountRangeChange}
              currency={currency}
            />
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View className="border-t border-gray-200 px-4 pb-6 pt-4">
          <TouchableOpacity className="rounded-lg bg-primary py-4" onPress={handleApplyFilter}>
            <Text className="text-center text-base font-semibold text-white">
              {t('common.search')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default FilterModal;
