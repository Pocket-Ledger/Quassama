import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from 'components/BackButton';
import CategorySelector from 'components/categories/CategorySelector';
import { EXPENSE_CATEGORIES } from 'config/categoriesConfig';
import Expense from 'models/expense/Expense';
import 'firebase/compat/auth';

const NewExpenseScreen = () => {
  const navigation = useNavigation();

  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: null }));
    }
  };

  const handleAddExpense = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const expense = new Expense(expenseName.trim(), amount.trim(), selectedCategory, note.trim());

      const newDocId = await expense.save();

      Alert.alert('Success', 'Expense saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', error.message || 'Failed to save expense');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="container"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="mb-6 flex flex-row items-center justify-start px-4 pb-4">
          <BackButton />
          <Text className="ml-12 mt-2 text-xl font-bold text-black">Add New Expense</Text>
        </View>

        <View className="flex-1 gap-6 px-4">
          {/* Expense Name */}
          <View className=" input-group">
            <Text className="input-label text-base font-medium text-black">Expense Name</Text>
            <View className="input-container">
              <TextInput
                className={`input-field rounded-lg border px-4  text-black  ${
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
          <View className="input-group">
            <Text className="input-label text-base font-medium text-black">Amount</Text>
            <View className="input-container relative">
              <TextInput
                className={`input-field rounded-lg border px-4  pr-16 text-black ${
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

          {/* Category Selector - Now using reusable component */}
          <CategorySelector
            categories={EXPENSE_CATEGORIES}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            title="Category"
            error={errors.category}
            size="medium"
            layout="grid"
          />

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
              {isSaving ? 'Saving...' : 'Add Expense'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NewExpenseScreen;
