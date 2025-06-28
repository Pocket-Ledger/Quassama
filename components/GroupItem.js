import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRTL } from 'hooks/useRTL'; // Import RTL hook

const GroupItem = ({ group, onPress, onStarPress, isRTL: propIsRTL }) => {
  const { isRTL: hookIsRTL, getFlexDirection, getTextAlign, getMargin, getPadding } = useRTL();

  // Use prop RTL if provided, otherwise use hook
  const isRTL = propIsRTL !== undefined ? propIsRTL : hookIsRTL;

  return (
    <TouchableOpacity
      className={`mb-4 h-[123px] ${getFlexDirection()} items-center justify-between rounded-xl border border-gray-100 bg-white p-4`}
      onPress={() => onPress(group)}>
      <View className={`flex-1 ${getFlexDirection()} items-center`}>
        {/* Group Members */}
        <View className="h-full flex-1 justify-between">
          <Text className={`text-[20px] font-medium text-black ${getTextAlign('left')}`}>
            {group.name}
          </Text>

          {/* Members Avatars */}
          <View className={`${getMargin('right', '4')} ${getFlexDirection()}`}>
            {group.members
              .filter((member) => typeof member === 'object' && member !== null)
              .map((member, index) => (
                <View
                  key={index}
                  className={`h-10 w-10 items-center justify-center rounded-full border-2 border-white ${
                    index > 0 ? (isRTL ? '-mr-2' : '-ml-2') : ''
                  }`}
                  style={{ backgroundColor: member.color }}>
                  <Text className="font-dmsans-bold text-sm text-white">{member.initial}</Text>
                </View>
              ))}
            {group.additionalMembers > 0 && (
              <View
                className={`${isRTL ? '-mr-2' : '-ml-2'} h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-300`}>
                <Text className="font-dmsans-bold text-xs text-gray-600">
                  +{group.additionalMembers}
                </Text>
              </View>
            )}
          </View>

          <Text className={`font-dmsans-bold text-red-500 ${getTextAlign('left')}`}>
            {group.amount}
          </Text>
        </View>
      </View>

      {/* Right Side Info */}
      <View className={`h-full flex-col items-${isRTL ? 'start' : 'end'} justify-between`}>
        <TouchableOpacity onPress={() => onStarPress(group.id)}>
          <Feather
            name="star"
            size={20}
            color={group.isStarred ? '#FFCC00' : '#E5E5E5'}
            fill={group.isStarred ? '#FFCC00' : 'none'}
          />
        </TouchableOpacity>
        <View className={`items-${isRTL ? 'start' : 'end'}`}>
          <Text className={`text-gray-500 ${getTextAlign('right')}`}>
            {group.lastExpense} - {group.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default GroupItem;
