// SplitWithSection.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const SplitWithSection = ({
  selectedGroup,
  groupMembers = [],
  splits,
  onSplitsChange,
  totalAmount,
  currentUserId,
  error,
}) => {
  const { t } = useTranslation();
  const [isAddPersonModalVisible, setIsAddPersonModalVisible] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');

  // Function to calculate current user's amount based on others
  const calculateCurrentUserAmount = (splitsObj) => {
    const total = parseFloat(totalAmount) || 0;
    if (total === 0) return '0';

    // Calculate sum of all other users' amounts
    let othersTotal = 0;
    Object.values(splitsObj).forEach((person) => {
      if (!person.isCurrentUser) {
        const amount = parseFloat(person.amount) || 0;
        othersTotal += amount;
      }
    });

    // Current user gets the remaining amount
    const currentUserAmount = Math.max(0, total - othersTotal);
    return currentUserAmount.toString();
  };

  // Initialize splits when group changes or members change
  useEffect(() => {
    if (
      groupMembers.length > 0 &&
      (!splits ||
        Object.keys(splits).length === 0 ||
        !groupMembers.every((member) => splits[member.user_id]))
    ) {
      const initialSplits = {};
      groupMembers.forEach((member) => {
        initialSplits[member.user_id] = {
          id: member.user_id,
          name: member.username,
          amount: '0',
          isCurrentUser: member.user_id === currentUserId,
        };
      });

      // Set current user amount to total if they're the only one
      const currentUserAmount = calculateCurrentUserAmount(initialSplits);
      if (initialSplits[currentUserId]) {
        initialSplits[currentUserId].amount = currentUserAmount;
      }

      onSplitsChange(initialSplits);
    }
  }, [groupMembers, currentUserId, splits, onSplitsChange, totalAmount]);

  // Auto-calculate current user amount when totalAmount changes
  useEffect(() => {
    if (splits && Object.keys(splits).length > 0 && totalAmount) {
      const currentUserAmount = calculateCurrentUserAmount(splits);
      if (splits[currentUserId] && splits[currentUserId].amount !== currentUserAmount) {
        const updatedSplits = {
          ...splits,
          [currentUserId]: {
            ...splits[currentUserId],
            amount: currentUserAmount,
          },
        };
        onSplitsChange(updatedSplits);
      }
    }
  }, [totalAmount, splits, currentUserId, onSplitsChange]);

  const handleSplitAmountChange = (personId, amount) => {
    // Don't allow editing current user's amount directly
    if (personId === currentUserId) return;

    const updatedSplits = {
      ...splits,
      [personId]: {
        ...splits[personId],
        amount: amount,
      },
    };

    // Auto-calculate current user's amount
    const currentUserAmount = calculateCurrentUserAmount(updatedSplits);
    updatedSplits[currentUserId] = {
      ...updatedSplits[currentUserId],
      amount: currentUserAmount,
    };

    onSplitsChange(updatedSplits);
  };

  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;

    const newPersonId = `temp_${Date.now()}`;
    const updatedSplits = {
      ...splits,
      [newPersonId]: {
        id: newPersonId,
        name: newPersonName.trim(),
        amount: '0',
        isCurrentUser: false,
        isTemporary: true,
      },
    };

    // Recalculate current user's amount
    const currentUserAmount = calculateCurrentUserAmount(updatedSplits);
    updatedSplits[currentUserId] = {
      ...updatedSplits[currentUserId],
      amount: currentUserAmount,
    };

    onSplitsChange(updatedSplits);
    setNewPersonName('');
    setIsAddPersonModalVisible(false);
  };

  const handleRemovePerson = (personId) => {
    if (splits[personId]?.isCurrentUser) return; // Can't remove current user

    const updatedSplits = { ...splits };
    delete updatedSplits[personId];

    // Recalculate current user's amount after removing person
    const currentUserAmount = calculateCurrentUserAmount(updatedSplits);
    updatedSplits[currentUserId] = {
      ...updatedSplits[currentUserId],
      amount: currentUserAmount,
    };

    onSplitsChange(updatedSplits);
  };

  const renderPersonItem = ({ item }) => {
    const person = item;
    return (
      <View className="flex-row items-center justify-between py-3">
        <View className="flex-1 flex-row items-center">
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              person.isCurrentUser ? 'bg-primary' : 'bg-gray-300'
            }`}>
            <Text
              className={`font-semibold ${person.isCurrentUser ? 'text-white' : 'text-gray-700'}`}>
              {person.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-medium text-black">{person.name}</Text>
            {person.isCurrentUser && (
              <Text className="text-xs text-gray-500">{t('expense.split.you')}</Text>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          <TextInput
            className={`w-20 rounded-lg border px-3 py-2 text-center text-black ${
              error ? 'border-red-500' : 'border-gray-200'
            } ${person.isCurrentUser ? 'bg-gray-100' : 'bg-white'}`}
            value={person.amount}
            onChangeText={(text) => handleSplitAmountChange(person.id, text)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            editable={!person.isCurrentUser}
          />

          {!person.isCurrentUser && person.isTemporary && (
            <TouchableOpacity className="ml-2 p-1" onPress={() => handleRemovePerson(person.id)}>
              <Feather name="x" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!selectedGroup) {
    return (
      <View className="input-group">
        <Text className="input-label text-base font-medium text-gray-400">
          {t('expense.split.selectGroupFirst')}
        </Text>
      </View>
    );
  }

  return (
    <View className="input-group">
      <View className="flex-row items-center justify-between">
        <Text className="input-label text-base font-medium text-black">
          {t('expense.split.title')}
        </Text>
        {totalAmount && <Text className="text-sm text-gray-600">Total: {totalAmount}</Text>}
      </View>

      <View className="rounded-lg border border-gray-200 bg-white p-4">
        {splits && Object.keys(splits).length > 0 ? (
          <FlatList
            data={Object.values(splits)}
            renderItem={renderPersonItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View className="h-px bg-gray-100" />}
          />
        ) : (
          <Text className="text-center text-gray-500">{t('expense.split.noMembers')}</Text>
        )}

        {/* <TouchableOpacity
          className="flex-row items-center justify-center py-3 mt-4 border border-gray-300 border-dashed rounded-lg"
          onPress={() => setIsAddPersonModalVisible(true)}>
          <Feather name="plus" size={20} color="#007AFF" />
          <Text className="ml-2 font-medium text-primary">{t('expense.split.addPerson')}</Text>
        </TouchableOpacity> */}
      </View>

      {error && <Text className="error-text mt-1 text-sm text-red-500">{error}</Text>}

      {/* Add Person Modal */}
      <Modal
        visible={isAddPersonModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddPersonModalVisible(false)}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1">
            <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
              <TouchableOpacity onPress={() => setIsAddPersonModalVisible(false)}>
                <Text className="font-medium text-primary">{t('common.cancel')}</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-black">
                {t('expense.split.addPerson')}
              </Text>
              <TouchableOpacity onPress={handleAddPerson} disabled={!newPersonName.trim()}>
                <Text
                  className={`font-medium ${
                    newPersonName.trim() ? 'text-primary' : 'text-gray-400'
                  }`}>
                  {t('common.add')}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <Text className="mb-2 font-medium text-black">{t('expense.split.personName')}</Text>
              <TextInput
                className="rounded-lg border border-gray-200 px-4 py-3 text-black"
                placeholder={t('expense.split.enterPersonName')}
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
                value={newPersonName}
                onChangeText={setNewPersonName}
                autoCapitalize="words"
                autoFocus={true}
                onSubmitEditing={handleAddPerson}
                returnKeyType="done"
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default SplitWithSection;
