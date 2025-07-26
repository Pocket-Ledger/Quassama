import React from 'react';
import { View, Text } from 'react-native';
import { BackButton } from './BackButton';
import PlusIconButton from './PlusIconButton';

const Header = ({ title, showIcon = false, route, rightIcon }) => {
  const hasRightContent = showIcon || rightIcon;

  return (
    <View
      className={`items mb-6 flex flex-row items-center ${
        hasRightContent ? 'justify-between' : 'justify-start'
      }`}>
      <View className="flex-row items-center gap-2 ml-2">
        <BackButton />
        <Text className="text-xl text-black font-dmsans-bold">{title}</Text>
      </View>

      {/* Right side content */}
      {hasRightContent && (
        <View>{rightIcon ? rightIcon : showIcon && <PlusIconButton route={route} />}</View>
      )}
    </View>
  );
};

export default Header;
