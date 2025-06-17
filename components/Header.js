import React from 'react';
import { View, Text } from 'react-native';
import { BackButton } from './BackButton';
import PlusIconButton from './PlusIconButton';

const Header = ({ title, showIcon = false, route }) => {
  return (
    <View
      className={`items mb-6 flex flex-row items-center     ${
        showIcon ? 'justify-between' : 'justify-start'
      }`}>
      <View className="flex-row items-end gap-2">
        <BackButton />
        <Text className="font-dmsans-bold text-xl text-black">{title}</Text>
      </View>
      {showIcon && <PlusIconButton route={route} />}
    </View>
  );
};

export default Header;
