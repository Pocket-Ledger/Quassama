import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const LogoutModal = ({ visible, onClose, onConfirm, isLoading = false }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable className="items-center justify-center flex-1 px-4 bg-black/50" onPress={onClose}>
        <Pressable
          className="w-full max-w-sm p-6 bg-white rounded-2xl"
          onPress={(e) => e.stopPropagation()}
          style={{ width: width * 0.85, maxWidth: 340 }}>
          {/* Modal Header */}
          <View className="items-center mb-4">
            <Text className="mb-2 text-xl font-bold text-black">Logout</Text>
            <Text className="text-base leading-5 text-center text-gray-600">
              Are you sure you want to log out?
            </Text>
          </View>

          {/* Modal Actions */}
          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              className="items-center justify-center flex-1 px-4 py-3 bg-gray-100 rounded-lg"
              onPress={onClose}
              disabled={isLoading}>
              <Text className="text-base font-medium text-gray-700">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center justify-center flex-1 px-4 py-3 bg-red-500 rounded-lg"
              onPress={onConfirm}
              disabled={isLoading}>
              <Text className="text-base font-medium text-white">
                {isLoading ? 'Logging out...' : 'Logout'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default LogoutModal;
