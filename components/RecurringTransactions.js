import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

// Demo data for recurring transactions
const demoRecurringTransactions = [
  {
    id: 1,
    name: 'Netflix',
    amount: 45.99,
    icon: 'N',
    iconBg: '#E50914',
    recurringDay: 15,
    frequency: 'Monthly',
    color: '#FFB3BA',
  },
  {
    id: 2,
    name: 'Spotify',
    amount: 7.99,
    icon: 'S',
    iconBg: '#1DB954',
    recurringDay: 3,
    frequency: 'Monthly',
    color: '#BAE1B3',
  },
  {
    id: 3,
    name: 'Adobe Creative Cloud',
    amount: 52.99,
    icon: 'A',
    iconBg: '#FF0000',
    recurringDay: 10,
    frequency: 'Monthly',
    color: '#FFDFBA',
  },
  {
    id: 4,
    name: 'Amazon Prime',
    amount: 14.99,
    icon: 'A',
    iconBg: '#FF9900',
    recurringDay: 25,
    frequency: 'Monthly',
    color: '#FFFFBA',
  },
];

const RecurringTransactions = () => {
  const { t } = useTranslation();
  const [selectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());

  // Generate calendar days for the current month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

  // Create array of day numbers with leading empty spaces
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Get recurring days from transactions
  const recurringDays = demoRecurringTransactions.map((t) => t.recurringDay);

  const renderCalendarDay = (day, index) => {
    if (day === null) {
      return <View key={`empty-${index}`} className="w-12 h-12" />;
    }

    const isRecurring = recurringDays.includes(day);

    return (
      <View key={day} className="w-12 h-12 items-center justify-center">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isRecurring ? 'bg-[#007bff]' : 'bg-transparent'
          }`}>
          <Text
            className={`text-base ${
              isRecurring ? 'text-white font-dmsans-bold' : 'text-gray-400 font-dmsans-regular'
            }`}>
            {day}
          </Text>
        </View>
      </View>
    );
  };

  return (
      <View className="w-full relative">
        {/* Coming Soon Overlay */}
        <View className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 items-center justify-center">
          <Text className="text-4xl font-dmsans-bold text-blue-900 dark:text-white">
            Coming Soon
          </Text>
        </View>
        
        <Text className="text-2xl font-dmsans-bold text-gray-900 dark:text-white mb-6">
          Recurring Transactions
        </Text>

        {/* Calendar Card */}
        <View className="bg-[#E8E9F3] dark:bg-gray-800 rounded-3xl p-6 mb-6">
          {/* Calendar Grid */}
          <View className="flex-row flex-wrap mb-4">
            {calendarDays.map((day, index) => renderCalendarDay(day, index))}
          </View>

          {/* Transactions List */}
          <View className="">
            {demoRecurringTransactions.map((transaction) => (
              <View
                key={transaction.id}
                className="flex-row items-center justify-between bg-white dark:bg-gray-700 rounded-2xl p-4 mb-2">
                {/* Left side - Icon and Details */}
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: transaction.color }}>
                    <Text className="text-xl font-dmsans-bold text-white">
                      {transaction.icon}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-dmsans-bold text-gray-900 dark:text-white">
                      {transaction.name}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.recurringDay}
                      {transaction.recurringDay === 1
                        ? 'st'
                        : transaction.recurringDay === 2
                          ? 'nd'
                          : transaction.recurringDay === 3
                            ? 'rd'
                            : 'th'}{' '}
                      of Month • {transaction.frequency}
                    </Text>
                  </View>
                </View>

                {/* Right side - Amount */}
                <View className="bg-[#478eff] rounded-xl px-4 py-2">
                  <Text className="text-base font-dmsans-bold text-white">
                    ${transaction.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Upgrade Section */}
          <View className="mt-6 flex-row items-center">
            <TouchableOpacity className="bg-blue-800 dark:bg-gray-600 rounded-xl px-6 py-3 mr-4">
              <Text className="text-white font-dmsans-bold text-base">Upgrade</Text>
            </TouchableOpacity>
            <Text className="flex-1 text-sm text-gray-600 dark:text-gray-400 font-dmsans-regular">
              Upgrade to PRO to see your recurring transactions, automatically detected and
              refreshed once a day.
            </Text>
          </View>
        </View>
      </View>
  );
};

export default RecurringTransactions;