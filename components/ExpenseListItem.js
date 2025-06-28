import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CategoryItem from './CategoryItem';
import { DEFAULT_CATEGORIES } from 'constants/category';
import { useTranslation } from 'react-i18next';
import { useRTL } from 'hooks/useRTL'; // Import RTL hook
import Logger from 'utils/looger';

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
  isRTL: propIsRTL, // Optional RTL prop override
}) => {
  const { t } = useTranslation();
  const { isRTL: hookIsRTL, getFlexDirection, getTextAlign, getMargin, getPadding } = useRTL();

  // Use prop RTL if provided, otherwise use hook
  const isRTL = propIsRTL !== undefined ? propIsRTL : hookIsRTL;

  const getCategoryDetails = (categoryId) => {
    const categoryObj = DEFAULT_CATEGORIES.find((cat) => cat.id == categoryId);
    return categoryObj || { icon: 'credit-card', color: '#2979FF' };
  };

  const categoryDetails = getCategoryDetails(category);
  const handlePress = () => {
    if (onPress) {
      onPress({ id, name, amount, category, time, paidBy });
    }
  };

  // Get translated currency
  const getDisplayCurrency = () => {
    return t('common.currency');
  };

  // Format the "Paid by" text with translation
  const getPaidByText = () => {
    return t('expense.paidBy', { name: paidBy });
  };

  return (
    <TouchableOpacity
      className={`${getFlexDirection()} items-center justify-between py-2 ${
        showBorder ? 'border-b border-gray-100' : ''
      } ${customStyle.container || ''}`}
      onPress={handlePress}
      activeOpacity={0.7}>
      {/* Left side - Category Icon and Expense Details */}
      <View className={`flex-1 ${getFlexDirection()} items-center gap-2`}>
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
            isRTL={isRTL} // Pass RTL to CategoryItem
          />
        </View>

        {/* Expense Details */}
        <View className="flex-1">
          <Text
            className={`text-base font-medium text-black ${getTextAlign('left')} ${customStyle.nameText || ''}`}
            numberOfLines={1}>
            {name}
          </Text>
          <Text
            className={`text-sm text-gray-500 ${getTextAlign('left')} ${customStyle.timeText || ''}`}
            numberOfLines={1}>
            {time}
          </Text>
        </View>
      </View>

      {/* Right side - Amount and Paid By */}
      <View className={`items-${isRTL ? 'start' : 'end'}`}>
        <Text
          className={`text-base font-semibold text-black ${getTextAlign('right')} ${customStyle.amountText || ''}`}>
          {amount} {getDisplayCurrency()}
        </Text>
        <Text
          className={`text-sm text-gray-500 ${getTextAlign('right')} ${customStyle.paidByText || ''}`}
          numberOfLines={1}>
          {getPaidByText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ExpenseListItem;
