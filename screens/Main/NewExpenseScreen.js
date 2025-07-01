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
        navigation.navigate('GroupDetails', { groupId: selectedGroup });
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

          {/* Add Expense Button */}
          <TouchableOpacity
            className="py-4 mb-8 rounded-lg btn-primary bg-primary"
            onPress={handleAddExpense}
            disabled={isSaving}>
            <Text className="text-base font-semibold text-center text-white btn-primary-text">
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

export default NewExpenseScreen;
