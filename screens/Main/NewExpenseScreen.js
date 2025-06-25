// NewExpenseScreen.js

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
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

import Expense from 'models/expense/Expense';
import Group from 'models/group/group';
import CustomAlert from 'components/CustomALert';
import { useAlert } from 'hooks/useAlert';
import CategoryList from 'components/CategoryList';
import { DEFAULT_CATEGORIES } from 'constants/category';
import Header from 'components/Header';
import FloatingPlusButton from 'components/FloatingPlusButton';
import Logger from 'utils/looger';

const NewExpenseScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { alertConfig, hideAlert, showSuccess, showError } = useAlert();

  const auth = getAuth();
  const userId = auth.currentUser.uid;

  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [groups, setGroups] = useState([]);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);

  // Fetch the user's groups (or fall back to Personal)
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
            // default select the first group if none selected yet
            if (!selectedGroup) {
              setSelectedGroup(list[0].id);
            }
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
    if (!amount.trim()) newErrors.amount = t('expense.validation.amountRequired');
    else if (isNaN(amount) || parseFloat(amount) <= 0)
      newErrors.amount = t('expense.validation.validAmount');
    if (!selectedCategory) newErrors.category = t('expense.validation.selectCategory');
    if (!selectedGroup) newErrors.group = t('expense.validation.selectGroup');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCategoryIconName = (categoryId) => {
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === categoryId || c.icon === categoryId);
    return cat ? cat.icon : '';
  };

  const handleAddExpense = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const iconName = getCategoryIconName(selectedCategory);
      Logger.info(selectedCategory);
      const expense = new Expense(
        expenseName.trim(), // title
        amount.trim(), // amount
        selectedCategory, // category (icon name instead of id)
        note.trim(), // note/description
        selectedGroup // group_id
      );
      await expense.save();

      console.log('Expense saved successfully:', expense);
      setExpenseName('');
      setAmount('');
      setSelectedCategory('');
      setNote('');
      setSelectedGroup(null);

      showSuccess(t('customAlert.titles.success'), t('expense.added_success'), () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error saving expense:', error);
      showError(t('customAlert.titles.error'), error.message || t('expense.error.saveFailed'));
    } finally {
      setIsSaving(false);
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
        <Header title={t('expense.addExpense')} />

        <View className="flex-1 gap-6 px-4">
          {/* Expense Name */}
          <View className="input-group">
            <Text className="input-label text-base font-medium text-black">
              {t('expense.expenseTitle')}
            </Text>
            <View className="input-container">
              <TextInput
                className={`input-field rounded-lg border px-4 py-4 text-black ${
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
              />
            </View>
            {errors.expenseName && (
              <Text className="error-text mt-1 text-sm text-red-500">{errors.expenseName}</Text>
            )}
          </View>

          {/* Amount */}
          <View className="input-group">
            <Text className="input-label text-base font-medium text-black">
              {t('expense.expenseAmount')}
            </Text>
            <View className="input-container relative">
              <TextInput
                className={`input-field rounded-lg border px-4 py-4 pr-16 text-black ${
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
              <Text className="absolute right-4 top-4 text-base text-black">{getCurrency()}</Text>
            </View>
            {errors.amount && (
              <Text className="error-text mt-1 text-sm text-red-500">{errors.amount}</Text>
            )}
          </View>

          {/* Group Selection */}
          <View className="input-group">
            <Text className="input-label text-base font-medium text-black">
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
              <Text className="error-text mt-1 text-sm text-red-500">{errors.group}</Text>
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
            <Text className="error-text mt-2 text-sm text-red-500">{errors.category}</Text>
          )}

          {/* Note */}
          <View>
            <Text className="input-label text-base font-medium text-black">
              {t('expense.note')}
            </Text>
            <TextInput
              className="input-field h-24 rounded-lg border border-gray-200 px-4 py-4 text-black"
              placeholder={t('expense.addNote')}
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
              blurOnSubmit={false}
              returnKeyType="done"
            />
          </View>

          {/* Add Expense Button */}
          <TouchableOpacity
            className="btn-primary mb-8 rounded-lg bg-primary py-4"
            onPress={handleAddExpense}
            disabled={isSaving}>
            <Text className="btn-primary-text text-center text-base font-semibold text-white">
              {isSaving ? t('common.adding') : t('expense.addExpense')}
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

export default NewExpenseScreen;
