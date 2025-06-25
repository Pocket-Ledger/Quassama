// CustomDateRangePicker.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';

const CustomDateRangePicker = ({ isVisible, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const getDefaultStartDate = () => {
    const today = new Date();
    return new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  };

  const getDefaultEndDate = () => {
    return new Date();
  };
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('start');

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleConfirm = () => {
    /* if (startDate <= endDate) {
      onConfirm(startDate, endDate);
      onClose();
    } */
    if (startDate <= endDate) {
      // Format dates for Firebase with time set to start/end of day
      const formattedStartDate = new Date(startDate);
      formattedStartDate.setHours(0, 0, 0, 0); // Start of day

      const formattedEndDate = new Date(endDate);
      formattedEndDate.setHours(23, 59, 59, 999); // End of day

      onConfirm(formattedStartDate, formattedEndDate);
      onClose();
    }
  };

  const handleCancel = () => {
    setStartDate(getDefaultStartDate());
    setEndDate(getDefaultEndDate());
    onClose();
  };

  const handleStartDatePress = () => {
    setPickerMode('start');
    setShowStartPicker(true);
  };

  const handleEndDatePress = () => {
    setPickerMode('end');
    setShowEndPicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }

    if (selectedDate) {
      if (pickerMode === 'start') {
        setStartDate(selectedDate);
        // Auto-adjust end date if it's before the new start date
        if (selectedDate > endDate) {
          setEndDate(selectedDate);
        }
      } else {
        setEndDate(selectedDate);
      }
    }

    if (Platform.OS === 'ios') {
      // For iOS, we handle the picker closing in the modal
      if (pickerMode === 'start') {
        setShowStartPicker(false);
      } else {
        setShowEndPicker(false);
      }
    }
  };

  const getDaysDifference = () => {
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-center bg-black/50 px-4">
        <View className="mx-4 rounded-xl bg-white p-6">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-black">
              {t('filters.dateRange.customDateTitle')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Date Selection */}
          <View className="mb-6 gap-4">
            {/* Start Date */}
            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700">
                {t('filters.dateRange.startDate')}
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                onPress={handleStartDatePress}>
                <Text className="text-base text-black">{formatDate(startDate)}</Text>
                <Feather name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* End Date */}
            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700">
                {t('filters.dateRange.endDate')}
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                onPress={handleEndDatePress}>
                <Text className="text-base text-black">{formatDate(endDate)}</Text>
                <Feather name="calendar" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Date Range Summary */}
            <View className="rounded-lg bg-blue-50 p-3">
              <Text className="text-sm text-blue-800">
                {t('filters.dateRange.selectedRange')}: {getDaysDifference()} {t('common.days')}
              </Text>
            </View>

            {/* Error Message */}
            {startDate > endDate && (
              <View className="rounded-lg bg-red-50 p-3">
                <Text className="text-sm text-red-800">{t('filters.dateRange.invalidRange')}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 rounded-lg border border-gray-200 py-3"
              onPress={handleCancel}>
              <Text className="text-center text-base font-medium text-gray-700">
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 rounded-lg py-3 ${
                startDate <= endDate ? 'bg-primary' : 'bg-gray-300'
              }`}
              onPress={handleConfirm}
              disabled={startDate > endDate}>
              <Text
                className={`text-center text-base font-semibold ${
                  startDate <= endDate ? 'text-white' : 'text-gray-500'
                }`}>
                {t('common.apply')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Pickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={startDate}
          maximumDate={new Date()}
        />
      )}
    </Modal>
  );
};

export default CustomDateRangePicker;
