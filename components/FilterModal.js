import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import FilterDateRange from './FilterDateRange';
import FilterAmountRange from './FilterAmountRange';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const FilterModal = ({
  visible,
  onClose,
  initialFilter,
  onApplyFilter,
  categories = [],
  groups = [],
  dateRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'],
  currency = '$',
  resultCount = 80,
}) => {
  const [localFilter, setLocalFilter] = useState(initialFilter);

  const handleApplyFilter = () => {
    onApplyFilter(localFilter);
    onClose();
  };

  const handleResetFilter = () => {
    const resetFilter = {
      dateRange: 'Today',
      selectedCategories: [],
      amountRange: { min: 5, max: 500, selectedMin: 20, selectedMax: 100 },
      selectedGroup: groups[0]?.id || '',
    };
    setLocalFilter(resetFilter);
  };

  const toggleCategory = (categoryId) => {
    setLocalFilter((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(categoryId)
        ? prev.selectedCategories.filter((id) => id !== categoryId)
        : [...prev.selectedCategories, categoryId],
    }));
  };

  const handleRangeSelect = (range) => {
    setLocalFilter((prev) => ({ ...prev, dateRange: range }));
  };

  const handleAmountRangeChange = (newRange) => {
    setLocalFilter((prev) => ({ ...prev, amountRange: newRange }));
  };

  const handleGroupSelect = () => {
    // Implementation for group selection modal can be added here
    console.log('Group selection not implemented yet');
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
          <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-base text-gray-500">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-black">Filter</Text>
            <TouchableOpacity onPress={handleResetFilter}>
              <Text className="text-base text-gray-500">Reset</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-8 px-4 py-6">
            {/* Date Range */}
            <FilterDateRange
              selectedRange={localFilter.dateRange}
              onRangeSelect={handleRangeSelect}
              ranges={dateRanges}
            />

            {/* Categories */}
            {/* <FilterCategories
              categories={categories}
              selectedCategories={localFilter.selectedCategories}
              onCategoryToggle={toggleCategory}
            /> */}
            <View>
              <Text className="mb-4 text-base font-medium text-black">Categories</Text>
              <View className="flex-row flex-wrap justify-between gap-1">
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
                      className={`text-sm font-medium ${
                        localFilter.selectedCategories.includes(category.id)
                          ? 'text-primary'
                          : 'text-gray-600'
                      }`}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Amount Range */}
            <FilterAmountRange
              amountRange={localFilter.amountRange}
              onRangeChange={handleAmountRangeChange}
              currency={currency}
            />

            {/* Group */}
            {/* <FilterGroupSelector
              groups={groups}
              selectedGroup={localFilter.selectedGroup}
              onGroupSelect={handleGroupSelect}
            /> */}
            <View>
              <Text className="mb-4 text-base font-medium text-black">Group</Text>
              <TouchableOpacity className="flex-row items-center justify-between rounded-lg border border-gray-200 px-4 py-4">
                <Text className="text-base text-black">
                  {groups.find((g) => g.id === localFilter.selectedGroup)?.name || 'Select group'}
                </Text>
                <Feather name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View className="border-t border-gray-200 px-4 pb-6 pt-4">
          <TouchableOpacity className="rounded-lg bg-primary py-4" onPress={handleApplyFilter}>
            <Text className="text-center text-base font-semibold text-white">
              See {resultCount} Expenses
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default FilterModal;
