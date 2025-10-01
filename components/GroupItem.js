import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';

const GroupItem = ({ group, onPress, onStarPress }) => {
  return (
    <TouchableOpacity
      className="mb-4 h-[123px] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white p-4 dark:bg-slate-700 dark:border-gray-400"
      onPress={() => onPress(group)}>
      <View className="flex-row items-center flex-1">
        {/* Group Members */}
        <View className="justify-between flex-1 h-full">
          <Text className="text-[20px] font-medium text-black dark:text-white">
            {group.name || 'Unnamed Group'}
          </Text>

          {/* Members Avatars */}
          <View className="flex-row mr-4">
            {group.members
              .filter((member) => typeof member === 'object' && member !== null)
              .map((member, index) => (
                <View
                  key={index}
                  className={`h-10 w-10 items-center justify-center rounded-full border-2 border-white dark:border-gray-400 ${
                    index > 0 ? '-ml-2' : ''
                  }`}
                  style={{ backgroundColor: member.color }}>
                  <Text className="text-sm text-white font-dmsans-bold">
                    {member.initial || '?'}
                  </Text>
                </View>
              ))}
            {group.additionalMembers > 0 && (
              <View className="items-center justify-center w-10 h-10 -ml-2 bg-gray-300 border-2 border-white rounded-full">
                <Text className="text-xs text-gray-600 font-dmsans-bold">
                  +{group.additionalMembers}
                </Text>
              </View>
            )}
          </View>

          <Text className="text-red-500 font-dmsans-bold">{group.amount || '0'}</Text>
        </View>
      </View>

      {/* Right Side Info */}
      <View className="flex-col items-end justify-between h-full">
        <TouchableOpacity onPress={() => onStarPress(group.id)}>
          <AntDesign
            name={group.isStarred ? 'star' : 'star'}
            size={20}
            color={group.isStarred ? '#FFCC00' : '#E5E5E5'}
          />
        </TouchableOpacity>
        {(!group.amount || group.amount <= 0) && (
          <View className="items-end">
            <Text className="text-gray-500">
              {group.lastExpense || ''}
              {group.lastExpense && group.time ? ' - ' : ''}
              {group.time || ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default GroupItem;
