// components/Logo.js
import React from 'react';
import { Image } from 'react-native';

const Logo = ({ width = 200, height = 200 }) => {
  return (
    <Image
      source={require('../assets/logo-icon.png')}
      resizeMode="fill"
      className="h-[96px] w-[87px]"
    />
  );
};

export default Logo;
