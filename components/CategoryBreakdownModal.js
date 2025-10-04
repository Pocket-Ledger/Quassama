import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import PieChart from './PieChart';
import { useTranslation } from 'react-i18next';

const CategoryBreakdownModal = ({ visible, onClose, categoryData, totalAmount, getCurrency }) => {
  const { t } = useTranslation();
  const screenHeight = Dimensions.get('window').height;
  const modalHeight = screenHeight * 0.8; // 70% of screen height

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View className="flex-1 bg-black/50">
        <Pressable 
          className="flex-1"
          onPress={onClose}
        />
        <View 
          className="bg-white dark:bg-slate-800 rounded-t-3xl"
          style={{ height: modalHeight }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-xl font-bold text-black dark:text-white">
              {t('home.categoryBreakdown', { defaultValue: 'Category Breakdown' })}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full bg-gray-100 dark:bg-slate-700"
              activeOpacity={0.7}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1 px-6 py-4"
            showsVerticalScrollIndicator={true}
            bounces={true}>
            {/* Pie Chart */}
            <View className="items-center py-6">
              <PieChart data={categoryData} size={180} />
              <Text className="mt-4 text-2xl font-bold text-black dark:text-white">
                {totalAmount.toFixed(2)} {getCurrency()}
              </Text>
              <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('home.totalExpenses')}
              </Text>
            </View>

            {/* Category List */}
            <View className="pb-8">
              <Text className="mb-4 text-lg font-semibold text-black dark:text-white">
                {t('home.allCategories', { defaultValue: 'All Categories' })} ({categoryData.length})
              </Text>
              
              {categoryData.map((item, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between p-4 mb-3 rounded-xl bg-gray-50 dark:bg-slate-700">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: `${item.color}20` }}>
                      <View
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-black dark:text-white">
                        {t(`categories.${item.category.toLowerCase()}`, {
                          defaultValue: item.category,
                        })}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {item.count} {item.count === 1 ? t('home.transaction', { defaultValue: 'transaction' }) : t('home.transactions', { defaultValue: 'transactions' })}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-black dark:text-white">
                      {item.amount.toFixed(2)}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="text-base font-semibold text-primary mr-1">
                        {item.percentage}%
                      </Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {getCurrency()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default CategoryBreakdownModal;