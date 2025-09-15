import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

const AudioWaveform = ({ isRecording, isPaused = false }) => {
  const animatedValues = useRef(Array.from({ length: 20 }, () => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (!isRecording || isPaused) {
      // Stop all animations
      animatedValues.forEach((value) => {
        value.stopAnimation();
        Animated.timing(value, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
      return;
    }

    const animateWaveform = () => {
      const animations = animatedValues.map((value, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 200 + Math.random() * 300,
              useNativeDriver: false,
            }),
            Animated.timing(value, {
              toValue: Math.random() * 0.4 + 0.1,
              duration: 200 + Math.random() * 300,
              useNativeDriver: false,
            }),
          ]),
          { iterations: -1 }
        );
      });

      Animated.stagger(50, animations).start();
    };

    if (isRecording && !isPaused) {
      animateWaveform();
    }

    return () => {
      animatedValues.forEach((value) => value.stopAnimation());
    };
  }, [isRecording, isPaused, animatedValues]);

  return (
    <View className="flex-row items-center justify-center h-16 px-8">
      {animatedValues.map((animatedValue, index) => (
        <Animated.View
          key={index}
          className="mx-0.5 w-1 rounded-full bg-blue-500"
          style={{
            height: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [8, 48],
            }),
          }}
        />
      ))}
    </View>
  );
};

export default AudioWaveform;
