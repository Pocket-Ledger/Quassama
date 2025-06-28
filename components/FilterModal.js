import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import FilterDateRange from './FilterDateRange';
import FilterAmountRange from './FilterAmountRange';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRTL } from 'hooks/useRTL'; // Import RTL hook

const FilterModal = ({
  visible,
  onClose,
  initialFilter,
  onApplyFilter,
  onResetFilter,
  categories = [],
  isRTL: propIsRTL, // Optional RTL prop override
  // groups = [],
  //currency = '$',
  //resultCount = 80,
}) => {
  const { t } = useTranslation();
  const { isRTL: hookIsRTL, getFlexDirection, getTextAlign, getMargin, getPadding } = useRTL();

  // Use prop RTL if provided, otherwise use hook
  const isRTL = propIsRTL !== undefined ? propIsRTL : hookIsRTL;

  const [localFilter, setLocalFilter] = useState(initialFilter);

  const handleApplyFilter = () => {
    const finalFilter = {
      startDate: localFilter.startDate, // Pass raw Date object, not formatted string
      endDate: localFilter.endDate, // Pass raw Date object, not formatted string
      categories: localFilter?.selectedCategories,
      minAmount: localFilter.amountRange.selectedMin,
      maxAmount: localFilter.amountRange.selectedMax,
      checkedFilter: true,
    };
    onApplyFilter(finalFilter);
    onClose();
  };

  const handleResetFilter = () => {
    const resetFilter = {
      dateRange: '',
      selectedCategories: [],
      amountRange: { min: 1, max: 10000, selectedMin: null, selectedMax: null },
      // selectedGroup: groups[0]?.id || '',
      customStartDate: null,
      customEndDate: null,
      checkedFilter: false,
      startDate: null,
      endDate: null,
    };
    setLocalFilter(resetFilter);

    if (onResetFilter) {
      onResetFilter(resetFilter);
    }

    // Close the modal immediately after reset
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

  const handleRangeSelect = (range, startDate, endDate) => {
    setLocalFilter((prev) => ({
      ...prev,
      dateRange: range,
      startDate: startDate,
      endDate: endDate,
      // Clear custom dates if not custom range
      customStartDate: range === 'custom' ? prev.customStartDate : null,
      customEndDate: range === 'custom' ? prev.customEndDate : null,
    }));
  };

  const handleCustomDateChange = (startDate, endDate) => {
    setLocalFilter((prev) => ({
      ...prev,
      customStartDate: startDate,
      customEndDate: endDate,
      startDate: startDate,
      endDate: endDate,
    }));
  };

  const handleAmountRangeChange = (newRange) => {
    setLocalFilter((prev) => ({ ...prev, amountRange: newRange }));
  };

  const handleClose = () => {
    handleResetFilter();
    onClose();
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
          <View
            className={`${getFlexDirection()} items-center justify-between border-b border-gray-200 px-4 py-4`}>
            <TouchableOpacity onPress={handleClose}>
              <Text className={`text-base text-gray-500 ${getTextAlign('left')}`}>
                {t('filters.cancel')}
              </Text>
            </TouchableOpacity>
            <Text className={`text-lg font-semibold text-black ${getTextAlign('center')}`}>
              {t('filters.title')}
            </Text>
            <TouchableOpacity onPress={handleResetFilter}>
              <Text className={`text-base text-gray-500 ${getTextAlign('right')}`}>
                {t('filters.reset')}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="gap-8 px-4 py-6">
            {/* Date Range */}
            <FilterDateRange
              selectedRange={localFilter.dateRange}
              onRangeSelect={handleRangeSelect}
              customStartDate={localFilter.customStartDate}
              customEndDate={localFilter.customEndDate}
              onCustomDateChange={handleCustomDateChange}
              isRTL={isRTL} // Pass RTL prop
            />

            {/* Categories */}
            <View>
              <Text className={`mb-4 text-base font-medium text-black ${getTextAlign('left')}`}>
                {t('filters.categories.title')}
              </Text>
              <View className={`${getFlexDirection()} flex-wrap justify-between gap-1`}>
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
                      className={`text-sm font-medium ${getTextAlign('center')} ${
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
              isRTL={isRTL} // Pass RTL prop
            />
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View className="border-t border-gray-200 px-4 pb-6 pt-4">
          <TouchableOpacity className="rounded-lg bg-primary py-4" onPress={handleApplyFilter}>
            <Text
              className={`text-center text-base font-semibold text-white ${getTextAlign('center')}`}>
              {t('common.search')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default FilterModal;
