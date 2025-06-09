import React from 'react';
import { View, Text } from 'react-native';
import { BackButton } from './BackButton';
import PlusIconButton from './PlusIconButton';

const Header = ({ title, showIcon = false, route }) => {
  return (
    <View
      className={`mb-6 flex flex-row items-center  px-4 pb-4 ${
        showIcon ? 'justify-between' : 'justify-start'
      }`}>
      <BackButton />
      <Text className="ml-12 font-dmsans-bold text-xl text-black">{title}</Text>
      {showIcon && <PlusIconButton route={route} />}
    </View>
  );
};

export default Header;
