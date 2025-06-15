import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const FilterDateRange = ({
  selectedRange,
  onRangeSelect,
  ranges = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'],
  showCustomDate = true,
}) => {
  return (
    <View>
      <Text className="mb-4 text-base font-medium text-black">Date Range</Text>
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
          <TouchableOpacity className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
            <Feather name="calendar" size={16} color="#666" />
            <Text className="ml-2 text-sm font-medium text-gray-600">Custom Date</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FilterDateRange;
