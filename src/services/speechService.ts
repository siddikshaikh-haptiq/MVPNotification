import {Audio} from 'expo-av';
import * as FileSystem from 'expo-file-system';
import {ENV} from '@config/env';

export interface SpeechRecognitionResult {
  text: string;
  confidence?: number;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

class SpeechService {
  private recording: Audio.Recording | null = null;
  private isRecording: boolean = false;
  private recognitionCallback: ((result: SpeechRecognitionResult) => void) | null =
    null;
  private errorCallback: ((error: Error) => void) | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const {status} = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const {status} = await Audio.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking audio permissions:', error);
      return false;
    }
  }

  async startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: Error) => void,
    options?: SpeechRecognitionOptions,
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Create and start recording
      const {recording} = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      this.recording = recording;
      this.isRecording = true;
      this.recognitionCallback = onResult;
      this.errorCallback = onError || null;

      // Start processing audio (simulated real-time recognition)
      this.processAudioStream(options);

      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      if (this.errorCallback) {
        this.errorCallback(error as Error);
      }
      return false;
    }
  }

  async stopListening(): Promise<string | null> {
    try {
      if (!this.recording || !this.isRecording) {
        return null;
      }

      this.isRecording = false;

      // Stop recording
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      // Get the recorded audio and transcribe
      const transcription = await this.transcribeAudio(uri);

      // Cleanup
      this.recording = null;
      this.recognitionCallback = null;
      this.errorCallback = null;

      return transcription;
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      if (this.errorCallback) {
        this.errorCallback(error as Error);
      }
      return null;
    }
  }

  async cancelListening(): Promise<void> {
    try {
      if (this.recording && this.isRecording) {
        await this.recording.stopAndUnloadAsync();
      }
      this.recording = null;
      this.isRecording = false;
      this.recognitionCallback = null;
      this.errorCallback = null;
    } catch (error) {
      console.error('Error canceling speech recognition:', error);
    }
  }

  isCurrentlyListening(): boolean {
    return this.isRecording;
  }

  private async processAudioStream(
    options?: SpeechRecognitionOptions,
  ): Promise<void> {
    // This is a placeholder for real-time processing
    // In a real implementation, you would:
    // 1. Stream audio chunks to a speech recognition API
    // 2. Receive interim results
    // 3. Call the recognitionCallback with results

    // For now, we'll simulate this with the final transcription
    // after recording stops
  }

  private async transcribeAudio(uri: string | null): Promise<string> {
    if (!uri) {
      return '';
    }

    try {
      // Option 1: Use Google Cloud Speech-to-Text API
      if (ENV.GOOGLE_SPEECH_API_KEY) {
        return await this.transcribeWithGoogle(uri);
      }

      // Option 2: Use backend API endpoint
      if (ENV.SPEECH_API_URL) {
        return await this.transcribeWithBackend(uri);
      }

      // Fallback: Return empty (user should configure API)
      console.warn(
        'No speech recognition API configured. Set GOOGLE_SPEECH_API_KEY or SPEECH_API_URL in .env',
      );
      return '';
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    }
  }

  private async transcribeWithGoogle(uri: string): Promise<string> {
    try {
      // Read audio file as base64 using React Native FileSystem
      // For Expo, we'll use a simpler approach with FormData
      // Note: Google Speech API requires base64, so we'll need to convert
      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      // For now, we'll use a backend proxy or convert on the client
      // This is a simplified version - in production, you'd want to:
      // 1. Send audio to your backend
      // 2. Backend converts to base64 and calls Google API
      // 3. Return transcription
      
      // Use expo-file-system to read as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64' as any,
      });

      // Call Google Speech-to-Text API
      const apiUrl = `https://speech.googleapis.com/v1/speech:recognize?key=${ENV.GOOGLE_SPEECH_API_KEY}`;
      const requestBody = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 44100,
          languageCode: ENV.SPEECH_LANGUAGE || 'en-US',
          enableAutomaticPunctuation: true,
        },
        audio: {
          content: base64Audio,
        },
      };

      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!apiResponse.ok) {
        throw new Error(`Google Speech API error: ${apiResponse.statusText}`);
      }

      const data = await apiResponse.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].alternatives[0].transcript;
      }

      return '';
    } catch (error) {
      console.error('Error with Google Speech API:', error);
      throw error;
    }
  }

  private async transcribeWithBackend(uri: string): Promise<string> {
    try {
      // Create FormData to send audio file
      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      const response = await fetch(`${ENV.SPEECH_API_URL}/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Speech API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.text || data.transcript || '';
    } catch (error) {
      console.error('Error with backend Speech API:', error);
      throw error;
    }
  }
}

export const speechService = new SpeechService();

