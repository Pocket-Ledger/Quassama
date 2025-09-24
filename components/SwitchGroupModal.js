import React, { useCallback } from 'react';
import { View, Text, Modal, Pressable, ScrollView, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const SwitchGroupModal = ({
  visible,
  onClose,
  groups,
  selectedGroupId,
  onGroupSelect,
  title = '',
  showCreateNewOption = false,
  onCreateNew = null,
  onRefresh = null, // new prop
  refreshing = false, // new prop
}) => {
  const { t } = useTranslation();

  const handleGroupSelection = (groupId, groupName) => {
    onGroupSelect(groupId, groupName);
    onClose();
  };

  // Use translation for title if not provided
  const modalTitle = title || t('group.selectGroup');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="max-h-[70%] min-w-[280px] max-w-[90%] rounded-xl bg-white p-5 shadow-lg dark:bg-slate-800">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-dmsans-bold text-lg text-gray-800 dark:text-white">{modalTitle}</Text>
            <Pressable onPress={onClose} className="rounded p-1 active:bg-gray-100 dark:active:bg-gray-300">
              <Feather name="x" size={20} color="#666" />
            </Pressable>
          </View>

          {/* Groups List */}
          <ScrollView
            className="max-h-[300px]"
            refreshControl={
              onRefresh ? (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2979FF"]} />
              ) : undefined
            }
          >
            {groups.length === 0 ? (
              <View className="items-center py-5">
                <Feather name="users" size={32} color="#ccc" />
                <Text className="mt-2 text-sm text-gray-400 dark:text-gray-300">{t('group.noGroupsAvailable')}</Text>
              </View>
            ) : (
              groups.map((group) => (
                <Pressable
                  key={group.id}
                  onPress={() => handleGroupSelection(group.id, group.name)}
                  className={`mb-1 rounded-lg px-3 py-3 ${
                    selectedGroupId === group.id
                      ? 'border border-primary bg-blue-50 dark:bg-blue-900'
                      : 'active:bg-gray-50 dark:active:bg-gray-300'
                  }`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        className={`text-base ${
                          selectedGroupId === group.id
                            ? 'font-semibold text-primary'
                            : 'font-normal text-gray-800 dark:text-gray-300'
                        }`}>
                        {group.name}
                      </Text>
                      {group.memberCount && (
                        <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {t('group.memberCount', { count: group.memberCount })}
                        </Text>
                      )}
                    </View>
                    {selectedGroupId === group.id && (
                      <Feather name="check" size={16} color="#2979FF" />
                    )}
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>

          {/* Create New Group Option */}
          {showCreateNewOption && onCreateNew && (
            <>
              <View className="my-3 h-px bg-gray-200 dark:bg-gray-600" />
              <Pressable
                onPress={() => {
                  onCreateNew();
                  onClose();
                }}
                className="flex-row items-center rounded-lg px-3 py-3 active:bg-gray-50 dark:active:bg-gray-300">
                <Feather name="plus" size={16} color="#2979FF" className="mr-2" />
                <Text className="ml-2 text-base font-medium text-primary">
                  {t('group.createNewGroup')}
                </Text>
              </Pressable>
            </>
          )}

          {/* Cancel Button */}
          <View className="my-3 h-px bg-gray-200 dark:bg-gray-600" />
          <Pressable onPress={onClose} className="items-center rounded-lg py-3 active:bg-red-50 dark:active:bg-red-900">
            <Text className="text-base font-medium text-red-500">{t('common.cancel')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default SwitchGroupModal;
