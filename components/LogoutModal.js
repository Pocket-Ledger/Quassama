import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, View, Text, TouchableOpacity, Pressable, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LogoutModal = ({ visible, onClose, onConfirm, isLoading = false }) => {
  const { t } = useTranslation();

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/50 px-4" onPress={onClose}>
        <Pressable
          className="w-full max-w-sm rounded-2xl bg-white p-6"
          onPress={(e) => e.stopPropagation()}
          style={{ width: width * 0.85, maxWidth: 340 }}>
          {/* Modal Header */}
          <View className="mb-4 items-center">
            <Text className={`mb-2 text-xl font-bold text-black ${getTextAlign('center')}`}>
              Add commentMore actions
              {t('logoutModal.title')}
            </Text>
            <Text
              className={`text-center text-base font-normal leading-5 text-gray-600 ${getTextAlign('center')}`}>
              {t('logoutModal.message')}
            </Text>
          </View>

          {/* Modal Actions */}
          <View className="mt-6 flex-row gap-3">
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-lg bg-gray-100 px-4 py-3"
              onPress={onClose}
              disabled={isLoading}>
              <Text className="text-base font-medium text-gray-700">{t('logoutModal.cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-lg bg-red-500 px-4 py-3"
              onPress={onConfirm}
              disabled={isLoading}>
              <Text className="text-base font-medium text-white">
                {isLoading ? t('logoutModal.loggingOut') : t('logoutModal.logout')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default LogoutModal;
