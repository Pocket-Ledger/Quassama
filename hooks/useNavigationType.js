import { useState, useEffect } from 'react';
import { Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useNavigationType() {
  const insets = useSafeAreaInsets();
  const [navigationType, setNavigationType] = useState('gesture'); // 'gesture' or 'button'

  useEffect(() => {
    const detectNavigationType = () => {
      if (Platform.OS === 'ios') {
        // iOS detection based on safe area
        const hasHomeIndicator = insets.bottom > 0;
        setNavigationType(hasHomeIndicator ? 'gesture' : 'button');

        // DEBUG
        console.log('📱 iOS Detection:');
        console.log('Bottom Inset:', insets.bottom);
        console.log('Navigation Type:', hasHomeIndicator ? 'gesture' : 'button');
      } else if (Platform.OS === 'android') {
        // Android detection
        const { height, width } = Dimensions.get('window');
        const screenRatio = height / width;

        const hasGestureInset = insets.bottom > 15;
        const isModernRatio = screenRatio > 1.8;
        const isHighRes = height > 2000;

        let detectedType;
        if (hasGestureInset) {
          detectedType = 'gesture';
        } else if (insets.bottom === 0 && !isModernRatio) {
          detectedType = 'button';
        } else {
          detectedType = isModernRatio || isHighRes ? 'gesture' : 'button';
        }

        setNavigationType(detectedType);

        // DEBUG - Remove this after testing
        console.log('🤖 Android Detection:');
        console.log('Screen Dimensions:', `${width}x${height}`);
        console.log('Screen Ratio:', screenRatio.toFixed(2));
        console.log('Bottom Inset:', insets.bottom);
        console.log('Has Gesture Inset (>15px):', hasGestureInset);
        console.log('Is Modern Ratio (>1.8):', isModernRatio);
        console.log('Is High Resolution (>2000px):', isHighRes);
        console.log('📍 FINAL NAVIGATION TYPE:', detectedType);
        console.log('🔝 Should show TOP tabs:', detectedType === 'button');
      }
    };

    const timer = setTimeout(detectNavigationType, 100);
    return () => clearTimeout(timer);
  }, [insets.bottom, insets.top]);

  return {
    navigationType,
    isGestureNavigation: navigationType === 'gesture',
    isButtonNavigation: navigationType === 'button',
    insets,
  };
}
