# Voice-to-Text Feature

This document describes the voice-to-text (speech recognition) feature implementation, similar to YouTube and Google's voice input.

## Overview

The app now supports:
- **Voice Input**: Record audio and convert to text
- **Real-time Transcription**: See transcription results as you speak
- **Integrated Input Fields**: Voice input button in text input fields
- **Multiple API Support**: Google Speech-to-Text API or custom backend

## Architecture

### Components

1. **SpeechService** (`src/services/speechService.ts`)
   - Handles audio recording and permissions
   - Manages speech recognition API calls
   - Supports Google Speech-to-Text API and custom backend

2. **VoiceInput Component** (`src/components/VoiceInput.tsx`)
   - Standalone voice input UI with waveform visualization
   - Real-time listening indicator
   - Transcription display

3. **Enhanced Input Component** (`src/components/Input.tsx`)
   - Integrated voice input button
   - Modal-based voice input interface
   - Seamless text insertion

## Setup

### Environment Variables

Add the following to your `.env` file:

```env
# Option 1: Google Cloud Speech-to-Text API
GOOGLE_SPEECH_API_KEY=your_google_speech_api_key_here

# Option 2: Custom Backend API
SPEECH_API_URL=https://your-backend.com/api

# Language code (default: en-US)
SPEECH_LANGUAGE=en-US
```

### API Configuration

#### Option 1: Google Cloud Speech-to-Text API

1. **Get API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Speech-to-Text API
   - Create an API key
   - Add to `.env` as `GOOGLE_SPEECH_API_KEY`

2. **Limitations**:
   - Free tier: 60 minutes/month
   - Requires billing account for higher usage

#### Option 2: Custom Backend API

Create a backend endpoint that accepts audio and returns transcription:

```javascript
// Example endpoint: POST /api/transcribe
// Request: multipart/form-data with 'audio' field
// Response: { text: "transcribed text" }
```

### Permissions

#### Android

Permissions are automatically configured in `AndroidManifest.xml`:
- `RECORD_AUDIO`

#### iOS

Permissions are configured in `app.json`:
- `NSMicrophoneUsageDescription`
- Background mode: `audio`

## Usage

### Basic Voice Input

```typescript
import {VoiceInput} from '@components/VoiceInput';

<VoiceInput
  onResult={(text) => {
    console.log('Transcribed:', text);
  }}
  onError={(error) => {
    console.error('Error:', error);
  }}
  language="en-US"
/>
```

### Input Field with Voice Input

```typescript
import {Input} from '@components/Input';

<Input
  label="Search"
  placeholder="Type or use voice input"
  enableVoiceInput={true}
  onVoiceResult={(text) => {
    console.log('Voice result:', text);
  }}
  value={searchText}
  onChangeText={setSearchText}
/>
```

### Programmatic Usage

```typescript
import {speechService} from '@services/speechService';

// Check permissions
const hasPermission = await speechService.checkPermissions();

// Start listening
await speechService.startListening(
  (result) => {
    console.log('Result:', result.text);
  },
  (error) => {
    console.error('Error:', error);
  }
);

// Stop listening and get final result
const transcription = await speechService.stopListening();
```

## Features

### Real-time Transcription
- See transcription as you speak
- Interim results displayed immediately
- Final result when recording stops

### Visual Feedback
- Animated microphone button
- Pulse effect while listening
- Waveform visualization
- Processing indicator

### Error Handling
- Permission requests
- Error callbacks
- Graceful fallbacks

## API Reference

### SpeechService

#### Methods

- `requestPermissions()`: Request microphone permission
- `checkPermissions()`: Check if permission is granted
- `startListening(onResult, onError, options)`: Start voice recording
- `stopListening()`: Stop recording and get transcription
- `cancelListening()`: Cancel current recording
- `isCurrentlyListening()`: Check if currently recording

#### Options

```typescript
interface SpeechRecognitionOptions {
  language?: string;        // Language code (e.g., 'en-US')
  continuous?: boolean;     // Continue listening
  interimResults?: boolean; // Return partial results
  maxAlternatives?: number; // Number of alternatives
}
```

### VoiceInput Component

#### Props

- `onResult: (text: string) => void`: Callback with transcribed text
- `onError?: (error: Error) => void`: Error callback
- `language?: string`: Language code (default: 'en-US')
- `disabled?: boolean`: Disable the component
- `showWaveform?: boolean`: Show waveform animation (default: true)

### Input Component

#### New Props

- `enableVoiceInput?: boolean`: Enable voice input button
- `onVoiceResult?: (text: string) => void`: Callback when voice input completes

## Troubleshooting

### Permission Denied
- Check device settings
- Ensure permissions are granted
- Restart app after granting permissions

### No Transcription
- Verify API key is set correctly
- Check network connectivity
- Ensure audio is being recorded (check device volume)

### API Errors
- Verify Google Speech API is enabled
- Check API key permissions
- Review API quota/limits

### Audio Quality Issues
- Speak clearly and at normal volume
- Reduce background noise
- Ensure microphone is not blocked

## Best Practices

1. **Request Permissions Early**: Request microphone permission before user tries to use voice input
2. **Handle Errors Gracefully**: Show user-friendly error messages
3. **Provide Feedback**: Always show visual feedback during recording
4. **Optimize API Calls**: Consider caching or batching transcriptions
5. **Language Selection**: Allow users to select their language

## Limitations

- Requires internet connection for API calls
- Google Speech API has usage limits
- Audio quality affects transcription accuracy
- Background noise can reduce accuracy
- Some languages may have lower accuracy

## Future Enhancements

- Offline speech recognition
- Multiple language support UI
- Voice commands
- Continuous listening mode
- Custom vocabulary
- Punctuation and formatting

## Notes

- Transcription accuracy depends on audio quality and API used
- Google Speech API requires billing for production use
- Consider implementing a backend proxy for API key security
- Test on physical devices for best audio quality

