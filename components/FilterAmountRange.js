import React from 'react';
import { View, Text } from 'react-native';

const FilterAmountRange = ({ amountRange, onRangeChange, currency = '$' }) => {
  return (
    <View>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-base font-medium text-black">Amount Range</Text>
        <Text className="text-base font-medium text-black">
          {currency}
          {amountRange.selectedMin}-{amountRange.selectedMax}
        </Text>
      </View>
      <View className="px-2">
        {/* Slider representation - simplified */}
        <View className="relative h-2 rounded-full bg-gray-200">
          <View
            className="absolute h-2 rounded-full bg-primary"
            style={{
              left: `${((amountRange.selectedMin - amountRange.min) / (amountRange.max - amountRange.min)) * 100}%`,
              width: `${((amountRange.selectedMax - amountRange.selectedMin) / (amountRange.max - amountRange.min)) * 100}%`,
            }}
          />
          <View
            className="absolute -top-1 h-4 w-4 rounded-full border-2 border-primary bg-white"
            style={{
              left: `${((amountRange.selectedMin - amountRange.min) / (amountRange.max - amountRange.min)) * 100 - 2}%`,
            }}
          />
          <View
            className="absolute -top-1 h-4 w-4 rounded-full border-2 border-primary bg-white"
            style={{
              left: `${((amountRange.selectedMax - amountRange.min) / (amountRange.max - amountRange.min)) * 100 - 2}%`,
            }}
          />
        </View>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-sm text-gray-500">
            {currency}
            {amountRange.min}
          </Text>
          <Text className="text-sm text-gray-500">
            {currency}
            {amountRange.max}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default FilterAmountRange;
