import * as FileSystem from 'expo-file-system/legacy';

async function transcribeAudio(filePath) {
  try {
    console.log('Starting transcription for file:', filePath);

    // Debug: Check if API key is accessible
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OpenAI API key not found. Make sure EXPO_PUBLIC_OPENAI_API_KEY is set in .env file'
      );
    }
    console.log('API Key found:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');

    // Verify file exists using Expo FileSystem legacy API
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (!fileInfo.exists) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log('File size for transcription:', fileInfo.size, 'bytes');

    if (fileInfo.size === 0) {
      throw new Error('Audio file is empty');
    }

    // Check file extension
    const fileExtension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
    const supportedExtensions = [
      '.mp3',
      '.mp4',
      '.mpeg',
      '.mpga',
      '.m4a',
      '.wav',
      '.webm',
      '.flac',
      '.oga',
      '.ogg',
    ];

    if (!supportedExtensions.includes(fileExtension)) {
      console.warn(`Potentially unsupported file extension: ${fileExtension}`);
    }

    // For React Native, we need to create a FormData object with the file
    const formData = new FormData();
    formData.append('file', {
      uri: filePath,
      type: `audio/${fileExtension.substring(1)}`, // Remove the dot from extension
      name: `recording${fileExtension}`,
    });
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');

    // Use fetch directly for React Native compatibility
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const transcription = await response.text();

    console.log('Transcription completed successfully');
    return transcription;
  } catch (error) {
    console.error('Error during transcription:', error.message);
    console.error('File path:', filePath);
    throw error;
  }
}

export default transcribeAudio;
