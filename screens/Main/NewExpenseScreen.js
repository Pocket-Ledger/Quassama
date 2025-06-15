// NewExpenseScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

import Expense from 'models/expense/Expense';
import Group from 'models/group/group';
import CustomAlert from 'components/CustomALert';
import { useAlert } from 'hooks/useAlert';
import CategoryList from 'components/CategoryList';
import { DEFAULT_CATEGORIES } from 'constants/category';
import Header from 'components/Header';

const NewExpenseScreen = () => {
  const navigation = useNavigation();
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
            list = fetched.map(g => ({
              id: g.id,
              name: g.name,
              memberCount: g.members?.length ?? 1,
            }));
          } else {
            // default personal group
            list = [{
              id: `personal_${userId}`,
              name: 'Personal',
              memberCount: 1,
            }];
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
      return () => { mounted = false; };
    }, [userId])
  );

  const validateForm = () => {
    const newErrors = {};
    if (!expenseName.trim()) newErrors.expenseName = 'Expense name is required';
    if (!amount.trim()) newErrors.amount = 'Amount is required';
    else if (isNaN(amount) || parseFloat(amount) <= 0) newErrors.amount = 'Please enter a valid amount';
    if (!selectedCategory) newErrors.category = 'Please select a category';
    if (!selectedGroup) newErrors.group = 'Please select a group';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddExpense = async () => {
  if (!validateForm()) return;

  setIsSaving(true);
    try {
      const expense = new Expense(
        expenseName.trim(),   // title
        amount.trim(),        // amount
        selectedCategory,     // category
        note.trim(),          // note/description
        selectedGroup         // group_id
      );
      await expense.save();

      console.log('Expense saved successfully:', expense);

      showSuccess('Success', 'Your expense was added successfully!', () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error saving expense:', error);
      showError('Error', error.message || 'Failed to save expense. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId);
    setIsGroupModalVisible(false);
    if (errors.group) {
      setErrors(prev => ({ ...prev, group: null }));
    }
  };

  const selectedGroupData = groups.find(g => g.id === selectedGroup);

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4"
      onPress={() => handleGroupSelect(item.id)}
    >
      <View>
        <Text className="text-base font-medium text-black">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.memberCount} members</Text>
      </View>
      <View className="h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300">
        {selectedGroup === item.id && <View className="h-3 w-3 rounded-full bg-primary" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <Header title="Add New Expense" />

        <View className="flex-1 gap-6 px-4">
          {/* Expense Name */}
          <View className="input-group">
            <Text className="input-label text-base font-medium text-black">Expense Name</Text>
            <View className="input-container">
              <TextInput
                className={`input-field rounded-lg border px-4 py-4 text-black ${
                  errors.expenseName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="T9edia"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={expenseName}
                onChangeText={text => {
                  setExpenseName(text);
                  if (errors.expenseName) setErrors(prev => ({ ...prev, expenseName: null }));
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
            <Text className="input-label text-base font-medium text-black">Amount</Text>
            <View className="input-container relative">
              <TextInput
                className={`input-field rounded-lg border px-4 py-4 pr-16 text-black ${
                  errors.amount ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="250"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={amount}
                onChangeText={text => {
                  setAmount(text);
                  if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
                }}
                keyboardType="numeric"
              />
              <Text className="absolute right-4 top-4 text-base text-black">MAD</Text>
            </View>
            {errors.amount && (
              <Text className="error-text mt-1 text-sm text-red-500">{errors.amount}</Text>
            )}
          </View>

          {/* Group Selection */}
          <View className="input-group">
            <Text className="input-label text-base font-medium text-black">Group</Text>
            <TouchableOpacity
              className={`input-container rounded-lg border px-4 py-4 ${
                errors.group ? 'border-red-500' : 'border-gray-200'
              }`}
              onPress={() => setIsGroupModalVisible(true)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  {selectedGroupData ? (
                    <View className="flex flex-row justify-between pr-2">
                      <Text className="text-base text-black">{selectedGroupData.name}</Text>
                      <Text className="text-sm text-gray-500">
                        {selectedGroupData.memberCount} members
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-base text-gray-400">Select a group</Text>
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
            title="Category"
          />
          {errors.category && (
            <Text className="mt-2 text-sm text-red-500 error-text">{errors.category}</Text>
          )}

          {/* Note */}
          <View>
            <Text className="input-label text-base font-medium text-black">Note</Text>
            <TextInput
              className="input-field h-24 rounded-lg border border-gray-200 px-4 py-4 text-black"
              placeholder="Add description here"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
            />
          </View>

          {/* Add Expense Button */}
          <TouchableOpacity
            className="btn-primary mb-8 rounded-lg bg-primary py-4"
            onPress={handleAddExpense}
            disabled={isSaving}
          >
            <Text className="btn-primary-text text-center text-base font-semibold text-white">
              {isSaving ? 'Adding...' : 'Add Expense'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Group Selection Modal */}
      <Modal
        visible={isGroupModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsGroupModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1">
            <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
              <Text className="text-lg font-semibold text-black">Select Group</Text>
              <TouchableOpacity onPress={() => setIsGroupModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={groups}
              renderItem={renderGroupItem}
              keyExtractor={item => item.id}
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
