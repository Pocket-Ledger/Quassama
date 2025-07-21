// RepeatSection.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const REPEAT_OPTIONS = [
  { id: 'oneTime', key: 'oneTime' },
  { id: 'weekly', key: 'weekly' },
  { id: 'monthly', key: 'monthly' },
  { id: 'custom', key: 'custom' },
];

const CUSTOM_INTERVALS = [
  { id: 'days', key: 'days' },
  { id: 'weeks', key: 'weeks' },
  { id: 'months', key: 'months' },
];

const RepeatSection = ({
  selectedRepeat,
  onRepeatChange,
  customDays,
  onCustomDaysChange,
  customInterval,
  onCustomIntervalChange,
  error,
}) => {
  const { t } = useTranslation();
  const [isIntervalModalVisible, setIsIntervalModalVisible] = useState(false);

  const handleRepeatSelect = (repeatType) => {
    onRepeatChange(repeatType);
    if (repeatType !== 'custom') {
      onCustomDaysChange('');
      onCustomIntervalChange('days');
    }
  };

  const handleIntervalSelect = (interval) => {
    onCustomIntervalChange(interval);
    setIsIntervalModalVisible(false);
  };

  const renderIntervalItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4"
      onPress={() => handleIntervalSelect(item.id)}>
      <Text className="font-dmsans-medium text-base text-black">
        {t(`expense.repeat.intervals.${item.key}`)}
      </Text>
      <View className="h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300">
        {customInterval === item.id && <View className="h-3 w-3 rounded-full bg-primary" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="input-group">
      <Text className="input-label font-dmsans-medium text-base text-black">
        {t('expense.repeat.title')}
      </Text>

      {/* Repeat Options */}
      <View className="w-full flex-row flex-wrap justify-between gap-2 ">
        {REPEAT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            className={`rounded-full px-2 py-2 ${
              selectedRepeat === option.id ? 'bg-primary' : 'bg-primary/15'
            }`}
            onPress={() => handleRepeatSelect(option.id)}>
            <Text
              className={`font-dmsans-medium text-sm ${
                selectedRepeat === option.id ? 'text-white' : 'text-primary'
              }`}>
              {t(`expense.repeat.${option.key}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom Repeat Section */}
      {selectedRepeat === 'custom' && (
        <View className="mt-4 rounded-lg bg-gray-50 p-4">
          <Text className="mb-3 font-dmsans-medium text-sm text-gray-700">
            {t('expense.repeat.repeatedEvery')}
          </Text>
          <View className="flex-row items-center gap-3">
            <TextInput
              className={`flex-1 rounded-lg border px-3 py-2 text-center text-black ${
                error ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder="1"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={customDays}
              onChangeText={onCustomDaysChange}
              keyboardType="numeric"
              maxLength={3}
            />
            <TouchableOpacity
              className="flex-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
              onPress={() => setIsIntervalModalVisible(true)}>
              <View className="flex-row items-center justify-between">
                <Text className="text-black">
                  {t(`expense.repeat.intervals.${customInterval}`)}
                </Text>
                <Feather name="chevron-down" size={16} color="#666" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {error && <Text className="error-text mt-1 text-sm text-red-500">{error}</Text>}

      {/* Interval Selection Modal */}
      <Modal
        visible={isIntervalModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsIntervalModalVisible(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1">
            <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
              <Text className="text-lg font-semibold text-black">
                {t('expense.repeat.selectInterval')}
              </Text>
              <TouchableOpacity onPress={() => setIsIntervalModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CUSTOM_INTERVALS}
              renderItem={renderIntervalItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default RepeatSection;
