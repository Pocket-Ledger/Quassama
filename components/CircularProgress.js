import React from 'react';
import { View } from 'react-native';
import * as Progress from 'react-native-progress';

export const CircularProgress = ({ percentage, color, size = 120 }) => {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Progress.Circle
        progress={percentage / 100}
        size={size}
        thickness={12}
        color={color || '#2979FF'}
        unfilledColor="#E3F2FD"
        borderWidth={0}
        showsText={false}
      />
    </View>
  );
};
