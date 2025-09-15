import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import AudioWaveform from './AudioWaveform';
import Timer from './Timer';

const VoiceRecordingBottomSheet = forwardRef(({ onExpensesExtracted }, ref) => {
  const [recordingState, setRecordingState] = useState('idle');
  const [seconds, setSeconds] = useState(0);
  const [extractedExpenses, setExtractedExpenses] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const intervalRef = useRef(null);
  const bottomSheetModalRef = useRef(null);
  const maxRecordingTime = 30; // 30 seconds max

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetModalRef.current?.present(),
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
  }));
  const snapPoints = ['60%'];

  useEffect(() => {
    // Request permissions and setup audio mode on component mount
    const setupAudio = async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (status.granted) {
          setPermissionGranted(true);
          await setAudioModeAsync({
            playsInSilentMode: true,
            allowsRecording: true,
          });
        }
      } catch (error) {
        console.error('Failed to setup audio:', error);
      }
    };

    setupAudio();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update recording state based on recorder state
  useEffect(() => {
    if (recorderState.isRecording && recordingState !== 'recording') {
      setRecordingState('recording');
    } else if (!recorderState.isRecording && recordingState === 'recording') {
      // Only update if we were recording (not if paused)
      if (recordingState === 'recording') {
        // Recording was stopped
        handleRecordingStopped();
      }
    }
  }, [recorderState.isRecording]);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const newTime = prev + 1;
        if (newTime >= maxRecordingTime) {
          handleStopRecording();
          return maxRecordingTime;
        }
        return newTime;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setSeconds(0);
  };

  const startRecording = async () => {
    try {
      if (!permissionGranted) {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert('Permission Required', 'Please grant microphone permission to record audio.');
          return;
        }
        setPermissionGranted(true);
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      setRecordingState('recording');
      startTimer();
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    try {
      await audioRecorder.stop();
      stopTimer();
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
      handleRetry();
    }
  };

  const handleRecordingStopped = () => {
    setRecordingState('processing');

    // Simulate processing time
    setTimeout(() => {
      // Mock extracted expenses - replace with actual API call
      // You can use audioRecorder.uri to get the recording file path
      console.log('Recording saved to:', audioRecorder.uri);

      const mockExpenses = [
        { expense: 'Breakfast', amount: 100 },
        { expense: 'Lunch', amount: 250 },
        { expense: 'Dinner', amount: 90 },
        { expense: 'Wifi', amount: 180 },
        { expense: 'Rent', amount: 1200 },
      ];

      setExtractedExpenses(mockExpenses);
      setRecordingState('completed');
      onExpensesExtracted?.(mockExpenses);
    }, 2000);
  };

  const pauseRecording = async () => {
    try {
      await audioRecorder.pause();
      setRecordingState('paused');
      stopTimer();
    } catch (error) {
      console.error('Failed to pause recording', error);
    }
  };

  const resumeRecording = async () => {
    try {
      audioRecorder.record();
      setRecordingState('recording');
      startTimer();
    } catch (error) {
      console.error('Failed to resume recording', error);
    }
  };

  const handleRetry = () => {
    if (recorderState.isRecording) {
      audioRecorder.stop().catch(console.error);
    }
    setRecordingState('idle');
    setExtractedExpenses([]);
    resetTimer();
  };

  const handleConfirmAndSave = () => {
    bottomSheetModalRef.current?.dismiss();
    setTimeout(() => {
      handleRetry();
    }, 500);
  };

  const handleCloseModal = () => {
    if (recordingState === 'recording' || recordingState === 'paused') {
      Alert.alert('Stop Recording?', 'Are you sure you want to stop the current recording?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            if (recorderState.isRecording) {
              audioRecorder.stop().catch(console.error);
            }
            bottomSheetModalRef.current?.dismiss();
            setTimeout(handleRetry, 500);
          },
        },
      ]);
    } else {
      bottomSheetModalRef.current?.dismiss();
      setTimeout(handleRetry, 500);
    }
  };

  const renderIdleState = () => (
    <View className="items-center py-8">
      <View className="items-center justify-center w-32 h-32 mb-6 bg-blue-500 rounded-full">
        <Ionicons name="mic" size={48} color="white" />
      </View>
      <Text className="px-4 mb-2 text-center text-gray-600">Say Something like</Text>
      <Text className="mb-8 text-lg font-semibold text-black">"Pizza 50dhs"</Text>
      <TouchableOpacity
        onPress={startRecording}
        className="px-8 py-4 bg-blue-500 rounded-full"
        activeOpacity={0.8}>
        <Text className="text-lg font-semibold text-white">Start Recording</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecordingState = () => (
    <View className="items-center py-8">
      <View className="relative items-center justify-center w-32 h-32 mb-6 bg-blue-500 rounded-full">
        <Ionicons name="mic" size={48} color="white" />
        <View className="absolute border-4 border-blue-300 rounded-full opacity-75 -inset-4" />
      </View>

      <Text className="mb-4 text-lg font-medium text-gray-800">Listening ...</Text>

      <AudioWaveform
        isRecording={recordingState === 'recording'}
        isPaused={recordingState === 'paused'}
      />

      <Timer seconds={seconds} maxSeconds={maxRecordingTime} />

      <View className="flex-row items-center gap-4 mt-8">
        <TouchableOpacity
          onPress={recordingState === 'paused' ? resumeRecording : pauseRecording}
          className="items-center justify-center w-16 h-16 bg-blue-500 rounded-full"
          activeOpacity={0.8}>
          <Ionicons name={recordingState === 'paused' ? 'play' : 'pause'} size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStopRecording}
          className="flex-row items-center px-6 py-3 bg-green-500 rounded-full"
          activeOpacity={0.8}>
          <Ionicons name="checkmark" size={20} color="white" />
          <Text className="ml-2 font-medium text-white">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProcessingState = () => (
    <View className="items-center py-12">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="mt-4 text-lg font-medium text-gray-800">Getting Your Expenses ...</Text>
    </View>
  );

  const renderCompletedState = () => (
    <View className="py-6">
      <Text className="px-6 mb-4 text-lg text-gray-600">That's what we found :</Text>

      <View className="px-6">
        <View className="flex-row justify-between py-3 border-b border-gray-200">
          <Text className="font-medium text-gray-600">Expense</Text>
          <Text className="font-medium text-gray-600">Amount</Text>
        </View>

        {extractedExpenses.map((expense, index) => (
          <View key={index} className="flex-row justify-between py-4 border-b border-gray-100">
            <Text className="font-medium text-gray-800">{expense.expense}</Text>
            <Text className="text-gray-800">{expense.amount}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row gap-2 px-6 mt-8">
        <TouchableOpacity
          onPress={handleRetry}
          className="items-center flex-1 py-4 border border-red-400 rounded-lg"
          activeOpacity={0.8}>
          <Text className="font-medium text-red-500">🔄 Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleConfirmAndSave}
          className="items-center flex-1 py-4 bg-blue-500 rounded-lg"
          activeOpacity={0.8}>
          <Text className="font-medium text-white">Confirm & save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (recordingState) {
      case 'idle':
        return renderIdleState();
      case 'recording':
      case 'paused':
        return renderRecordingState();
      case 'processing':
        return renderProcessingState();
      case 'completed':
        return renderCompletedState();
      default:
        return renderIdleState();
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      enablePanDownToClose={recordingState === 'idle' || recordingState === 'completed'}
      onDismiss={handleRetry}>
      <BottomSheetView className="flex-1">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <TouchableOpacity onPress={handleCloseModal}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">
            {recordingState === 'completed' ? 'Extracted Expenses' : 'Record Expense'}
          </Text>
          <View className="w-6" />
        </View>

        {renderContent()}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default VoiceRecordingBottomSheet;
