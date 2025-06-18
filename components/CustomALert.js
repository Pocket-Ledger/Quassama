import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CustomAlert = ({
  visible,
  type = 'success', // 'success', 'error', 'warning', 'info'
  title,
  message,
  onClose,
  onConfirm,
  showCancel = false,
  confirmText = 'OK',
  cancelText = 'Cancel',
}) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          iconName: 'check-circle',
          iconColor: '#34C759',
          backgroundColor: '#ECFDF5',
          borderColor: '#34C759',
          titleColor: '#065F46',
        };
      case 'error':
        return {
          iconName: 'x-circle',
          iconColor: '#FF3B30',
          backgroundColor: '#FEF2F2',
          borderColor: '#FF3B30',
          titleColor: '#991B1B',
        };
      case 'warning':
        return {
          iconName: 'alert-triangle',
          iconColor: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
          titleColor: '#92400E',
        };
      case 'info':
        return {
          iconName: 'info',
          iconColor: '#2979FF',
          backgroundColor: '#E6F0FF',
          borderColor: '#2979FF',
          titleColor: '#1E40AF',
        };
      default:
        return {
          iconName: 'check-circle',
          iconColor: '#10B981',
          backgroundColor: '#ECFDF5',
          borderColor: '#10B981',
          titleColor: '#065F46',
        };
    }
  };

  const config = getAlertConfig();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="items-center justify-center flex-1 px-6 bg-black/50">
        <View
          className="w-full max-w-sm p-6 bg-white shadow-lg rounded-2xl"
          style={{ maxWidth: width * 0.85 }}>
          {/* Icon */}
          <View className="items-center mb-4">
            <View
              className="items-center justify-center w-16 h-16 rounded-full"
              style={{ backgroundColor: config.backgroundColor }}>
              <Feather name={config.iconName} size={32} color={config.iconColor} />
            </View>
          </View>

          {/* Title */}
          {title && (
            <Text
              className="mb-2 text-lg font-semibold text-center"
              style={{ color: config.titleColor }}>
              {title}
            </Text>
          )}

          {/* Message */}
          {message && (
            <Text className="mb-6 text-base leading-5 text-center text-gray-600">{message}</Text>
          )}

          {/* Buttons */}
          <View className={`${showCancel ? 'flex-row gap-3' : ''}`}>
            {showCancel && (
              <TouchableOpacity
                className="flex-1 py-3 border border-gray-300 rounded-lg"
                onPress={onClose}>
                <Text className="text-base font-medium text-center text-gray-700">
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={`rounded-lg py-3 ${showCancel ? 'flex-1' : 'w-full'}`}
              style={{ backgroundColor: config.iconColor }}
              onPress={handleConfirm}>
              <Text className="text-base font-semibold text-center text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
