import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const CustomAlert = ({
  visible,
  type = 'success', // 'success', 'error', 'warning', 'info'
  title,
  message,
  onClose,
  onConfirm,
  showCancel = false,
  confirmText,
  cancelText,
}) => {
  const { t } = useTranslation();

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

  // Get default texts with fallback to English
  const getDefaultTitle = () => {
    return (
      title ||
      t(`customAlert.titles.${type}`, {
        defaultValue: type.charAt(0).toUpperCase() + type.slice(1),
      })
    );
  };

  const getConfirmText = () => {
    return confirmText || t('customAlert.buttons.ok', { defaultValue: 'OK' });
  };

  const getCancelText = () => {
    return cancelText || t('customAlert.buttons.cancel', { defaultValue: 'Cancel' });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View
          className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg"
          style={{ maxWidth: width * 0.85 }}>
          {/* Icon */}
          <View className="mb-4 items-center">
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: config.backgroundColor }}>
              <Feather name={config.iconName} size={32} color={config.iconColor} />
            </View>
          </View>

          {/* Title */}
          <Text
            className="mb-2 text-center text-lg font-semibold"
            style={{ color: config.titleColor }}>
            {getDefaultTitle()}
          </Text>

          {/* Message */}
          {message && (
            <Text className="mb-6 text-center text-base leading-5 text-gray-600">{message}</Text>
          )}

          {/* Buttons */}
          <View className={`${showCancel ? 'flex-row gap-3' : ''}`}>
            {showCancel && (
              <TouchableOpacity
                className="flex-1 rounded-lg border border-gray-300 py-3"
                onPress={onClose}>
                <Text className="text-center text-base font-medium text-gray-700">
                  {getCancelText()}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={`rounded-lg py-3 ${showCancel ? 'flex-1' : 'w-full'}`}
              style={{ backgroundColor: config.iconColor }}
              onPress={handleConfirm}>
              <Text className="text-center text-base font-semibold text-white">
                {getConfirmText()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
