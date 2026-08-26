import React, { useState } from 'react';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Mic, MicOff, Send } from 'lucide-react';

export const VoiceChat = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string>('');

  // 1. Start recording audio
  const handleStart = async () => {
    try {
      const hasPermission = await VoiceRecorder.hasAudioRecordingPermission();

      // Request permission if not already granted
      if (!hasPermission.value) {
        const status = await VoiceRecorder.requestAudioRecordingPermission();
        if (!status.value) {
          setStatus('Permission denied');
          return;
        }
      }

      await VoiceRecorder.startRecording();
      setIsRecording(true);
      setStatus('Recording...');
    } catch (error) {
      console.error('Failed to start recording', error);
      setStatus('Error starting recording');
    }
  };

  // 2. Stop recording and process the audio
  const handleStop = async () => {
    try {
      const result = await VoiceRecorder.stopRecording();
      setIsRecording(false);
      setStatus('Processing...');

      if (result.value && result.value.recordDataBase64) {
        const audioData = result.value.recordDataBase64;
        const mimeType = result.value.mimeType;

        // Send this audio data to your AI model endpoint
        console.log('Audio captured successfully! Sending to AI...', mimeType);
        setStatus('Sent to AI');

        // Example: await sendAudioToAI(audioData, mimeType);
      } else {
        setStatus('No audio captured');
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
      setStatus('Error stopping recording');
    }
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center space-y-4 bg-gray-50 rounded-xl shadow-sm border border-gray-200">
      <div className={`p-4 rounded-full ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-blue-100'}`}>
        {isRecording ? (
          <Mic className="w-8 h-8 text-red-600" />
        ) : (
          <Mic className="w-8 h-8 text-blue-600" />
        )}
      </div>

      <button
        onClick={isRecording ? handleStop : handleStart}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          isRecording
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isRecording ? 'Stop & Send to AI' : 'Start Talking'}
      </button>

      {status && (
        <p className="text-sm text-gray-500 italic">{status}</p>
      )}
    </div>
  );
};
