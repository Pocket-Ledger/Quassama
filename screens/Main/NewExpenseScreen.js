import React, { useState } from 'react';
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
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { BackButton } from 'components/BackButton';
import { useNavigation } from '@react-navigation/native';
import Expense from 'models/expense/Expense';
import CustomAlert from 'components/CustomALert';
import { useAlert } from 'hooks/useAlert';
import 'firebase/compat/auth';

const NewExpenseScreen = () => {
  const navigation = useNavigation();
  const { alertConfig, hideAlert, showSuccess, showError } = useAlert(); // Use the hook

  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);

  const categories = [
    { id: 'shopping', name: 'Shopping', icon: 'shopping-cart', color: '#2979FF' },
    { id: 'internet', name: 'Internet', icon: 'wifi', color: '#2979FF' },
    { id: 'cleaning', name: 'Cleaning', icon: 'check-circle', color: '#2979FF' },
    { id: 'rent', name: 'Rent', icon: 'home', color: '#2979FF' },
    { id: 'other', name: 'Other', icon: 'plus', color: '#2979FF' },
  ];

  const groups = [
    { id: 'vacation_tager', name: 'Vacation tager', memberCount: 12 },
    { id: 'family_expenses', name: 'Family Expenses', memberCount: 5 },
    { id: 'work_team', name: 'Work Team', memberCount: 8 },
    { id: 'friends_trip', name: 'Friends Trip', memberCount: 6 },
    { id: 'apartment_mates', name: 'Apartment Mates', memberCount: 4 },
    { id: 'gym_buddies', name: 'Gym Buddies', memberCount: 3 },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!expenseName.trim()) {
      newErrors.expenseName = 'Expense name is required';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
    }

    if (!selectedGroup) {
      newErrors.group = 'Please select a group';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddExpense = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const expense = new Expense(
        expenseName.trim(),
        amount.trim(),
        selectedCategory,
        note.trim(),
        selectedGroup
      );

      const newDocId = await expense.save();

      // Show custom success alert
      showSuccess('Success', 'Your expense was added successfully!', () => {
        hideAlert();
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error saving expense:', error);

      // Show custom error alert
      showError('Error', error.message || 'Failed to save expense. Please try again.');
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

  const selectedGroupData = groups.find((group) => group.id === selectedGroup);

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between border-b border-gray-100 px-4 py-4"
      onPress={() => handleGroupSelect(item.id)}>
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
        className="container "
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6 flex flex-row items-center justify-start px-4 pb-4">
          <BackButton />
          <Text className="ml-12 mt-2 font-dmsans-bold text-xl text-black ">Add New Expense</Text>
        </View>

        <View className="flex-1 gap-6 px-4">
          {/* Expense Name */}
          <View className="input-group ">
            <Text className="input-label text-base font-medium text-black">Expense Name</Text>
            <View className="input-container">
              <TextInput
                className={`input-field rounded-lg border  px-4 py-4 text-black ${
                  errors.expenseName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="T9edia"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={expenseName}
                onChangeText={(text) => {
                  setExpenseName(text);
                  if (errors.expenseName) {
                    setErrors((prev) => ({ ...prev, expenseName: null }));
                  }
                }}
                autoCapitalize="words"
              />
            </View>
            {errors.expenseName && (
              <Text className="error-text mt-1 text-sm text-red-500">{errors.expenseName}</Text>
            )}
          </View>

          {/* Amount */}
          <View className="input-group ">
            <Text className="input-label text-base font-medium text-black">Amount</Text>
            <View className="input-container relative">
              <TextInput
                className={`input-field rounded-lg border  px-4 py-4 pr-16 text-black ${
                  errors.amount ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="250"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (errors.amount) {
                    setErrors((prev) => ({ ...prev, amount: null }));
                  }
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
              onPress={() => setIsGroupModalVisible(true)}>
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
          <View className="">
            <Text className="input-label mb-3 text-base font-medium text-black">Category</Text>
            <View className="flex-row flex-wrap justify-between gap-1">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className={`h-78px w-[61px] items-center rounded-lg  p-1`}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    if (errors.category) {
                      setErrors((prev) => ({ ...prev, category: null }));
                    }
                  }}>
                  <View
                    className={`mb-2 h-12 w-12 items-center justify-center rounded-full ${
                      selectedCategory === category.id ? 'bg-primary-50' : 'bg-primary-50'
                    }`}>
                    <Feather
                      name={category.icon === 'plus' ? 'plus' : category.icon}
                      size={20}
                      color={selectedCategory === category.id ? '#2979FF' : '#2979FF'}
                    />
                  </View>
                  <Text
                    className={`text-sm font-medium ${
                      selectedCategory === category.id ? 'text-primary' : 'text-gray-600'
                    }`}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.category && (
              <Text className="error-text mt-2 text-sm text-red-500">{errors.category}</Text>
            )}
          </View>

          {/* Note */}
          <View className="">
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
            disabled={isSaving}>
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
        onRequestClose={() => setIsGroupModalVisible(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
              <Text className="text-lg font-semibold text-black">Select Group</Text>
              <TouchableOpacity onPress={() => setIsGroupModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Groups List */}
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
