import React, { useState, useRef } from 'react';
import { View, Text, PanResponder } from 'react-native';
import { useTranslation } from 'react-i18next';

const FilterAmountRange = ({ amountRange, onRangeChange }) => {
  const { t } = useTranslation();
  const currency = t('common.currency');
  const sliderWidth = useRef(250); // Default width, will be updated on layout
  const [isDragging, setIsDragging] = useState({ min: false, max: false });

  // Calculate current positions
  const getPosition = (value) => {
    const percentage = (value - amountRange.min) / (amountRange.max - amountRange.min);
    return percentage * sliderWidth.current;
  };

  const getValue = (position) => {
    const percentage = position / sliderWidth.current;
    const value = amountRange.min + percentage * (amountRange.max - amountRange.min);
    return Math.max(amountRange.min, Math.min(amountRange.max, Math.round(value)));
  };

  // Pan responder for minimum handle
  const minPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsDragging({ ...isDragging, min: true }),
    onPanResponderMove: (evt, gestureState) => {
      const newPosition = getPosition(amountRange.selectedMin) + gestureState.dx;
      const newValue = getValue(newPosition);

      if (newValue < amountRange.selectedMax) {
        onRangeChange({
          ...amountRange,
          selectedMin: newValue,
        });
      }
    },
    onPanResponderRelease: () => setIsDragging({ ...isDragging, min: false }),
  });

  // Pan responder for maximum handle
  const maxPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsDragging({ ...isDragging, max: true }),
    onPanResponderMove: (evt, gestureState) => {
      const newPosition = getPosition(amountRange.selectedMax) + gestureState.dx;
      const newValue = getValue(newPosition);

      if (newValue > amountRange.selectedMin) {
        onRangeChange({
          ...amountRange,
          selectedMax: newValue,
        });
      }
    },
    onPanResponderRelease: () => setIsDragging({ ...isDragging, max: false }),
  });

  const handleSliderLayout = (event) => {
    sliderWidth.current = event.nativeEvent.layout.width;
  };

  const minPosition = getPosition(amountRange.selectedMin);
  const maxPosition = getPosition(amountRange.selectedMax);
  const activeTrackWidth = maxPosition - minPosition;

  return (
    <View className="">
      <View className="mb-4 flex-row items-center justify-between ">
        <Text className="text-base font-medium text-black ">{t('filters.amountRange.title')}</Text>
        <Text className="text-base font-medium text-black">
          {currency}
          {amountRange.selectedMin}-{currency}
          {amountRange.selectedMax}
        </Text>
      </View>

      <View className="px-4 py-5">
        <View className="relative h-1 rounded-sm bg-gray-200" onLayout={handleSliderLayout}>
          {/* Active track segment */}
          <View
            className="absolute top-0 h-1 rounded-sm bg-blue-500"
            style={{
              left: minPosition,
              width: activeTrackWidth,
            }}
          />

          {/* Minimum handle */}
          <View
            className={`absolute -top-2 h-5 w-5 rounded-full border-2 border-blue-500 bg-white shadow-lg ${
              isDragging.min ? 'scale-110' : 'scale-100'
            }`}
            style={{
              left: minPosition - 10, // Center the handle
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            {...minPanResponder.panHandlers}
          />

          {/* Maximum handle */}
          <View
            className={`absolute -top-2 h-5 w-5 rounded-full border-2 border-blue-500 bg-white shadow-lg ${
              isDragging.max ? 'scale-110' : 'scale-100'
            }`}
            style={{
              left: maxPosition - 10, // Center the handle
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            {...maxPanResponder.panHandlers}
          />
        </View>

        {/* Min/Max labels */}
        <View className="mt-4 flex-row justify-between">
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
