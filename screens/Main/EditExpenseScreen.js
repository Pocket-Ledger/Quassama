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
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Feather } from '@expo/vector-icons';
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

  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [groups, setGroups] = useState([]);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [originalExpense, setOriginalExpense] = useState(null);

  // Load expense data
  useEffect(() => {
    const loadExpenseData = async () => {
      try {
        let expense;

        if (expenseData) {
          // Use provided expense data
          expense = expenseData;
        } else if (expenseId) {
          // Fetch expense by ID
          expense = await Expense.getExpenseByID(expenseId);
        }

        if (expense) {
          setOriginalExpense(expense);
          setExpenseName(expense.title || '');
          setAmount(expense.amount?.toString() || '');
          setSelectedCategory(expense.category || '');
          setSelectedGroup(expense.group_id || null);
          setNote(expense.note || '');
        } else {
          showError(t('customAlert.titles.error'), t('expense.error.notFound'));
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading expense:', error);
        showError(t('customAlert.titles.error'), t('expense.error.loadFailed'));
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenseData();
  }, [expenseId, expenseData]);

  // Fetch the user's groups
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function fetchGroups() {
        try {
          const fetched = await Group.getGroupsByUser(userId);
          let list = [];

          if (fetched && fetched.length > 0) {
            list = fetched.map((g) => ({
              id: g.id,
              name: g.name,
              memberCount: g.members?.length ?? 1,
            }));
          } else {
            // default personal group
            list = [
              {
                id: `personal_${userId}`,
                name: t('group.personal', { defaultValue: 'Personal' }),
                memberCount: 1,
              },
            ];
          }

          if (mounted) {
            setGroups(list);
          }
        } catch (err) {
          console.error('Error loading groups:', err);
        }
      }

      fetchGroups();
      return () => {
        mounted = false;
      };
    }, [userId, t])
  );

  const validateForm = () => {
    const newErrors = {};
    if (!expenseName.trim()) newErrors.expenseName = t('expense.validation.expenseNameRequired');
    else if (expenseName.length > 100) newErrors.expenseName = 'Title cannot exceed 100 characters';

    if (!amount.trim()) newErrors.amount = t('expense.validation.amountRequired');
    else if (isNaN(amount) || parseFloat(amount) <= 0)
      newErrors.amount = t('expense.validation.validAmount');

    if (!selectedCategory) newErrors.category = t('expense.validation.selectCategory');
    if (!selectedGroup) newErrors.group = t('expense.validation.selectGroup');

    if (note.length > 3000) newErrors.note = 'Description cannot exceed 3000 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCategoryIconName = (categoryId) => {
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === categoryId || c.icon === categoryId);
    return cat ? cat.icon : '';
  };

  const handleUpdateExpense = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const iconName = getCategoryIconName(selectedCategory);
      Logger.info(selectedCategory);

      // Update the expense with new data
      const updatedExpense = {
        ...originalExpense,
        title: expenseName.trim(),
        amount: amount.trim(),
        category: selectedCategory,
        note: note.trim(),
        group_id: selectedGroup,
        updated_at: new Date().toISOString(),
      };

      // Create expense instance and update
      const expense = new Expense(
        updatedExpense.title,
        updatedExpense.amount,
        updatedExpense.category,
        updatedExpense.note,
        updatedExpense.group_id,
        updatedExpense.id
      );

      await expense.updateExpense(); // or whatever your update method is called

      console.log('Expense updated successfully:', expense);

      showSuccess(t('customAlert.titles.success'), t('expense.updated_success'), () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      showError(t('customAlert.titles.error'), error.message || t('expense.error.updateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = () => {
    Alert.alert(t('expense.delete.title'), t('expense.delete.message'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: confirmDeleteExpense,
      },
    ]);
  };

  const confirmDeleteExpense = async () => {
    setIsDeleting(true);
    try {
      await Expense.deleteExpenseByID(originalExpense.id);

      showSuccess(t('customAlert.titles.success'), t('expense.deleted_success'), () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      showError(t('customAlert.titles.error'), error.message || t('expense.error.deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId);
    setIsGroupModalVisible(false);
    if (errors.group) {
      setErrors((prev) => ({ ...prev, group: null }));
    }
  };

  const selectedGroupData = groups.find((g) => g.id === selectedGroup);

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
      onPress={() => handleGroupSelect(item.id)}>
      <View>
        <Text className="text-base font-medium text-black">{item.name}</Text>
        <Text className="text-sm text-gray-500">
          {t('group.memberCount', { count: item.memberCount })}
        </Text>
      </View>
      <View className="items-center justify-center w-5 h-5 border-2 border-gray-300 rounded-full">
        {selectedGroup === item.id && <View className="w-3 h-3 rounded-full bg-primary" />}
      </View>
    </TouchableOpacity>
  );

  // Get currency based on current language
  const getCurrency = () => {
    return t('common.currency');
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title={t('expense.editExpense')} />
        <View className="items-center justify-center flex-1">
          <Text className="text-base text-gray-500">{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView
        className="container"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 50 : 100}
        keyboardOpeningTime={0}>
        {/* Header with Delete Button */}

        <Header title={t('expense.editExpense')} />

        <View className="flex-1 gap-6 px-4 mt-6">
          {/* Expense Name */}
          <View className="input-group">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-medium text-black input-label">
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
                  errors.expenseName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder={t('expense.expenseTitle')}
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={expenseName}
                onChangeText={(text) => {
                  setExpenseName(text);
                  if (errors.expenseName) setErrors((prev) => ({ ...prev, expenseName: null }));
                }}
                autoCapitalize="words"
                maxLength={100}
              />
            </View>
            {errors.expenseName && (
              <Text className="mt-1 text-sm text-red-500 error-text">{errors.expenseName}</Text>
            )}
          </View>

          {/* Amount */}
          <View className="input-group">
            <Text className="text-base font-medium text-black input-label">
              {t('expense.expenseAmount')}
            </Text>
            <View className="relative input-container">
              <TextInput
                className={`input-field rounded-lg border px-4  pr-16 text-black ${
                  errors.amount ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="100"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }));
                }}
                keyboardType="numeric"
              />
              <Text className="absolute text-base text-black right-4 top-4">{getCurrency()}</Text>
            </View>
            {errors.amount && (
              <Text className="mt-1 text-sm text-red-500 error-text">{errors.amount}</Text>
            )}
          </View>

          {/* Group Selection */}
          <View className="input-group">
            <Text className="text-base font-medium text-black input-label">
              {t('group.selectGroup')}
            </Text>
            <TouchableOpacity
              className={`input-container rounded-lg border px-4 py-4 ${
                errors.group ? 'border-red-500' : 'border-gray-200'
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
            {errors.group && (
              <Text className="mt-1 text-sm text-red-500 error-text">{errors.group}</Text>
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
          {errors.category && (
            <Text className="mt-2 text-sm text-red-500 error-text">{errors.category}</Text>
          )}

          {/* Note */}
          <View>
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-medium text-black input-label">
                {t('expense.note')}
              </Text>
              <Text className={`text-sm ${note.length > 3000 ? 'text-red-500' : 'text-gray-500'}`}>
                {note.length}/3000
              </Text>
            </View>
            <TextInput
              className={`input-field h-24 rounded-lg border px-4 text-black ${
                errors.note ? 'border-red-500' : 'border-gray-200'
              }`}
              placeholder={t('expense.addNote')}
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={note}
              onChangeText={(text) => {
                setNote(text);
                if (errors.note) setErrors((prev) => ({ ...prev, note: null }));
              }}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
              blurOnSubmit={false}
              returnKeyType="done"
              maxLength={3000}
            />
            {errors.note && (
              <Text className="mt-1 text-sm text-red-500 error-text">{errors.note}</Text>
            )}
          </View>

          {/* Update Expense Button */}
          <TouchableOpacity
            className="py-4 mb-8 rounded-lg btn-primary bg-primary"
            onPress={handleUpdateExpense}
            disabled={isSaving}>
            <Text className="text-base font-semibold text-center text-white btn-primary-text">
              {isSaving ? t('common.updating') : t('expense.updateExpense')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Group Selection Modal */}
      <Modal
        visible={isGroupModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsGroupModalVisible(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1">
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
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
