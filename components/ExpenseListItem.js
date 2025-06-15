import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CategoryItem from './CategoryItem';
import { DEFAULT_CATEGORIES } from 'constants/category';

const ExpenseListItem = ({
  id,
  name,
  amount,
  category,
  time,
  paidBy,
  currency = 'MAD',
  onPress,
  categories = [],
  showBorder = true,
  customStyle = {},
}) => {
  console.log('time', time);

  const getCategoryDetails = (categoryId) => {
    const categoryObj = DEFAULT_CATEGORIES.find((cat) => cat.id === categoryId);
    return categoryObj || { icon: 'credit-card', color: '#2979FF' };
  };

  const categoryDetails = getCategoryDetails(category);

  const handlePress = () => {
    if (onPress) {
      onPress({ id, name, amount, category, time, paidBy });
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-between   py-2 ${
        showBorder ? 'border-b border-gray-100' : ''
      } ${customStyle.container || ''}`}
      onPress={handlePress}
      activeOpacity={0.7}>
      {/* Left side - Category Icon and Expense Details */}
      <View className="flex-row items-center flex-1 gap-2">
        {/* Category Icon */}
        <View className="">
          <CategoryItem
            id={category}
            name=""
            icon={categoryDetails.icon}
            color={categoryDetails.color}
            variant="icon-only"
            size="medium"
            showLabel={false}
            isSelected={false}
            customStyle={{
              iconContainer: { backgroundColor: '#E6F0FF' },
            }}
            containerPadding="p-0"
          />
        </View>

        {/* Expense Details */}
        <View className="flex-1">
          <Text
            className={`text-base font-medium text-black ${customStyle.nameText || ''}`}
            numberOfLines={1}>
            {name}
          </Text>
          <Text className={`text-sm text-gray-500 ${customStyle.timeText || ''}`} numberOfLines={1}>
            {time}
          </Text>
        </View>
      </View>

      {/* Right side - Amount and Paid By */}
      <View className="items-end">
        <Text className={`text-base font-semibold text-black ${customStyle.amountText || ''}`}>
          {amount} {currency}
        </Text>
        <Text className={`text-sm text-gray-500 ${customStyle.paidByText || ''}`} numberOfLines={1}>
          Paid by {paidBy}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ExpenseListItem;
