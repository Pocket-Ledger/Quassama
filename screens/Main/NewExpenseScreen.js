// NewExpenseScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';

import Expense from 'models/expense/Expense';
import Group from 'models/group/group';
import CustomAlert from 'components/CustomALert';
import { useAlert } from 'hooks/useAlert';
import CategoryList from 'components/CategoryList';
import CategoryItem from 'components/CategoryItem';
import CategoryModel from 'components/CategoryModel';
import { DEFAULT_CATEGORIES } from 'constants/category';
import Header from 'components/Header';
import FloatingPlusButton from 'components/FloatingPlusButton';
import Logger from 'utils/looger';
import RepeatSection from 'components/RepeatSection';
import SplitWithSection from 'components/SplitWithSection';
import { SafeAreaView } from 'react-native-safe-area-context';

const NewExpenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, i18n } = useTranslation();
  const { alertConfig, hideAlert, showSuccess, showError } = useAlert();

  // Get groupId from route params if it exists
  const { groupId: routeGroupId } = route.params || {};

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
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [userHasGroups, setUserHasGroups] = useState(false);


  const [selectedRepeat, setSelectedRepeat] = useState('oneTime');
  const [customDays, setCustomDays] = useState('');
  const [customInterval, setCustomInterval] = useState('days');
  const [splits, setSplits] = useState({});
  const [isSplitEnabled, setIsSplitEnabled] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]); // Add state for group members

  // Fetch the user's groups (or fall back to Personal)
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function fetchGroups() {
        try {
          // Check if user has any groups first
          const hasGroups = await Group.hasAnyGroups();
          setUserHasGroups(hasGroups);

          if (!hasGroups) {
            return;
          }

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

            // Auto-select group logic
            if (routeGroupId) {
              // If groupId was passed from route, check if it exists in the list
              const groupExists = list.find((g) => g.id === routeGroupId);
              if (groupExists) {
                setSelectedGroup(routeGroupId);
                fetchGroupMembers(routeGroupId); // Fetch members for the selected group
              } else {
                // If passed groupId doesn't exist, fallback to first group
                setSelectedGroup(list[0]?.id || null);
                fetchGroupMembers(list[0]?.id || null);
              }
            } else {
              // If no groupId was passed in route params, always reset to first group
              setSelectedGroup(list[0]?.id || null);
              fetchGroupMembers(list[0]?.id || null);
            }
          }
        } catch (err) {
          console.error('Error loading groups:', err);
          // Set default personal group members even if there's an error
          setGroupMembers([
            {
              user_id: userId,
              username: t('expense.split.you'),
              email: auth.currentUser?.email || '',
            },
          ]);
        }
      }

      fetchGroups();
      return () => {
        mounted = false;
      };
    }, [userId, t, routeGroupId])
  );

  const validateForm = () => {
    const newErrors = {};
    if (!expenseName.trim()) newErrors.expenseName = t('expense.validation.expenseNameRequired');
    else if (expenseName.length > 100) newErrors.expenseName = 'Title cannot exceed 100 characters';

    if (!amount.trim()) newErrors.amount = t('expense.validation.amountRequired');
    else if (isNaN(amount) || parseFloat(amount) <= 0)
      newErrors.amount = t('expense.validation.validAmount');
    else if (parseFloat(amount) > 100000) newErrors.amount = t('expense.validation.maxCharacter');
    if (!selectedCategory) newErrors.category = t('expense.validation.selectCategory');
    if (!selectedGroup) newErrors.group = t('expense.validation.selectGroup');

    // Repeat validation
    if (selectedRepeat === 'custom') {
      if (!customDays.trim() || isNaN(customDays) || parseInt(customDays) <= 0) {
        newErrors.repeat = t('expense.validation.validCustomDays');
      }
    }

    // Split validation - only validate if split is enabled
    if (isSplitEnabled && splits && Object.keys(splits).length > 0) {
      const totalSplitAmount = Object.values(splits).reduce((sum, split) => {
        return sum + (parseFloat(split.amount) || 0);
      }, 0);
      const expenseAmount = parseFloat(amount) || 0;

      if (Math.abs(totalSplitAmount - expenseAmount) > 0.01) {
        newErrors.splits = t('expense.validation.splitAmountMismatch');
      }
    }
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

    // Check if user still has groups before saving
    try {
      const hasGroups = await Group.hasAnyGroups();
      if (!hasGroups) {
        showError('No Groups', 'You need to create a group first before adding expenses.');
        navigation.navigate('AddNewGroupScreen');
        return;
      }
    } catch (error) {
      console.error('Error checking user groups:', error);
      showError('Error', 'Unable to verify groups. Please try again.');
      return;
    }

    setIsSaving(true);
    try {
      const iconName = getCategoryIconName(selectedCategory);
      const repeatData = {
        type: selectedRepeat,
        customDays: selectedRepeat === 'custom' ? parseInt(customDays) : null,
        customInterval: selectedRepeat === 'custom' ? customInterval : null,
      };

      // Prepare splits data - only include if split is enabled
      const splitsData = isSplitEnabled && splits && Object.keys(splits).length > 0 ? splits : null;

      console.log(repeatData);
      console.log('Splits Data:', JSON.stringify(splitsData, null, 2));
      console.log('Is Split Enabled:', isSplitEnabled);
      console.log(selectedCategory);
      const expense = new Expense(
        expenseName.trim(), // title
        amount.trim(), // amount
        selectedCategory, // category (icon name instead of id)
        note.trim(), // note/description
        selectedGroup, // group_id
        splitsData // splits data
      );
      await expense.save();

      // Add haptic feedback for successful expense creation
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      console.log('Expense saved successfully:', expense);
      setExpenseName('');
      setAmount('');
      setSelectedCategory('');
      setNote('');
      setSelectedRepeat('oneTime');
      setCustomDays('');
      setCustomInterval('days');
      setSplits({});
      setIsSplitEnabled(false);
      // Don't reset selectedGroup to maintain the selection for next expense

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

    // Reset split data when group changes
    if (isSplitEnabled) {
      setSplits({});
      setIsSplitEnabled(false);
    }

    // Fetch group members when group changes
    fetchGroupMembers(groupId);

    if (errors.group) {
      setErrors((prev) => ({ ...prev, group: null }));
    }
  };

  // Function to fetch real group members
  const fetchGroupMembers = async (groupId) => {
    if (!groupId || groupId.startsWith('personal_')) {
      setGroupMembers([
        {
          user_id: userId,
          username: t('expense.split.you'),
          email: auth.currentUser?.email || '',
        },
      ]);
      return;
    }

    try {
      const members = await Group.getMembersByGroup(groupId);
      const formattedMembers = members.map((member) => ({
        user_id: member.user_id || member.id,
        username: member.user_id === userId ? t('expense.split.you') : member.username,
        email: member.email || '',
      }));
      console.log('Fetched group members for group', groupId, ':', formattedMembers);
      setGroupMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching group members:', error);
      // Fallback to current user only
      setGroupMembers([
        {
          user_id: userId,
          username: t('expense.split.you'),
          email: auth.currentUser?.email || '',
        },
      ]);
    }
  };

  const handleSplitEnabledChange = (enabled) => {
    setIsSplitEnabled(enabled);
    if (!enabled) {
      setSplits({});
    }
    // Clear split errors when disabling
    if (!enabled && errors.splits) {
      setErrors((prev) => ({ ...prev, splits: null }));
    }
  };

  const getGroupMembers = (groupId) => {
    return groupMembers;
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

  // Show loading or redirect if user has no groups
  if (!userHasGroups) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center" edges={['top', 'left', 'right']}>
        <View className="container px-4">
          <Text className="text-xl font-semibold text-center mb-4">{t('group.createYourFirstGroup')}</Text>
          <Text className="text-gray-600 text-center mb-6">{t('group.createYourFirstGroupDesc')}</Text>
          <TouchableOpacity
            className="btn-primary rounded-lg bg-primary py-4"
            onPress={() => navigation.navigate('AddNewGroup')}>
            <Text className="btn-primary-text text-center text-base font-semibold text-white">
              {t('group.createYourFirstGroup')}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white " edges={['top', 'left', 'right']}>
      <View className="container">
        <Header title={t('expense.addExpense')} />

        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={Platform.OS === 'ios' ? 50 : 100}
          keyboardOpeningTime={0}>
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
                <Text className="absolute right-4 top-4 text-base text-black">{getCurrency()}</Text>
              </View>
              {errors.amount && (
                <Text className="error-text mt-1 text-sm text-red-500">{errors.amount}</Text>
              )}
            </View>

            {/* <RepeatSection
              selectedRepeat={selectedRepeat}
              onRepeatChange={setSelectedRepeat}
              customDays={customDays}
              onCustomDaysChange={setCustomDays}
              customInterval={customInterval}
              onCustomIntervalChange={setCustomInterval}
              error={errors.repeat}
            /> */}

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

            {/* Split With Section */}
            {groupMembers && groupMembers.length > 1 && (
              <SplitWithSection
                selectedGroup={selectedGroup}
                groupMembers={groupMembers}
                splits={splits}
                onSplitsChange={setSplits}
                totalAmount={amount}
                currentUserId={userId}
                error={errors.splits}
                isSplitEnabled={isSplitEnabled}
                onSplitEnabledChange={handleSplitEnabledChange}
              />
            )}

            {/* Category */}
            <View>
              <Text className="input-label mb-3 text-base font-medium text-black">
                {t('expense.selectCategory')}
              </Text>
              
              {/* Show categories with selected category first */}
              <View className="flex-row flex-wrap">
                {(() => {
                  // Get the selected category if it exists
                  const selectedCategoryData = DEFAULT_CATEGORIES.find(cat => cat.id === selectedCategory);
                  
                  // Create categories array with selected category first
                  let categoriesToShow = [];
                  
                  if (selectedCategoryData) {
                    // Add selected category first
                    categoriesToShow.push(selectedCategoryData);
                    
                    // Add remaining categories (excluding the selected one) up to 3 more
                    const remainingCategories = DEFAULT_CATEGORIES
                      .filter(cat => cat.id !== selectedCategory)
                      .slice(0, 3);
                    categoriesToShow = categoriesToShow.concat(remainingCategories);
                  } else {
                    // No category selected, show first 4 as usual
                    categoriesToShow = DEFAULT_CATEGORIES.slice(0, 4);
                  }
                  
                  return categoriesToShow.map((category) => (
                    <View key={category.id} className="w-1/5 p-1">
                      <CategoryItem
                        id={category.id}
                        name={t(`categories.${category.name.toLowerCase()}`, { defaultValue: category.name })}
                        icon={category.icon}
                        color={category.color}
                        isSelected={selectedCategory === category.id}
                        onPress={setSelectedCategory}
                        variant="grid"
                        size="medium"
                      />
                    </View>
                  ));
                })()}
                
                {/* Other button */}
                <View className="w-1/5 p-1">
                  <TouchableOpacity
                    className="items-center p-2"
                    onPress={() => setIsCategoryModalVisible(true)}>
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-2">
                      <Feather name="plus" size={20} color="#666" />
                    </View>
                    <Text className="text-sm font-medium text-center text-black">
                      {t('categories.other')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {errors.category && (
              <Text className="error-text mt-2 text-sm text-red-500">{errors.category}</Text>
            )}

            {/* Note */}
            <View>
              <View className="flex-row items-center justify-between">
                <Text className="input-label text-base font-medium text-black">
                  {t('expense.note')}
                </Text>
                <Text
                  className={`text-sm ${note.length > 3000 ? 'text-red-500' : 'text-gray-500'}`}>
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
                <Text className="error-text mt-1 text-sm text-red-500">{errors.note}</Text>
              )}
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
      </View>

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

      {/* Category Selection Modal */}
      <CategoryModel
        visible={isCategoryModalVisible}
        onClose={() => setIsCategoryModalVisible(false)}
        onCategorySelect={setSelectedCategory}
        selectedCategory={selectedCategory}
        title={t('expense.selectCategory')}
      />

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
