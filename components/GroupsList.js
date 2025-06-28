import React from 'react';
import { ScrollView } from 'react-native';
import GroupItem from './GroupItem';

const GroupsList = ({
  groups,
  onGroupPress,
  onStarPress,
  showScrollIndicator = false,
  contentContainerStyle = { paddingBottom: 20 },
  isRTL, // Add RTL prop
}) => {
  return (
    <ScrollView
      className="flex-1 px-[10px]"
      showsVerticalScrollIndicator={showScrollIndicator}
      contentContainerStyle={contentContainerStyle}>
      {groups.map((group) => (
        <GroupItem
          key={group.id}
          group={group}
          onPress={onGroupPress}
          onStarPress={onStarPress}
          isRTL={isRTL} // Pass RTL prop to GroupItem
        />
      ))}
    </ScrollView>
  );
};

export default GroupsList;
