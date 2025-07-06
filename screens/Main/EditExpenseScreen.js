// EditExpenseScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  FlatList,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

import Expense from 'models/expense/Expense';
import Group from 'models/group/group';
import CustomAlert from 'components/CustomALert';
import { useAlert } from 'hooks/useAlert';
import CategoryList from 'components/CategoryList';
import { DEFAULT_CATEGORIES } from 'constants/category';
import Header from 'components/Header';
import Logger from 'utils/looger';

const EditExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const { alertConfig, hideAlert, showSuccess, showError } = useAlert();

  const auth = getAuth();
  const userId = auth.currentUser.uid;

  // Get expense data from navigation params
  const { expenseId, expenseData } = route.params || {};

  // Log the received parameters
  useEffect(() => {
    Logger.info('EditExpenseScreen - Route params:', {
      expenseId,
      expenseData: expenseData ? 'provided' : 'not provided',
      allParams: route.params,
    });
  }, [expenseId, expenseData, route.params]);

  // State management
  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [groups, setGroups] = useState([]);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [originalExpense, setOriginalExpense] = useState(null);

  // Load expense data
  const loadExpenseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      Logger.log('Loading expense data for editing, ID:', expenseId);

      let expense;

      if (expenseData) {
        // Use provided expense data
        Logger.log('Using provided expense data');
        expense = expenseData;
      } else if (expenseId) {
        // Fetch expense by ID
        Logger.log('Fetching expense by ID:', expenseId);
        expense = await Expense.getExpenseByID(expenseId);
      } else {
        Logger.error('EditExpenseScreen - No expense ID or data provided');
        setError(t('expense.error.invalidId'));
        return;
      }

      if (expense) {
        Logger.log('Expense data loaded successfully:', expense);
        setOriginalExpense(expense);
        setExpenseName(expense.title || '');
        setAmount(expense.amount?.toString() || '');
        setSelectedCategory(expense.category || '');
        setSelectedGroup(expense.group_id || null);
        setNote(expense.note || '');
      } else {
        Logger.error('EditExpenseScreen - Expense not found');
        setError(t('expense.error.notFound'));
      }
    } catch (err) {
      Logger.error('Error loading expense data:', err);
      setError(err.message || t('expense.error.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [expenseId, expenseData, t]);

  // Load expense on component mount
  useEffect(() => {
    if (expenseId || expenseData) {
      loadExpenseData();
    } else {
      Logger.error('EditExpenseScreen - No expense ID or data provided');
      setError(t('expense.error.invalidId'));
      setLoading(false);
    }
  }, [expenseId, expenseData, loadExpenseData]);

  // Fetch the user's groups
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function fetchGroups() {
        try {
          Logger.log('Fetching user groups for user:', userId);
          const fetched = await Group.getGroupsByUser(userId);
          let list = [];

          if (fetched && fetched.length > 0) {
            list = fetched.map((g) => ({
              id: g.id,
              name: g.name,
              memberCount: g.members?.length ?? 1,
            }));
            Logger.log('Groups fetched successfully:', list);
          } else {
            // default personal group
            list = [
              {
                id: `personal_${userId}`,
                name: t('group.personal', { defaultValue: 'Personal' }),
                memberCount: 1,
              },
            ];
            Logger.log('No groups found, using default personal group');
          }

          if (mounted) {
            setGroups(list);
          }
        } catch (err) {
          Logger.error('Error loading groups:', err);
          // Don't show error alert for groups as it's not critical
        }
      }

      fetchGroups();
      return () => {
        mounted = false;
      };
    }, [userId, t])
  );

  const validateForm = () => {
    Logger.log('Validating form data...');
    const newErrors = {};

    if (!expenseName.trim()) {
      newErrors.expenseName = t('expense.validation.expenseNameRequired');
      Logger.log('Validation error: Expense name is required');
    } else if (expenseName.length > 100) {
      newErrors.expenseName = 'Title cannot exceed 100 characters';
      Logger.log('Validation error: Expense name too long');
    }

    if (!amount.trim()) {
      newErrors.amount = t('expense.validation.amountRequired');
      Logger.log('Validation error: Amount is required');
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = t('expense.validation.validAmount');
      Logger.log('Validation error: Invalid amount');
    }

    if (!selectedCategory) {
      newErrors.category = t('expense.validation.selectCategory');
      Logger.log('Validation error: Category not selected');
    }

    if (!selectedGroup) {
      newErrors.group = t('expense.validation.selectGroup');
      Logger.log('Validation error: Group not selected');
    }

    if (note.length > 3000) {
      newErrors.note = 'Description cannot exceed 3000 characters';
      Logger.log('Validation error: Note too long');
    }

    setValidationErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    Logger.log('Form validation result:', { isValid, errors: newErrors });
    return isValid;
  };

  const getCategoryIconName = (categoryId) => {
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === categoryId || c.icon === categoryId);
    return cat ? cat.icon : '';
  };

  const handleUpdateExpense = async () => {
    Logger.log('Update expense requested');

    if (!validateForm()) {
      Logger.log('Form validation failed, update aborted');
      return;
    }

    setIsSaving(true);
    try {
      Logger.log('Updating expense with data:', {
        expenseId: originalExpense?.id,
        title: expenseName.trim(),
        amount: amount.trim(),
        category: selectedCategory,
        description: note.trim(),
        group_id: selectedGroup,
      });

      // Update the expense using static method
      await Expense.updateExpense(originalExpense.id, {
        title: expenseName.trim(),
        amount: amount.trim(),
        category: selectedCategory,
        description: note.trim(),
        group_id: selectedGroup,
      });

      Logger.success('Expense updated successfully');

      showSuccess(t('customAlert.titles.success'), t('customAlert.messages.update_success'), () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      Logger.error('Error updating expense:', error);
      showError(t('customAlert.titles.error'), error.message || t('expense.error.updateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = () => {
    Logger.log('Delete expense requested for ID:', originalExpense?.id);

    Alert.alert(t('expense.delete.title'), t('expense.delete.message'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
        onPress: () => Logger.log('Delete expense cancelled'),
      },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: confirmDeleteExpense,
      },
    ]);
  };

  const confirmDeleteExpense = async () => {
    try {
      Logger.log('Confirming delete for expense ID:', originalExpense?.id);
      setIsDeleting(true);

      await Expense.deleteExpenseByID(originalExpense.id);

      Logger.success('Expense deleted successfully');

      showSuccess(t('customAlert.titles.success'), t('expense.deleted_success'), () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      Logger.error('Error deleting expense:', error);
      showError(t('customAlert.titles.error'), error.message || t('expense.error.deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGroupSelect = (groupId) => {
    Logger.log('Group selected:', groupId);
    setSelectedGroup(groupId);
    setIsGroupModalVisible(false);
    if (validationErrors.group) {
      setValidationErrors((prev) => ({ ...prev, group: null }));
    }
  };

  const selectedGroupData = groups.find((g) => g.id === selectedGroup);

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4"
      onPress={() => handleGroupSelect(item.id)}>
      <View>
        <Text className="text-base font-medium text-black">{item.name}</Text>
        <Text className="text-sm text-gray-500">
          {t('group.memberCount', { count: item.memberCount })}
        </Text>
      </View>
      <View className="h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300">
        {selectedGroup === item.id && <View className="h-3 w-3 rounded-full bg-primary" />}
      </View>
    </TouchableOpacity>
  );

  // Get currency based on current language
  const getCurrency = () => {
    return t('common.currency');
  };

  // Render loading state
  const renderLoading = () => (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2979FF" />
        <Text className="mt-2 text-gray-500">{t('expense.loading')}</Text>
      </View>
    </SafeAreaView>
  );

  // Render error state
  const renderError = () => (
    <SafeAreaView className="flex-1 bg-white">
      <View className="items-center px-4 py-12">
        <View className="mb-4 items-center justify-center">
          <Ionicons name="alert-circle" size={70} color="#FF6B6B" />
        </View>
        <Text className="mb-2 font-dmsans-bold text-[24px]">{t('expense.error.title')}</Text>
        <Text className="mb-6 text-center text-gray-500">{error}</Text>
        <TouchableOpacity className="rounded-lg bg-primary px-6 py-3" onPress={loadExpenseData}>
          <Text className="font-semibold text-white">{t('expense.error.tryAgain')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Render edit form-100
  const renderEditForm = () => (
    <SafeAreaView className="flex-1 ">
      <KeyboardAwareScrollView
        //className="container"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 50 : 100}
        keyboardOpeningTime={0}>
        <Header
          title={t('expense.editExpense')}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View className="flex-1 gap-6 px-4">
          {/* Expense Name */}
          <View className="input-group">
            <View className="flex-row items-center justify-between">
              <Text className="input-label text-base font-medium text-black">
                {t('expense.expenseTitle')}
              </Text>
              <Text
                className={`text-sm ${expenseName.length > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                {expenseName.length}/100
              </Text>
            </View>
            <View className="input-container">
              <TextInput
                className={`input-field rounded-lg border px-4 text-black ${
                  validationErrors.expenseName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder={t('expense.expenseTitle')}
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={expenseName}
                onChangeText={(text) => {
                  setExpenseName(text);
                  if (validationErrors.expenseName)
                    setValidationErrors((prev) => ({ ...prev, expenseName: null }));
                }}
                autoCapitalize="words"
                maxLength={100}
              />
            </View>
            {validationErrors.expenseName && (
              <Text className="error-text mt-1 text-sm text-red-500">
                {validationErrors.expenseName}
              </Text>
            )}
          </View>

          {/* Amount */}
          <View className="input-group">
            <Text className="input-label text-base font-medium text-black">
              {t('expense.expenseAmount')}
            </Text>
            <View className="input-container relative">
              <TextInput
                className={`input-field rounded-lg border px-4  pr-16 text-black ${
                  validationErrors.amount ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="100"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (validationErrors.amount)
                    setValidationErrors((prev) => ({ ...prev, amount: null }));
                }}
                keyboardType="numeric"
              />
              <Text className="absolute right-4 top-4 text-base text-black">{getCurrency()}</Text>
            </View>
            {validationErrors.amount && (
              <Text className="error-text mt-1 text-sm text-red-500">
                {validationErrors.amount}
              </Text>
            )}
          </View>

          {/* Group Selection */}
          <View className="input-group">
            <Text className="input-label text-base font-medium text-black">
              {t('group.selectGroup')}
            </Text>
            <TouchableOpacity
              className={`input-container rounded-lg border px-4 py-4 ${
                validationErrors.group ? 'border-red-500' : 'border-gray-200'
              }`}
              onPress={() => setIsGroupModalVisible(true)}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  {selectedGroupData ? (
                    <View className="flex flex-row justify-between pr-2">
                      <Text className="text-base text-black">{selectedGroupData.name}</Text>
                      <Text className="text-sm text-gray-500">
                        {t('group.memberCount', { count: selectedGroupData.memberCount })}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-base text-gray-400">{t('expense.selectGroup')}</Text>
                  )}
                </View>
                <Feather name="chevron-down" size={20} color="#666" />
              </View>
            </TouchableOpacity>
            {validationErrors.group && (
              <Text className="error-text mt-1 text-sm text-red-500">{validationErrors.group}</Text>
            )}
          </View>

          {/* Category */}
          <CategoryList
            categories={DEFAULT_CATEGORIES}
            selectedCategories={selectedCategory}
            onCategorySelect={setSelectedCategory}
            layout="grid"
            numColumns={5}
            title={t('expense.selectCategory')}
          />
          {validationErrors.category && (
            <Text className="error-text mt-2 text-sm text-red-500">
              {validationErrors.category}
            </Text>
          )}

          {/* Note */}
          <View>
            <View className="flex-row items-center justify-between">
              <Text className="input-label text-base font-medium text-black">
                {t('expense.note')}
              </Text>
              <Text className={`text-sm ${note.length > 3000 ? 'text-red-500' : 'text-gray-500'}`}>
                {note.length}/3000
              </Text>
            </View>
            <TextInput
              className={`input-field h-24 rounded-lg border px-4 text-black ${
                validationErrors.note ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder={t('expense.addNote')}
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={note}
              onChangeText={(text) => {
                setNote(text);
                if (validationErrors.note) setValidationErrors((prev) => ({ ...prev, note: null }));
              }}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
              blurOnSubmit={false}
              returnKeyType="done"
              maxLength={3000}
            />
            {validationErrors.note && (
              <Text className="error-text mt-1 text-sm text-red-500">{validationErrors.note}</Text>
            )}
          </View>

          {/* Update Expense Button */}
          <TouchableOpacity
            className="btn-primary mb-8 mt-6 rounded-lg bg-primary py-4"
            onPress={handleUpdateExpense}
            disabled={isSaving}>
            <Text className="btn-primary-text text-center text-base font-semibold text-white">
              {isSaving ? t('common.updating') : t('expense.updateExpense')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView className="container flex-1 bg-white ">
      {loading ? renderLoading() : error ? renderError() : renderEditForm()}

      {/* Group Selection Modal */}
      <Modal
        visible={isGroupModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsGroupModalVisible(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1">
            <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
              <Text className="text-lg font-semibold text-black">{t('group.selectGroup')}</Text>
              <TouchableOpacity onPress={() => setIsGroupModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={groups}
              renderItem={renderGroupItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </Modal>

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

export default EditExpenseScreen;
