import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import ExpenseListItem from './ExpenseListItem';
import Avatar from './Avatar';
import Expense from 'models/expense/Expense';
import User from 'models/auth/user';
import { DEFAULT_CATEGORIES } from 'constants/category';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.7;

const MemberExpensesDrawer = ({ visible, onClose, groupId, userId, memberInfo }) => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [memberStats, setMemberStats] = useState({
    totalPaid: 0,
    totalOwed: 0,
    expenseCount: 0,
  });

  // Fetch member expenses
  const fetchMemberExpenses = useCallback(async () => {
    if (!groupId || !userId) return;

    setLoading(true);
    try {
      // Fetch expenses by this user in this group
      const userExpenses = await Expense.getExpensesByUserAndGroup(userId, groupId);

      // Get username for display
      const username = await User.getUsernameById(userId);

      // Format expenses for display
      const formattedExpenses = userExpenses.map((expense) => ({
        id: expense.id,
        name: expense.title,
        amount: expense.amount,
        category: expense.category,
        time: expense.incurred_at.toDate().toLocaleString(),
        paidBy: username,
      }));

      // Calculate member statistics
      const totalPaid = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const expenseCount = userExpenses.length;

      // Get member's balance in the group
      const balances = await Expense.getBalanceByAllUsersInGroup(groupId);
      const memberBalance = balances[userId] || 0;
      const totalOwed = memberBalance < 0 ? Math.abs(memberBalance) : 0;

      setExpenses(formattedExpenses);
      setMemberStats({
        totalPaid,
        totalOwed,
        expenseCount,
      });
    } catch (error) {
      console.error('Error fetching member expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId, userId]);

  // Effect to fetch data when drawer becomes visible
  useEffect(() => {
    if (visible) {
      fetchMemberExpenses();
    }
  }, [visible, groupId, userId, fetchMemberExpenses]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      {/* Overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      </View>

      {/* Drawer */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: DRAWER_HEIGHT,
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        {/* Handle bar */}
        <TouchableOpacity onPress={onClose} className="items-center py-3">
          <View className="h-1 w-10 rounded-full bg-gray-300" />
        </TouchableOpacity>

        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-6 pb-4">
          <View className="flex-row items-center">
            <Avatar
              initial={memberInfo?.initial}
              name={memberInfo?.name}
              color={memberInfo?.color}
              size="medium"
            />
            <View className="ml-3">
              <Text className="font-dmsans-medium text-lg text-black">{memberInfo?.name}</Text>
              <Text className="text-sm text-gray-500">{t('memberDrawer.expenseHistory')}</Text>
            </View>
          </View>
        </View>

        {/* Member Statistics */}
        <View className="border-b border-gray-100 px-6 py-4">
          {loading ? (
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-sm text-gray-500">{t('memberDrawer.totalPaid')}</Text>
                <View className="mt-1 h-6 w-20 rounded bg-gray-200" />
              </View>

              <View className="flex-1 items-center">
                <Text className="text-sm text-gray-500">{t('memberDrawer.totalOwed')}</Text>
                <View className="mt-1 h-6 w-20 rounded bg-gray-200" />
              </View>

              <View className="flex-1 items-end">
                <Text className="text-sm text-gray-500">{t('memberDrawer.expenses')}</Text>
                <View className="mt-1 h-6 w-12 rounded bg-gray-200" />
              </View>
            </View>
          ) : (
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-sm text-gray-500">{t('memberDrawer.totalPaid')}</Text>
                <Text className="font-dmsans-medium text-lg text-green-600">
                  {memberStats.totalPaid.toFixed(1)} {t('common.currency')}
                </Text>
              </View>

              <View className="flex-1 items-center">
                <Text className="text-sm text-gray-500">{t('memberDrawer.totalOwed')}</Text>
                <Text className="font-dmsans-medium text-lg text-red-500">
                  {memberStats.totalOwed.toFixed(1)} {t('common.currency')}
                </Text>
              </View>

              <View className="flex-1 items-end">
                <Text className="text-sm text-gray-500">{t('memberDrawer.expenses')}</Text>
                <Text className="font-dmsans-medium text-lg text-blue-600">
                  {memberStats.expenseCount}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Expenses List */}
        <View className="flex-1 px-6">
          <Text className="py-4 font-dmsans-medium text-base text-black">
            {t('memberDrawer.recentExpenses')}
          </Text>

          {loading ? (
            <View className="flex-1">
              <Text className="py-4 font-dmsans-medium text-base text-black">
                {t('memberDrawer.recentExpenses')}
              </Text>
              
              {/* Skeleton loading for expenses list */}
              <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {[1, 2, 3, 4].map((index) => (
                  <View key={index} className="mb-4 rounded-lg border border-gray-100 bg-white p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="h-5 w-32 rounded bg-gray-200" />
                        <View className="mt-2 h-4 w-20 rounded bg-gray-200" />
                      </View>
                      <View className="items-end">
                        <View className="h-5 w-16 rounded bg-gray-200" />
                        <View className="mt-2 h-4 w-12 rounded bg-gray-200" />
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : expenses.length > 0 ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              className="flex-1"
              contentContainerStyle={{ paddingBottom: 20 }}>
              {expenses.map((expense) => (
                <ExpenseListItem
                  key={expense.id}
                  id={expense.id}
                  name={expense.name}
                  amount={expense.amount}
                  category={expense.category}
                  time={expense.time}
                  paidBy={expense.paidBy}
                  categories={DEFAULT_CATEGORIES}
                  onPress={() => console.log('Expense pressed:', expense)}
                  showBorder={true}
                  currency={t('common.currency')}
                />
              ))}
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Feather name="receipt" size={48} color="#D1D5DB" />
              <Text className="mt-4 text-center text-base text-gray-500">
                {t('memberDrawer.noExpenses')}
              </Text>
              <Text className="mt-2 text-center text-sm text-gray-400">
                {t('memberDrawer.noExpensesDescription')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default React.memo(MemberExpensesDrawer);
