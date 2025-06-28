import React from 'react';
import { View, Text } from 'react-native';
import { BackButton } from './BackButton';
import PlusIconButton from './PlusIconButton';
import { useRTL } from 'hooks/useRTL';
import Logger from 'utils/looger';

const Header = ({ title, showIcon = false, route, rightIcon }) => {
  const { isRTL, getFlexDirection, getTextAlign } = useRTL();
  const hasRightContent = showIcon || rightIcon;
  Logger.info(isRTL);
  return (
    <View
      className={`mb-6 flex items-center  ${getFlexDirection()} ${
        hasRightContent ? 'justify-between' : 'justify-start'
      }`}>
      {/* Back button and title container */}
      <View className={`items-center gap-2 ${getFlexDirection()}`}>
        <BackButton />
        {title && (
          <Text className={`font-dmsans-bold text-xl text-black ${getTextAlign('left')}`}>
            {title}
          </Text>
        )}
      </View>

      {/* Right side content */}
      {hasRightContent && (
        <View>{rightIcon ? rightIcon : showIcon && <PlusIconButton route={route} />}</View>
      )}
    </View>
  );
};

export default Header;
