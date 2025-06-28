import React, { useCallback } from 'react';
import { View, Text, Modal, Pressable, ScrollView, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRTL } from 'hooks/useRTL'; // Import RTL hook

const SwitchGroupModal = ({
  visible,
  onClose,
  groups,
  selectedGroupId,
  onGroupSelect,
  title = '',
  showCreateNewOption = false,
  onCreateNew = null,
  onRefresh = null,
  refreshing = false,
  isRTL: propIsRTL, // Optional RTL prop override
}) => {
  const { t } = useTranslation();
  const { isRTL: hookIsRTL, getFlexDirection, getTextAlign, getMargin, getPadding } = useRTL();

  // Use prop RTL if provided, otherwise use hook
  const isRTL = propIsRTL !== undefined ? propIsRTL : hookIsRTL;

  const handleGroupSelection = (groupId, groupName) => {
    onGroupSelect(groupId, groupName);
    onClose();
  };

  // Use translation for title if not provided
  const modalTitle = title || t('group.selectGroup');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="max-h-[70%] min-w-[280px] max-w-[90%] rounded-xl bg-white p-5 shadow-lg">
          {/* Header */}
          <View className={`mb-4 ${getFlexDirection()} items-center justify-between`}>
            <Text className={`font-dmsans-bold text-lg text-gray-800 ${getTextAlign('left')}`}>
              {modalTitle}
            </Text>
            <Pressable onPress={onClose} className="rounded p-1 active:bg-gray-100">
              <Feather name="x" size={20} color="#666" />
            </Pressable>
          </View>

          {/* Groups List */}
          <ScrollView
            className="max-h-[300px]"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#2979FF']}
                />
              ) : undefined
            }>
            {groups.length === 0 ? (
              <View className="items-center py-5">
                <Feather name="users" size={32} color="#ccc" />
                <Text className={`mt-2 text-sm text-gray-400 ${getTextAlign('center')}`}>
                  {t('group.noGroupsAvailable')}
                </Text>
              </View>
            ) : (
              groups.map((group) => (
                <Pressable
                  key={group.id}
                  onPress={() => handleGroupSelection(group.id, group.name)}
                  className={`mb-1 rounded-lg px-3 py-3 ${
                    selectedGroupId === group.id
                      ? 'border border-primary bg-blue-50'
                      : 'active:bg-gray-50'
                  }`}>
                  <View className={`${getFlexDirection()} items-center justify-between`}>
                    <View className="flex-1">
                      <Text
                        className={`text-base ${getTextAlign('left')} ${
                          selectedGroupId === group.id
                            ? 'font-semibold text-primary'
                            : 'font-normal text-gray-800'
                        }`}>
                        {group.name}
                      </Text>
                      {group.memberCount && (
                        <Text className={`mt-0.5 text-xs text-gray-500 ${getTextAlign('left')}`}>
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
              <View className="my-3 h-px bg-gray-200" />
              <Pressable
                onPress={() => {
                  onCreateNew();
                  onClose();
                }}
                className={`${getFlexDirection()} items-center rounded-lg px-3 py-3 active:bg-gray-50`}>
                <Feather name="plus" size={16} color="#2979FF" />
                <Text
                  className={`${getMargin('left', '2')} text-base font-medium text-primary ${getTextAlign('left')}`}>
                  {t('group.createNewGroup')}
                </Text>
              </Pressable>
            </>
          )}

          {/* Cancel Button */}
          <View className="my-3 h-px bg-gray-200" />
          <Pressable onPress={onClose} className="items-center rounded-lg py-3 active:bg-red-50">
            <Text className={`text-base font-medium text-red-500 ${getTextAlign('center')}`}>
              {t('common.cancel')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default SwitchGroupModal;
