import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const ConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmButtonColor = '#EF4444', // red by default for delete actions
  icon = 'trash-2',
  iconColor = '#EF4444',
  loading = false,
}) => {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View
          className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          style={{ width: width * 0.85 }}>
          {/* Icon */}
          <View className="mb-4 items-center">
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${iconColor}15` }}>
              <Feather name={icon} size={28} color={iconColor} />
            </View>
          </View>

          {/* Title */}
          <Text className="mb-3 text-center text-xl font-semibold text-gray-900">{title}</Text>

          {/* Message */}
          <Text className="mb-6 text-center text-base leading-6 text-gray-600">{message}</Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            {/* Cancel Button */}
            <TouchableOpacity
              className="flex-1 rounded-lg border border-gray-300 bg-gray-50 py-3"
              onPress={onClose}
              disabled={loading}>
              <Text className="text-center text-base font-medium text-gray-700">
                {cancelText || t('common.cancel')}
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              className="flex-1 rounded-lg py-3"
              style={{ backgroundColor: confirmButtonColor }}
              onPress={onConfirm}
              disabled={loading}>
              {loading ? (
                <View className="flex-row items-center justify-center">
                  <View className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <Text className="text-center text-base font-medium text-white">
                    {t('common.loading')}
                  </Text>
                </View>
              ) : (
                <Text className="text-center text-base font-medium text-white">
                  {confirmText || t('common.confirm')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
