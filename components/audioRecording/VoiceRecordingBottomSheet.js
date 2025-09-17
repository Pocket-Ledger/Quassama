import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
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
import * as Sharing from 'expo-sharing';
import transcribeAudio from '../../models/expens_Ai/transcribeAudio';
import extractExpensesFromText from '../../models/expens_Ai/extractExpensesFromText';
import ProcessExpenses from '../../models/expens_Ai/processExpenses';

const VoiceRecordingBottomSheet = forwardRef(({ onExpensesExtracted }, ref) => {
  const [recordingState, setRecordingState] = useState('idle');
  const [seconds, setSeconds] = useState(0);
  const [extractedExpenses, setExtractedExpenses] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingExpense, setEditingExpense] = useState({ expense: '', amount: '' });

  const customRecordingOptions = {
    android: {
      extension: '.wav',
      outputFormat: 'default',
      audioEncoder: 'default',
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.wav',
      outputFormat: 'linearPCM',
      audioQuality: 'max',
      sampleRate: 44100,
      numberOfChannels: 1,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  };
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY); //M4A type
  // const audioRecorder = useAudioRecorder(customRecordingOptions);//WAV type
  const recorderState = useAudioRecorderState(audioRecorder);

  const intervalRef = useRef(null);
  const bottomSheetModalRef = useRef(null);
  const maxRecordingTime = 30; // 30 seconds max

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetModalRef.current?.present(),
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
  }));
  const snapPoints = ['70%']; // Increased height to accommodate edit functionality

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

  const handleRecordingStopped = async () => {
    setRecordingState('processing');

    try {
      console.log('Recording saved to:', audioRecorder.uri);

      if (!audioRecorder.uri) {
        throw new Error('No audio recording found');
      }

      // Step 1: Transcribe the audio
      /* console.log('Starting transcription...');
      const transcriptionText = await transcribeAudio(audioRecorder.uri);
      console.log('Transcription result:', transcriptionText); */

      // Step 2: Extract expenses from transcription
      /* console.log('Extracting expenses from text...');
      const extractedExpensesData = await extractExpensesFromText(transcriptionText);
      console.log('Extracted expenses:', extractedExpensesData); */

      // Step 3: Process the expenses and log the data
      console.log('Processing expenses...');
      /*  const expensesProcessor = new ProcessExpenses(extractedExpensesData);
      const processedData = expensesProcessor.processAndLog(); */

      // Convert to the format expected by the UI with id, checked status, and original data
      /*  const formattedExpenses = extractedExpensesData.map((expense, index) => ({
        id: Date.now() + index, 
        expense: expense.title,
        amount: expense.amount,
        checked: true, 
      })); */

      const formattedExpenses = [
        {
          id: Date.now() + 1,
          expense: 'Breakfast',
          amount: '100',
          checked: true,
        },
        {
          id: Date.now() + 2,
          expense: 'Lunch',
          amount: '250',
          checked: true,
        },
        {
          id: Date.now() + 3,
          expense: 'Dinner',
          amount: '90',
          checked: true,
        },
        {
          id: Date.now() + 4,
          expense: 'Wifi',
          amount: '180',
          checked: true,
        },
        {
          id: Date.now() + 5,
          expense: 'Rent',
          amount: '1200',
          checked: true,
        },
      ];

      setExtractedExpenses(formattedExpenses);
      setRecordingState('completed');
    } catch (error) {
      console.error('Error processing audio:', error.message);
      Alert.alert('Processing Error', 'Failed to process your recording. Please try again.', [
        { text: 'OK', onPress: handleRetry },
      ]);
      setRecordingState('idle');
    }
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

  // New functions for expense management
  const handleCheckboxToggle = (id) => {
    setExtractedExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id ? { ...expense, checked: !expense.checked } : expense
      )
    );
  };

  const handleDeleteExpense = (id) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setExtractedExpenses((prev) => prev.filter((expense) => expense.id !== id));
        },
      },
    ]);
  };

  const handleEditExpense = (index) => {
    const expense = extractedExpenses[index];
    setEditingIndex(index);
    setEditingExpense({
      expense: expense.expense,
      amount: expense.amount.toString(),
    });
  };

  const handleSaveEdit = () => {
    if (!editingExpense.expense.trim() || !editingExpense.amount.trim()) {
      Alert.alert('Error', 'Please fill in both expense name and amount');
      return;
    }

    setExtractedExpenses((prev) =>
      prev.map((expense, index) =>
        index === editingIndex
          ? {
              ...expense,
              expense: editingExpense.expense.trim(),
              amount: editingExpense.amount.trim(),
            }
          : expense
      )
    );

    setEditingIndex(null);
    setEditingExpense({ expense: '', amount: '' });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingExpense({ expense: '', amount: '' });
  };

  const handleRetry = () => {
    if (recorderState.isRecording) {
      audioRecorder.stop().catch(console.error);
    }
    setRecordingState('idle');
    setExtractedExpenses([]);
    setEditingIndex(null);
    setEditingExpense({ expense: '', amount: '' });
    resetTimer();
  };

  const handleConfirmAndSave = () => {
    // Only pass checked expenses to parent component
    const checkedExpenses = extractedExpenses
      .filter((expense) => expense.checked)
      .map((expense) => ({
        expense: expense.expense,
        amount: expense.amount,
      }));

    if (checkedExpenses.length === 0) {
      Alert.alert('No Expenses Selected', 'Please select at least one expense to save.');
      return;
    }

    onExpensesExtracted?.(checkedExpenses);
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
      <View className="mb-6 h-32 w-32 items-center justify-center rounded-full bg-blue-500">
        <Ionicons name="mic" size={48} color="white" />
      </View>
      <Text className="mb-2 px-4 text-center text-gray-600">Say Something like</Text>
      <Text className="mb-8 text-lg font-semibold text-black">"Pizza 50dhs"</Text>
      <TouchableOpacity
        onPress={startRecording}
        className="rounded-full bg-blue-500 px-8 py-4"
        activeOpacity={0.8}>
        <Text className="text-lg font-semibold text-white">Start Recording</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecordingState = () => (
    <View className="items-center py-8">
      <View className="relative mb-6 h-32 w-32 items-center justify-center rounded-full bg-blue-500">
        <Ionicons name="mic" size={48} color="white" />
        <View className="absolute -inset-4 rounded-full border-4 border-blue-300 opacity-75" />
      </View>

      <Text className="mb-4 text-lg font-medium text-gray-800">Listening ...</Text>

      <AudioWaveform
        isRecording={recordingState === 'recording'}
        isPaused={recordingState === 'paused'}
      />

      <Timer seconds={seconds} maxSeconds={maxRecordingTime} />

      <View className="mt-8 flex-row items-center gap-4">
        <TouchableOpacity
          onPress={recordingState === 'paused' ? resumeRecording : pauseRecording}
          className="h-16 w-16 items-center justify-center rounded-full bg-blue-500"
          activeOpacity={0.8}>
          <Ionicons name={recordingState === 'paused' ? 'play' : 'pause'} size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStopRecording}
          className="flex-row items-center rounded-full bg-green-500 px-6 py-3"
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

  const renderExpenseItem = (expense, index) => {
    const isEditing = editingIndex === index;

    if (isEditing) {
      return (
        <View key={expense.id} className="border-b border-gray-100 px-6 py-4">
          <View className="flex-row items-center gap-4">
            {/* Checkbox (disabled during editing) */}
            <TouchableOpacity disabled className="opacity-50">
              <View
                className={`h-6 w-6 rounded border-2 ${expense.checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'} items-center justify-center`}>
                {expense.checked && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
            </TouchableOpacity>

            {/* Edit inputs */}
            <View className="flex-1 gap-2">
              <TextInput
                value={editingExpense.expense}
                onChangeText={(text) => setEditingExpense((prev) => ({ ...prev, expense: text }))}
                className="rounded border border-gray-300 px-3 py-2 text-gray-800"
                placeholder="Expense name"
              />
              <TextInput
                value={editingExpense.amount}
                onChangeText={(text) => setEditingExpense((prev) => ({ ...prev, amount: text }))}
                className="rounded border border-gray-300 px-3 py-2 text-gray-800"
                placeholder="Amount"
                keyboardType="numeric"
              />
            </View>

            {/* Save/Cancel buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleSaveEdit}
                className="rounded-full bg-green-500 p-2"
                activeOpacity={0.8}>
                <Ionicons name="checkmark" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelEdit}
                className="rounded-full bg-gray-500 p-2"
                activeOpacity={0.8}>
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View
        key={expense.id}
        className="flex-row items-center justify-between border-b border-gray-100 px-6 py-4">
        {/* Checkbox */}
        <TouchableOpacity
          onPress={() => handleCheckboxToggle(expense.id)}
          className="mr-3"
          activeOpacity={0.8}>
          <View
            className={`h-6 w-6 rounded border-2 ${expense.checked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'} items-center justify-center`}>
            {expense.checked && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
        </TouchableOpacity>

        {/* Expense details */}
        <View className="flex-1">
          <Text className={`font-medium ${expense.checked ? 'text-gray-800' : 'text-gray-400'}`}>
            {expense.expense}
          </Text>
          <Text className={`${expense.checked ? 'text-gray-600' : 'text-gray-400'}`}>
            {expense.amount}
          </Text>
        </View>

        {/* Action buttons */}
        <View className="ml-3 flex-row gap-2">
          <TouchableOpacity
            onPress={() => handleEditExpense(index)}
            className="rounded-full bg-blue-500 p-2"
            activeOpacity={0.8}>
            <Ionicons name="create-outline" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteExpense(expense.id)}
            className="rounded-full bg-red-500 p-2"
            activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCompletedState = () => {
    const checkedCount = extractedExpenses.filter((expense) => expense.checked).length;

    return (
      <View className="flex-1 py-6">
        <View className="mb-4 flex-row items-center justify-between px-6">
          <Text className="text-lg text-gray-600">That's what we found:</Text>
          <Text className="text-sm text-gray-500">{checkedCount} selected</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between border-b border-gray-200 px-6 py-3">
            <Text className="font-medium text-gray-600">Expense</Text>
            <Text className="font-medium text-gray-600">Actions</Text>
          </View>

          {extractedExpenses.map((expense, index) => renderExpenseItem(expense, index))}
        </View>

        <View className="mt-8 flex-row gap-2 px-6">
          <TouchableOpacity
            onPress={handleRetry}
            className="flex-1 items-center rounded-lg border border-red-400 py-4"
            activeOpacity={0.8}>
            <Text className="font-medium text-red-500">🔄 Retry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleConfirmAndSave}
            className="flex-1 items-center rounded-lg bg-blue-500 py-4"
            activeOpacity={0.8}>
            <Text className="font-medium text-white">Confirm & save ({checkedCount})</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-4">
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
