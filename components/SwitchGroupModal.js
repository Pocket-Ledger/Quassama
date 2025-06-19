import React from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const SwitchGroupModal = ({
  visible,
  onClose,
  groups,
  selectedGroupId,
  onGroupSelect,
  title = 'Select Group',
  showCreateNewOption = false,
  onCreateNew = null,
}) => {
  const handleGroupSelection = (groupId, groupName) => {
    onGroupSelect(groupId, groupName);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="max-h-[70%] min-w-[280px] max-w-[90%] rounded-xl bg-white p-5 shadow-lg">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-dmsans-bold text-lg text-gray-800">{title}</Text>
            <Pressable onPress={onClose} className="rounded p-1 active:bg-gray-100">
              <Feather name="x" size={20} color="#666" />
            </Pressable>
          </View>

          {/* Groups List */}
          <ScrollView className="max-h-[300px]">
            {groups.length === 0 ? (
              <View className="items-center py-5">
                <Feather name="users" size={32} color="#ccc" />
                <Text className="mt-2 text-sm text-gray-400">No groups available</Text>
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
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text
                        className={`text-base ${
                          selectedGroupId === group.id
                            ? 'font-semibold text-primary'
                            : 'font-normal text-gray-800'
                        }`}>
                        {group.name}
                      </Text>
                      {group.memberCount && (
                        <Text className="mt-0.5 text-xs text-gray-500">
                          {group.memberCount} members
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
                className="flex-row items-center rounded-lg px-3 py-3 active:bg-gray-50">
                <Feather name="plus" size={16} color="#2979FF" className="mr-2" />
                <Text className="ml-2 text-base font-medium text-primary">Create New Group</Text>
              </Pressable>
            </>
          )}

          {/* Cancel Button */}
          <View className="my-3 h-px bg-gray-200" />
          <Pressable onPress={onClose} className="items-center rounded-lg py-3 active:bg-red-50">
            <Text className="text-base font-medium text-red-500">Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default SwitchGroupModal;
