// FilterDateRange.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import CustomDateRangePicker from './CustomDateRangePicker ';

const FilterDateRange = ({
  selectedRange,
  onRangeSelect,
  customStartDate,
  customEndDate,
  onCustomDateChange,
}) => {
  const { t } = useTranslation();
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const dateRanges = [
    {
      label: t('filters.dateRanges.today'),
      value: 'today',
    },
    {
      label: t('filters.dateRanges.last7Days'),
      value: 'last7Days',
    },
    {
      label: t('filters.dateRanges.last30Days'),
      value: 'last30Days',
    },
    {
      label: t('filters.dateRanges.thisMonth'),
      value: 'thisMonth',
    },
  ];

  const calculateDateRange = (rangeValue) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    switch (rangeValue) {
      case 'today':
        return {
          startDate: startOfDay,
          endDate: endOfDay,
        };

      case 'last7Days':
        const last7DaysStart = new Date(startOfDay);
        last7DaysStart.setDate(last7DaysStart.getDate() - 6); // 6 days ago + today = 7 days
        return {
          startDate: last7DaysStart,
          endDate: endOfDay,
        };

      case 'last30Days':
        const last30DaysStart = new Date(startOfDay);
        last30DaysStart.setDate(last30DaysStart.getDate() - 29); // 29 days ago + today = 30 days
        return {
          startDate: last30DaysStart,
          endDate: endOfDay,
        };

      case 'thisMonth':
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisMonthEnd = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        return {
          startDate: thisMonthStart,
          endDate: thisMonthEnd,
        };

      default:
        return {
          startDate: null,
          endDate: null,
        };
    }
  };

  const handleRangeSelection = (rangeValue) => {
    const { startDate, endDate } = calculateDateRange(rangeValue);
    onRangeSelect(rangeValue, startDate, endDate);
  };

  const handleCustomDatePress = () => {
    setShowCustomPicker(true);
  };

  const handleCustomDateConfirm = (startDate, endDate) => {
    onCustomDateChange?.(startDate, endDate);
    onRangeSelect('custom', startDate, endDate);
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
          {dateRanges.map((range) => (
            <TouchableOpacity
              key={range.value}
              className={`rounded-lg border px-4 py-2 ${
                selectedRange === range.value
                  ? 'border-primary bg-primary'
                  : 'border-gray-200 bg-gray-50'
              }`}
              onPress={() => handleRangeSelection(range.value)}>
              <Text
                className={`text-sm font-medium ${
                  selectedRange === range.value ? 'text-white' : 'text-gray-600'
                }`}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}

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
        </View>
      </View>

      <CustomDateRangePicker
        isVisible={showCustomPicker}
        onClose={() => setShowCustomPicker(false)}
        onConfirm={handleCustomDateConfirm}
      />
    </>
  );
};

export default FilterDateRange;
