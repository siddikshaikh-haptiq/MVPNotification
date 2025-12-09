export const ENV = {
  GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID || '',
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.example.com',
  SOCKET_URL: process.env.SOCKET_URL || 'ws://localhost:3000',
  ENABLE_NOTIFICATIONS: process.env.ENABLE_NOTIFICATIONS !== 'false',
  LOCATION_UPDATE_INTERVAL: parseInt(process.env.LOCATION_UPDATE_INTERVAL || '5000', 10),
  LOCATION_ACCURACY: process.env.LOCATION_ACCURACY || 'balanced',
  // Speech Recognition
  GOOGLE_SPEECH_API_KEY: process.env.GOOGLE_SPEECH_API_KEY || '',
  SPEECH_API_URL: process.env.SPEECH_API_URL || '',
  SPEECH_LANGUAGE: process.env.SPEECH_LANGUAGE || 'en-US',
};

