// FilterDateRange.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import CustomDateRangePicker from './CustomDateRangePicker ';

const FilterDateRange = ({
  selectedRange,
  onRangeSelect,
  ranges = [],
  showCustomDate = true,
  customStartDate,
  customEndDate,
  onCustomDateChange,
}) => {
  const { t } = useTranslation();
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handleCustomDatePress = () => {
    setShowCustomPicker(true);
  };

  const handleCustomDateConfirm = (startDate, endDate) => {
    onCustomDateChange?.(startDate, endDate);
    onRangeSelect('custom');
  };

  const formatCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      const start = customStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = customEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${start} - ${end}`;
    }
    return t('filters.dateRange.customDate');
  };

  const isCustomSelected = selectedRange === 'custom';

  return (
    <>
      <View>
        <Text className="mb-4 text-base font-medium text-black">
          {t('filters.dateRange.title')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {ranges.map((range) => (
            <TouchableOpacity
              key={range}
              className={`rounded-lg border px-4 py-2 ${
                selectedRange === range ? 'border-primary bg-primary' : 'border-gray-200 bg-gray-50'
              }`}
              onPress={() => onRangeSelect(range)}>
              <Text
                className={`text-sm font-medium ${
                  selectedRange === range ? 'text-white' : 'text-gray-600'
                }`}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}

          {showCustomDate && (
            <TouchableOpacity
              className={`flex-row items-center rounded-lg border px-4 py-2 ${
                isCustomSelected ? 'border-primary bg-primary' : 'border-gray-200 bg-gray-50'
              }`}
              onPress={handleCustomDatePress}>
              <Feather name="calendar" size={16} color={isCustomSelected ? 'white' : '#666'} />
              <Text
                className={`ml-2 text-sm font-medium ${
                  isCustomSelected ? 'text-white' : 'text-gray-600'
                }`}>
                {formatCustomDateRange()}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <CustomDateRangePicker
        isVisible={showCustomPicker}
        onClose={() => setShowCustomPicker(false)}
        onConfirm={handleCustomDateConfirm}
        initialStartDate={customStartDate}
        initialEndDate={customEndDate}
      />
    </>
  );
};

export default FilterDateRange;
