import React, { useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import VoiceRecordingBottomSheet from './VoiceRecordingBottomSheet';

const VoiceRecordingButton = ({ onExpensesExtracted }) => {
  const bottomSheetModalRef = useRef(null);

  const handleOpenModal = () => {
    bottomSheetModalRef.current?.present();
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleOpenModal}
        className="absolute items-center justify-center bg-blue-500 rounded-full shadow-lg elevation-8 bottom-6 right-6 h-14 w-14"
        activeOpacity={0.8}>
        <Ionicons name="mic" size={24} color="white" />
      </TouchableOpacity>

      <VoiceRecordingBottomSheet
        ref={bottomSheetModalRef}
        onExpensesExtracted={onExpensesExtracted}
      />
    </>
  );
};

export default VoiceRecordingButton;
