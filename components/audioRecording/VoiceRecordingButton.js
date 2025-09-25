import React, { useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import VoiceRecordingBottomSheetWithExpoAV from './VoiceRecordingBottomSheetWithExpoAv';

const VoiceRecordingButton = ({ onExpensesExtracted }) => {
  const bottomSheetModalRef = useRef(null);

  const handleOpenModal = () => {
    bottomSheetModalRef.current?.present();
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleOpenModal}
        className="elevation-8 absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg"
        activeOpacity={0.8}>
        <Ionicons name="mic" size={24} color="white" />
      </TouchableOpacity>

      <VoiceRecordingBottomSheetWithExpoAV
        ref={bottomSheetModalRef}
        onExpensesExtracted={onExpensesExtracted}
      />
    </>
  );
};

export default VoiceRecordingButton;
