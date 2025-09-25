import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import AudioWaveform from './AudioWaveform';
import Timer from './Timer';
import * as Sharing from 'expo-sharing';
import transcribeAudio from '../../models/expens_Ai/transcribeAudio';
import extractExpensesFromText from '../../models/expens_Ai/extractExpensesFromText';
import ProcessExpenses from '../../models/expens_Ai/processExpenses';

const VoiceRecordingBottomSheetWithExpoAV = forwardRef(({ onExpensesExtracted }, ref) => {
  const [recordingState, setRecordingState] = useState('idle');
  const [seconds, setSeconds] = useState(0);
  const [extractedExpenses, setExtractedExpenses] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingExpense, setEditingExpense] = useState({ expense: '', amount: '' });
  const [recording, setRecording] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // Recording configuration for high quality
  const recordingOptions = {
    android: {
      extension: '.m4a',
      outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
      audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
      audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
  };

  const intervalRef = useRef(null);
  const bottomSheetModalRef = useRef(null);
  const maxRecordingTime = 30; // 30 seconds max

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetModalRef.current?.present(),
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
  }));

  const snapPoints = ['70%'];

  useEffect(() => {
    // Setup audio mode and request permissions
    const setupAudio = async () => {
      try {
        // Set audio mode for recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: false,
        });

        // Request recording permissions
        const { status } = await Audio.requestPermissionsAsync();
        if (status === 'granted') {
          setPermissionGranted(true);
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
      // Clean up recording if exists
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
      // Clean up sound if exists
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
    };
  }, []);

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
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant microphone permission to record audio.');
          return;
        }
        setPermissionGranted(true);
      }

      // Ensure audio mode is set correctly
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      console.log('Starting recording...');
      const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(newRecording);
      setRecordingState('recording');
      startTimer();
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    try {
      if (!recording) return;

      console.log('Stopping recording...');
      setRecordingState('stopped'); // New state for review
      stopTimer();

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);

      // Load the audio for playback
      if (uri) {
        await loadAudioForPlayback(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Failed to process recording. Please try again.');
      handleRetry();
    }
  };

  const handleRecordingStopped = async (uri) => {
    try {
      console.log('Recording saved to:', uri);

      if (!uri) {
        throw new Error('No audio recording found');
      }

      // Step 1: Transcribe the audio
      console.log('Starting transcription...');
      const transcriptionText = await transcribeAudio(uri);
      console.log('Transcription result:', transcriptionText);

      // Step 2: Extract expenses from transcription
      console.log('Extracting expenses from text...');
      const extractedExpensesData = await extractExpensesFromText(transcriptionText);
      console.log('Extracted expenses:', extractedExpensesData);

      // Step 3: Process the expenses and log the data
      console.log('Processing expenses...');
      const expensesProcessor = new ProcessExpenses(extractedExpensesData);
      const processedData = expensesProcessor.processAndLog();

      // Convert to the format expected by the UI with id, checked status, and original data
      const formattedExpenses = extractedExpensesData.map((expense, index) => ({
        id: Date.now() + index,
        expense: expense.title,
        amount: expense.amount,
        checked: true,
      }));

      /* Test data - uncomment for testing
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
      */

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
      if (recording) {
        await recording.pauseAsync();
        setRecordingState('paused');
        stopTimer();
      }
    } catch (error) {
      console.error('Failed to pause recording', error);
    }
  };

  const resumeRecording = async () => {
    try {
      if (recording) {
        await recording.startAsync();
        setRecordingState('recording');
        startTimer();
      }
    } catch (error) {
      console.error('Failed to resume recording', error);
    }
  };

  // Audio playback functions
  const loadAudioForPlayback = async (uri) => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.error('Failed to load audio for playback:', error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis || 0);
      setPlaybackDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying || false);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    }
  };

  const playAudio = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    } catch (error) {
      console.error('Failed to stop audio:', error);
    }
  };

  const processRecording = async () => {
    if (recordingUri) {
      setRecordingState('processing');
      await handleRecordingStopped(recordingUri);
    }
  };

  // Expense management functions
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

  const handleRetry = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (error) {
        console.error('Error stopping recording during retry:', error);
      }
    }
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading sound during retry:', error);
      }
    }
    setRecording(null);
    setRecordingUri(null);
    setSound(null);
    setIsPlaying(false);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
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
          onPress: async () => {
            if (recording) {
              try {
                await recording.stopAndUnloadAsync();
              } catch (error) {
                console.error('Error stopping recording:', error);
              }
            }
            if (sound) {
              try {
                await sound.unloadAsync();
              } catch (error) {
                console.error('Error unloading sound:', error);
              }
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

  const renderStoppedState = () => {
    const formatTime = (millis) => {
      const totalSeconds = Math.floor(millis / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage =
      playbackDuration > 0 ? (playbackPosition / playbackDuration) * 100 : 0;

    return (
      <View className="items-center py-8">
        <View className="mb-6 h-32 w-32 items-center justify-center rounded-full bg-green-500">
          <Ionicons name="checkmark" size={48} color="white" />
        </View>

        <Text className="mb-2 text-lg font-medium text-gray-800">Recording Complete</Text>
        <Text className="mb-6 text-sm text-gray-600">Duration: {formatTime(seconds * 1000)}</Text>

        {/* Audio Player */}
        <View className="mb-8 w-full px-8">
          {/* Progress Bar */}
          <View className="mb-4 h-2 w-full rounded-full bg-gray-200">
            <View
              className="h-full rounded-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>

          {/* Time Display */}
          <View className="mb-4 flex-row justify-between">
            <Text className="text-sm text-gray-600">{formatTime(playbackPosition)}</Text>
            <Text className="text-sm text-gray-600">{formatTime(playbackDuration)}</Text>
          </View>

          {/* Playback Controls */}
          <View className="flex-row items-center justify-center gap-4">
            <TouchableOpacity
              onPress={stopAudio}
              className="h-12 w-12 items-center justify-center rounded-full bg-gray-500"
              activeOpacity={0.8}>
              <Ionicons name="stop" size={20} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={playAudio}
              className="h-16 w-16 items-center justify-center rounded-full bg-blue-500"
              activeOpacity={0.8}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={handleRetry}
            className="items-center rounded-lg border border-red-400 px-6 py-3"
            activeOpacity={0.8}>
            <Text className="font-medium text-red-500">🔄 Re-record</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={processRecording}
            className="flex-row items-center rounded-full bg-green-500 px-6 py-3"
            activeOpacity={0.8}>
            <Ionicons name="arrow-forward" size={20} color="white" />
            <Text className="ml-2 font-medium text-white">Process Audio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
      case 'stopped':
        return renderStoppedState();
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
      enablePanDownToClose={
        recordingState === 'idle' || recordingState === 'completed' || recordingState === 'stopped'
      }
      onDismiss={handleRetry}>
      <BottomSheetView className="flex-1">
        <View className="flex-row items-center justify-between border-b border-gray-200 px-6 py-4">
          <TouchableOpacity onPress={handleCloseModal}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">
            {recordingState === 'completed'
              ? 'Extracted Expenses'
              : recordingState === 'stopped'
                ? 'Review Recording'
                : 'Record Expense'}
          </Text>
          <View className="w-6" />
        </View>

        {renderContent()}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default VoiceRecordingBottomSheetWithExpoAV;
