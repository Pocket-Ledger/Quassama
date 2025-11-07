import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Wallet, ChevronLeft, ChevronRight } from 'lucide-react-native';
import PieChart from './PieChart';
import CategoryBreakdownModal from './CategoryBreakdownModal';
import { useTranslation } from 'react-i18next';

const OverviewSection = ({ overviewData, isLoadingOverview, getCurrency, onMonthChange }) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <View className="p-4 bg-white border border-gray-100 rounded-xl dark:bg-slate-700 dark:border-gray-700">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => onMonthChange?.('previous')}
              className="p-2 rounded-full bg-gray-100 dark:bg-slate-600"
              activeOpacity={0.7}>
              <ChevronLeft size={20} color="#666" />
            </TouchableOpacity>

            <Text className="text-lg font-medium text-black dark:text-white">
              {t('home.monthlyOverview', {
                month: overviewData.monthName,
                year: overviewData.year,
              })}
            </Text>

            <TouchableOpacity
              onPress={() => onMonthChange?.('next')}
              className="p-2 rounded-full bg-gray-100 dark:bg-slate-600"
              activeOpacity={0.7}>
              <ChevronRight size={20} color="#666" />
            </TouchableOpacity>
          </View>

      {isLoadingOverview ? (
        <View className="flex-row items-center">
          <View className="relative mr-6">
            <View className="w-20 h-20 bg-gray-200 rounded-full" />
          </View>
          <View className="flex-1">
            <View className="w-32 h-4 mb-2 bg-gray-200 rounded" />
            <View className="w-24 h-4 mb-2 bg-gray-200 rounded" />
            <View className="h-4 mb-2 bg-gray-200 rounded w-28" />
          </View>
        </View>
      ) : overviewData.categoryData.length === 0 ? (
        <View className="flex flex-row items-center justify-around py-8">
          <View className="">
            <Text className="mt-2 text-lg text-gray-500 dark:text-gray-300">
              {t('home.noExpensesThisMonth')}
            </Text>
            <Text className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              {t('home.tapToAddExpense', { defaultValue: 'Tap + to add your first expense' })}
            </Text>
          </View>
          <View className="items-center justify-center bg-blue-100 rounded-full h-18 w-18 dark:bg-slate-600">
            <Wallet size={38} color="#3B82F6" strokeWidth={2.5} />
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setShowModal(true)}>
          <View className="flex-row items-center">
            <View className="relative mr-6">
              <PieChart data={overviewData.categoryData} size={80} />
            </View>

            <View className="flex-1">
              {overviewData.categoryData.slice(0, 4).map((item, index) => (
                <View key={index} className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <View
                      className="w-3 h-3 mr-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <Text className="text-lg font-normal text-gray-500 dark:text-gray-300">
                      {t(`categories.${item.category.toLowerCase()}`, {
                        defaultValue: item.category,
                      })}
                    </Text>
                  </View>
                  <Text className="text-lg font-medium text-black dark:text-white">{item.percentage}%</Text>
                </View>
              ))}
              {overviewData.categoryData.length > 4 && (
                <TouchableOpacity
                  onPress={() => setShowModal(true)}
                  activeOpacity={0.7}>
                  <Text className="text-sm text-gray-400 dark:text-gray-500">
                    {t('home.moreCategoriesCount', {
                      count: overviewData.categoryData.length - 4,
                      defaultValue: `+${overviewData.categoryData.length - 4} more categories`,
                    })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Total amount display */}
      {!isLoadingOverview && overviewData.totalAmount > 0 && (
        <View className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-300">
          <View className="flex-row justify-between">
            <Text className="text-gray-500 font-dmsans-medium dark:text-white">
              {t('home.totalExpenses')}
            </Text>
            <Text className="text-black font-dmsans-bold dark:text-white">
              {overviewData.totalAmount.toFixed(2)} {getCurrency()}
            </Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-gray-500 font-dmsans-medium dark:text-white">
              {t('home.totalTransactions')}
            </Text>
            <Text className="text-black dark:text-white">{overviewData.expenseCount}</Text>
          </View>
        </View>
      )}
      </View>

      {/* Category Breakdown Modal */}
      <CategoryBreakdownModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        categoryData={overviewData.categoryData}
        totalAmount={overviewData.totalAmount}
        getCurrency={getCurrency}
      />
    </>
  );
};

export default OverviewSection;
