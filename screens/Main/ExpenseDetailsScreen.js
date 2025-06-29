import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Share,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import CategoryItem from 'components/CategoryItem';
import Header from 'components/Header';
import CustomAlert from 'components/CustomALert';
import { useAlert } from 'hooks/useAlert';
import { DEFAULT_CATEGORIES } from 'constants/category';
import Expense from 'models/expense/Expense';
import { useTranslation } from 'react-i18next';
import Logger from 'utils/looger';
import { formatDate, formatTime } from 'utils/time';

const ExpenseDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { alertConfig, showAlert, hideAlert, showSuccess, showError, showConfirm } = useAlert();

  // Get expense ID from route params
  const expenseId = route.params?.expenseId;
  //const groupId = route.params?.groupId;
  Logger.success(expenseId);
  // Log the received parameters
  useEffect(() => {
    Logger.info('ExpenseDetailsScreen - Route params:', {
      expenseId,
      // groupId,
      allParams: route.params,
    });
  }, [expenseId, route.params]);

  // State management
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Dummy expense data for testing
  const getDummyExpense = () => {
    return {
      id: expenseId || 'dummy-expense-123',
      title: 'Grocery Shopping',
      description:
        'Weekly grocery shopping at the supermarket including fresh vegetables, fruits, and household items.',
      amount: 247.5,
      category: 'food',
      user_name: 'Ahmed Benali',
      group_name: 'Family Expenses',
      // group_id: groupId || 'family_group_001',
      incurred_at: new Date('2024-06-28T14:30:00'),
      created_at: new Date('2024-06-28T14:35:00'),
      updated_at: new Date('2024-06-28T14:35:00'),
    };
  };

  // Load expense details
  const loadExpenseDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      Logger.log('Loading expense details for ID:', expenseId);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, use dummy data
      const dummyExpense = await Expense.getExpenseByID(expenseId);
      console.log('Dummy expense data:', dummyExpense);
      setExpense(dummyExpense);

      Logger.log('Expense details loaded:', dummyExpense);

      /* 
      // Real API call would be:
      const expenseData = await Expense.getExpenseById(expenseId);
      if (expenseData) {
        setExpense(expenseData);
      } else {
        setError(t('expense.error.notFound'));
      }
      */
    } catch (err) {
      Logger.error('Error loading expense details:', err);
      setError(err.message || t('expense.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [expenseId, t]);

  // Load expense on component mount and when screen is focused
  useEffect(() => {
    if (expenseId) {
      loadExpenseDetails();
    } else {
      Logger.error('ExpenseDetailsScreen - No expense ID provided');
      setError(t('expense.error.invalidId'));
      setLoading(false);
    }
  }, [expenseId, loadExpenseDetails]);

  // Reload when screen comes into focus (useful after editing)
  /*  useFocusEffect(
    useCallback(() => {
      if (expenseId && !loading) {
        Logger.log('Screen focused, reloading expense details');
        loadExpenseDetails();
      }
    }, [expenseId, loadExpenseDetails, loading])
  ); */

  // Get category details
  const getCategoryDetails = (categoryId) => {
    const categoryObj = DEFAULT_CATEGORIES.find((cat) => cat.id === categoryId);
    return (
      categoryObj || { icon: 'credit-card', color: '#2979FF', name: t('expense.category.unknown') }
    );
  };

  // Format timestamp

  // Handle edit expense
  const handleEditExpense = () => {
    Logger.log('Edit expense pressed for ID:', expense.id);
    navigation.navigate('EditExpense', {
      expenseId: expense.id,
      //groupId: groupId || expense.group_id,
    });
  };

  // Handle delete expense
  const handleDeleteExpense = () => {
    Logger.log('Delete expense requested for ID:', expense.id);

    showConfirm(
      t('expense.delete.title'),
      t('expense.delete.message'),
      confirmDeleteExpense,
      t('common.delete'),
      t('common.cancel')
    );
  };

  const confirmDeleteExpense = async () => {
    try {
      Logger.log('Confirming delete for expense ID:', expense.id);
      setDeleting(true);

      await Expense.deleteExpenseByID(expense.id);

      showSuccess(t('expense.delete.success.title'), t('expense.delete.success.message'), () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (err) {
      Logger.error('Error deleting expense:', err);
      showError(t('expense.delete.error.title'), err.message || t('expense.delete.error.message'));
    } finally {
      setDeleting(false);
    }
  };

  // Handle share expense
  const handleShareExpense = async () => {
    if (!expense) return;

    Logger.log('Share expense pressed for ID:', expense.id);

    const categoryDetails = getCategoryDetails(expense.category);
    const shareText = t('expense.share.text', {
      title: expense.title,
      amount: expense.amount,
      currency: t('common.currency'),
      category: categoryDetails.name,
      paidBy: expense.user_name || t('common.unknown'),
      date: formatDate(expense.incurred_at),
    });

    try {
      await Share.share({
        message: shareText,
        title: t('expense.share.title'),
      });
      Logger.log('Expense shared successfully');
    } catch (err) {
      Logger.error('Error sharing expense:', err);
      showError(t('expense.share.error.title'), t('expense.share.error.message'));
    }
  };

  // Render loading state
  const renderLoading = () => (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#2979FF" />
      <Text className="mt-2 text-gray-500">{t('expense.loading')}</Text>
    </View>
  );

  // Render error state
  const renderError = () => (
    <View className="items-center px-4 py-12">
      <View className="mb-4 items-center justify-center">
        <Ionicons name="alert-circle" size={70} color="#FF6B6B" />
      </View>
      <Text className="mb-2 font-dmsans-bold text-[24px]">{t('expense.error.title')}</Text>
      <Text className="mb-6 text-center text-gray-500">{error}</Text>
      <TouchableOpacity className="rounded-lg bg-primary px-6 py-3" onPress={loadExpenseDetails}>
        <Text className="font-semibold text-white">{t('expense.error.tryAgain')}</Text>
      </TouchableOpacity>
    </View>
  );

  // Render expense details
  const renderExpenseDetails = () => {
    if (!expense) return null;

    const categoryDetails = getCategoryDetails(expense.category);

    return (
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Main Expense Info Card */}
        <View className="shadow-sm ">
          {/* Amount and Category */}
          <View className="items-center">
            <View className="mb-4">
              <CategoryItem
                id={expense.category}
                name=""
                icon={categoryDetails.icon}
                color={categoryDetails.color}
                variant="icon-only"
                size="large"
                showLabel={false}
                isSelected={false}
                customStyle={{
                  iconContainer: { backgroundColor: `${categoryDetails.color}20` },
                }}
              />
            </View>

            <Text className="mb-2 font-dmsans-bold text-3xl text-gray-900">
              {expense.amount} {t('common.currency')}
            </Text>

            <Text className="font-medium text-gray-600">{categoryDetails.name}</Text>
          </View>

          {/* Expense Title */}
          <View className="border-t border-gray-100 pt-4">
            <Text className="mb-2 text-sm font-medium text-gray-500">
              {t('expense.details.title')}
            </Text>
            <Text className="text-lg font-medium text-gray-900">{expense.title}</Text>
          </View>

          {/* Description (if available) */}
          {expense.description && (
            <View className="mt-4">
              <Text className="mb-2 text-sm font-medium text-gray-500">
                {t('expense.details.description')}
              </Text>
              <Text className="text-base text-gray-700">{expense.description}</Text>
            </View>
          )}
        </View>

        {/* Details Card */}
        <View className="mx-4 mt-4 rounded-lg bg-white p-4 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            {t('expense.details.information')}
          </Text>

          {/* Paid By */}
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <Ionicons name="person" size={20} color="#2979FF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-500">{t('expense.details.paidBy')}</Text>
              <Text className="text-base font-medium text-gray-900">
                {expense.user_name || t('common.unknown')}
              </Text>
            </View>
          </View>

          {/* Date */}
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <Ionicons name="calendar" size={20} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-500">{t('expense.details.date')}</Text>
              <Text className="text-base font-medium text-gray-900">
                {formatDate(expense.incurred_at)}
              </Text>
            </View>
          </View>

          {/* Time */}
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-50">
              <Ionicons name="time" size={20} color="#8B5CF6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-500">{t('expense.details.time')}</Text>
              <Text className="text-base font-medium text-gray-900">
                {formatTime(expense.incurred_at)}
              </Text>
            </View>
          </View>

          {/* Group (if available) */}
          {expense.group_name && (
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                <Ionicons name="people" size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500">{t('expense.details.group')}</Text>
                <Text className="text-base font-medium text-gray-900">{expense.group_name}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="mx-4 mt-4 flex gap-3">
          {/* Edit Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-lg bg-primary py-3"
            onPress={handleEditExpense}
            disabled={deleting}>
            <Feather name="edit-2" size={20} color="white" />
            <Text className="ml-2 font-semibold text-white">{t('expense.details.edit')}</Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-lg border border-gray-300 py-3"
            onPress={handleShareExpense}
            disabled={deleting}>
            <Feather name="share" size={20} color="#374151" />
            <Text className="ml-2 font-semibold text-gray-700">{t('expense.details.share')}</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-lg border border-red-300 py-3"
            onPress={handleDeleteExpense}
            disabled={deleting}>
            {deleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Feather name="trash-2" size={20} color="#EF4444" />
            )}
            <Text className="ml-2 font-semibold text-red-500">
              {deleting ? t('expense.details.deleting') : t('expense.details.delete')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="container flex-1 bg-white ">
      <Header
        title={t('expense.details.title')}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {loading ? renderLoading() : error ? renderError() : renderExpenseDetails()}

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
        showCancel={alertConfig.showCancel}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
    </SafeAreaView>
  );
};

export default ExpenseDetailsScreen;
