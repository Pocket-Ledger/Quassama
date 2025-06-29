import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const GroupItem = ({ group, onPress, onStarPress }) => {
  return (
    <TouchableOpacity
      className="mb-4 h-[123px] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white p-4 "
      onPress={() => onPress(group)}>
      <View className="flex-1 flex-row items-center">
        {/* Group Members */}
        <View className="h-full flex-1 justify-between">
          <Text className="text-[20px] font-medium text-black">{group.name}</Text>

          {/* Members Avatars */}
          <View className="mr-4 flex-row">
            {group.members
              .filter((member) => typeof member === 'object' && member !== null)
              .map((member, index) => (
                <View
                  key={index}
                  className={`h-10 w-10 items-center justify-center rounded-full border-2 border-white ${
                    index > 0 ? '-ml-2' : ''
                  }`}
                  style={{ backgroundColor: member.color }}>
                  <Text className="font-dmsans-bold text-sm text-white">{member.initial}</Text>
                </View>
              ))}
            {group.additionalMembers > 0 && (
              <View className="-ml-2 h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-300">
                <Text className="font-dmsans-bold text-xs text-gray-600">
                  +{group.additionalMembers}
                </Text>
              </View>
            )}
          </View>

          <Text className="font-dmsans-bold text-red-500">{group.amount}</Text>
        </View>
      </View>

      {/* Right Side Info */}
      <View className="h-full flex-col items-end justify-between">
        <TouchableOpacity onPress={() => onStarPress(group.id)}>
          <Feather
            name="star"
            size={20}
            color={group.isStarred ? '#FFCC00' : '#E5E5E5'}
            fill={group.isStarred ? '#FFCC00' : 'none'}
          />
        </TouchableOpacity>
        {(!group.amount || group.amount <= 0) && (
          <View className="items-end">
            <Text className="text-gray-500">
              {group.lastExpense} - {group.time}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default GroupItem;
