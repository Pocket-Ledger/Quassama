// components/Logo.js
import React from 'react';
import { Image } from 'react-native';

export const Logo = ({ width, height }) => {
  return (
    <Image
      source={require('../assets/adaptive-icon.png')}
      resizeMode="fill"
      className={`
        ${width ? `w-[${width}px]` : 'w-[87px]'}
        ${height ? `h-[${height}px]` : 'h-[96px]'}
      `}
    />
  );
};
export const SmallLogo = ({ width, height }) => {
  return (
    <Image
      source={require('../assets/logo-icon-small.png')}
      resizeMode="fill"
      className="h-[47px] w-[43px]"
    />
  );
};
