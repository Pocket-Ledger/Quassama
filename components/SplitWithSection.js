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
  isSplitEnabled = false,
  onSplitEnabledChange,
}) => {
  const { t } = useTranslation();
  const [isAddPersonModalVisible, setIsAddPersonModalVisible] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [isSplitSheetVisible, setIsSplitSheetVisible] = useState(false);
  const [tempSplits, setTempSplits] = useState({});

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
      isSplitEnabled &&
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
  }, [groupMembers, currentUserId, splits, onSplitsChange, totalAmount, isSplitEnabled]);

  // Auto-calculate current user amount when totalAmount changes
  useEffect(() => {
    if (splits && Object.keys(splits).length > 0 && totalAmount && isSplitEnabled) {
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
  }, [totalAmount, splits, currentUserId, onSplitsChange, isSplitEnabled]);

  const handleSplitAmountChange = (personId, amount) => {
    // Don't allow editing current user's amount directly
    if (personId === currentUserId) return;

    const updatedSplits = {
      ...tempSplits,
      [personId]: {
        ...tempSplits[personId],
        amount: amount,
      },
    };

    // Auto-calculate current user's amount
    const currentUserAmount = calculateCurrentUserAmount(updatedSplits);
    updatedSplits[currentUserId] = {
      ...updatedSplits[currentUserId],
      amount: currentUserAmount,
    };

    setTempSplits(updatedSplits);
  };

  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;

    const newPersonId = `temp_${Date.now()}`;
    const updatedSplits = {
      ...tempSplits,
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

    setTempSplits(updatedSplits);
    setNewPersonName('');
    setIsAddPersonModalVisible(false);
  };

  const handleRemovePerson = (personId) => {
    if (tempSplits[personId]?.isCurrentUser) return; // Can't remove current user

    const updatedSplits = { ...tempSplits };
    delete updatedSplits[personId];

    // Recalculate current user's amount after removing person
    const currentUserAmount = calculateCurrentUserAmount(updatedSplits);
    updatedSplits[currentUserId] = {
      ...updatedSplits[currentUserId],
      amount: currentUserAmount,
    };

    setTempSplits(updatedSplits);
  };

  const handleCheckboxChange = () => {
    if (isSplitEnabled) {
      // If disabling split, clear the splits data
      onSplitsChange({});
      onSplitEnabledChange(false);
    } else {
      // Check if amount is entered before allowing split
      if (!totalAmount || parseFloat(totalAmount) <= 0) {
        Alert.alert(
          t('expense.split.amountRequired'),
          t('expense.split.enterAmountFirst')
        );
        return;
      }
      // If enabling split, open the sheet
      openSplitSheet();
    }
  };

  const openSplitSheet = () => {
    if (!selectedGroup) {
      Alert.alert(t('expense.split.selectGroupFirst'));
      return;
    }

    // If splits already exist, use them as temp splits, otherwise initialize
    if (splits && Object.keys(splits).length > 0) {
      setTempSplits({ ...splits });
    } else {
      // Initialize temp splits
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

      setTempSplits(initialSplits);
    }

    setIsSplitSheetVisible(true);
  };

  const handleSplitSheetConfirm = () => {
    // Validate that splits add up to total amount
    const total = parseFloat(totalAmount) || 0;
    const splitsTotal = Object.values(tempSplits).reduce((sum, person) => {
      return sum + (parseFloat(person.amount) || 0);
    }, 0);

    if (Math.abs(splitsTotal - total) > 0.01) {
      Alert.alert(
        t('expense.split.invalidSplit'),
        t('expense.split.splitMustEqualTotal', {
          splitTotal: splitsTotal.toFixed(2),
          expenseTotal: total.toFixed(2)
        })
      );
      return;
    }

    onSplitsChange(tempSplits);
    onSplitEnabledChange(true);
    setIsSplitSheetVisible(false);
  };

  const handleSplitSheetCancel = () => {
    setTempSplits({});
    setIsSplitSheetVisible(false);
  };

  const renderPersonItem = ({ item, isSheet = false }) => {
    const person = item;
    const splitsToUse = isSheet ? tempSplits : splits;

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
            onChangeText={(text) => (isSheet ? handleSplitAmountChange(person.id, text) : null)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
            editable={!person.isCurrentUser && isSheet}
          />

          {!person.isCurrentUser && person.isTemporary && isSheet && (
            <TouchableOpacity className="ml-2 p-1" onPress={() => handleRemovePerson(person.id)}>
              <Feather name="x" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderSplitSummary = () => {
    if (!isSplitEnabled || !splits || Object.keys(splits).length === 0) return null;

    return (
      <TouchableOpacity
        className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
        onPress={openSplitSheet}
        activeOpacity={0.7}>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm font-medium text-gray-700">{t('common.summary')}</Text>
          <View className="flex-row items-center">
            <Text className="mr-1 text-xs text-gray-500">{t('expense.split.tapToEdit')}</Text>
            <Feather name="edit-2" size={12} color="#666" />
          </View>
        </View>
        {Object.values(splits).map((person) => (
          <View key={person.id} className="flex-row justify-between py-1">
            <Text className="text-sm text-gray-600">
              {person.name} {person.isCurrentUser ? `(${t('expense.split.you')})` : ''}
            </Text>
            <Text className="text-sm font-medium text-gray-800">
              {person.amount} {t('common.currency')}
            </Text>
          </View>
        ))}
      </TouchableOpacity>
    );
  };

  return (
    <View className="input-group">
      {/* Split With Checkbox */}
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-medium text-black">
          {t('expense.split.splitWith')}
          {isSplitEnabled && (
            <Text className="text-sm font-normal text-gray-500">
              {' '}
              ({Object.keys(splits).length} {t('expense.split.people')})
            </Text>
          )}
        </Text>
        <TouchableOpacity className="flex-row items-center" onPress={handleCheckboxChange}>
          <View
            className={`mr-2 h-5 w-5 items-center justify-center rounded border-2 ${
              isSplitEnabled ? 'border-primary bg-primary' : 'border-gray-300'
            } ${!totalAmount || parseFloat(totalAmount) <= 0 ? 'opacity-50' : ''}`}>
            {isSplitEnabled && <Feather name="check" size={14} color="white" />}
          </View>
          <Text
            className={`text-sm text-gray-600 ${!totalAmount || parseFloat(totalAmount) <= 0 ? 'opacity-50' : ''}`}>
            {t('expense.split.enableSplit')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Split Summary - shown when split is enabled and data exists */}
      {renderSplitSummary()}

      {error && <Text className="error-text mt-1 text-sm text-red-500">{error}</Text>}

      {/* Split Sheet Modal */}
      <Modal
        visible={isSplitSheetVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleSplitSheetCancel}>
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4">
              <TouchableOpacity onPress={handleSplitSheetCancel}>
                <Text className="font-medium text-red-500">{t('common.cancel')}</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-black">
                {isSplitEnabled ? t('expense.split.editSplit') : t('expense.split.title')}
              </Text>
              <TouchableOpacity onPress={handleSplitSheetConfirm}>
                <Text className="font-medium text-primary">{t('common.done')}</Text>
              </TouchableOpacity>
            </View>

            {/* Total Amount Display */}
            {totalAmount && (
              <View className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                <Text className="text-center text-sm text-gray-600">
                  {t('expense.split.totalAmount')}: {totalAmount} {t('common.currency')}
                </Text>
              </View>
            )}

            {/* Split List */}
            <View className="flex-1 px-4">
              {tempSplits && Object.keys(tempSplits).length > 0 ? (
                <FlatList
                  data={Object.values(tempSplits)}
                  renderItem={({ item }) => renderPersonItem({ item, isSheet: true })}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={true}
                  ItemSeparatorComponent={() => <View className="h-px bg-gray-100" />}
                  contentContainerStyle={{ paddingTop: 16 }}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Text className="text-center text-gray-500">{t('expense.split.noMembers')}</Text>
                </View>
              )}

              {/* Add Person Button */}
              {/* <TouchableOpacity
                className="flex-row items-center justify-center py-3 mt-4 border border-gray-300 border-dashed rounded-lg"
                onPress={() => setIsAddPersonModalVisible(true)}>
                <Feather name="plus" size={20} color="#007AFF" />
                <Text className="ml-2 font-medium text-primary">
                  {t('expense.split.addPerson')}
                </Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </SafeAreaView>
      </Modal>

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
