/**
 * Two-way Speech Utilities for TravelBot
 * Supports:
 * 1. Speech-to-Text (STT) via browser Web Speech Recognition (supports offline on compatible browsers)
 * 2. Text-to-Speech (TTS) via Gemini Cloud TTS when online, with instant seamless fallback to browser window.speechSynthesis (100% offline)
 */

export interface SpeechSettings {
  autoSpeak: boolean; // Automatically speak new assistant responses
  continuousListening: boolean; // Hands-free mode: auto listen after bot finishes speaking
  enableWakeWord: boolean; // Always listen for "OK Mako" wake word
  wakeWordPhrase: string; // e.g. "OK Mako"
  voiceType: 'gemini' | 'browser'; // Preferred engine
  geminiVoice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
  browserVoiceURI?: string;
  speechRate: number; // 0.8 to 1.5
  speechPitch: number; // 0.8 to 1.2
}

export const DEFAULT_SPEECH_SETTINGS: SpeechSettings = {
  autoSpeak: false,
  continuousListening: false,
  enableWakeWord: true,
  wakeWordPhrase: 'OK Mako',
  voiceType: 'gemini',
  geminiVoice: 'Kore',
  browserVoiceURI: '',
  speechRate: 1.0,
  speechPitch: 1.0,
};

const SPEECH_SETTINGS_KEY = 'travelbot_speech_settings';

export function loadSpeechSettings(): SpeechSettings {
  try {
    const raw = localStorage.getItem(SPEECH_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SPEECH_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error loading speech settings', e);
  }
  return DEFAULT_SPEECH_SETTINGS;
}

export function saveSpeechSettings(settings: SpeechSettings): void {
  try {
    localStorage.setItem(SPEECH_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving speech settings', e);
  }
}

// Track active audio elements and utterances
let activeAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let isCurrentlySpeaking = false;
let currentSpeakingId: string | null = null;

// Listeners for speaking status changes
type SpeakingStateListener = (isSpeaking: boolean, messageId?: string | null) => void;
const speakingListeners: Set<SpeakingStateListener> = new Set();

export function subscribeSpeakingState(listener: SpeakingStateListener): () => void {
  speakingListeners.add(listener);
  return () => {
    speakingListeners.delete(listener);
  };
}

function notifySpeakingState(speaking: boolean, msgId?: string | null) {
  isCurrentlySpeaking = speaking;
  currentSpeakingId = speaking ? (msgId || null) : null;
  speakingListeners.forEach(fn => fn(speaking, currentSpeakingId));
}

export function getIsSpeaking(): boolean {
  return isCurrentlySpeaking;
}

export function getCurrentSpeakingId(): string | null {
  return currentSpeakingId;
}

/**
 * Clean markdown symbols, emoji, and formatting for natural speech synthesis
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
    // Remove headings and bold/italic markup
    .replace(/^[#]{1,6}\s+/gm, '')
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1')
    // Remove bullet points / lists
    .replace(/^[\s]*[-*+•]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Normalize punctuation & whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Play audio from base64 string
 */
function playBase64Audio(
  base64Data: string, 
  mimeType: string = 'audio/wav',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): HTMLAudioElement {
  stopSpeaking();

  const audioUrl = base64Data.startsWith('data:') 
    ? base64Data 
    : `data:${mimeType};base64,${base64Data}`;

  const audio = new Audio(audioUrl);
  activeAudio = audio;

  audio.onplay = () => {
    notifySpeakingState(true);
    onStart?.();
  };

  audio.onended = () => {
    activeAudio = null;
    notifySpeakingState(false);
    onEnd?.();
  };

  audio.onerror = (e) => {
    activeAudio = null;
    notifySpeakingState(false);
    onError?.(e);
  };

  audio.play().catch((e) => {
    activeAudio = null;
    notifySpeakingState(false);
    onError?.(e);
  });

  return audio;
}

/**
 * Fallback / Offline Text-to-Speech using browser SpeechSynthesis
 */
export function speakWithBrowser(
  text: string,
  settings: SpeechSettings = DEFAULT_SPEECH_SETTINGS,
  messageId?: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): void {
  stopSpeaking();

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    onError?.(new Error('SpeechSynthesis not supported'));
    return;
  }

  const clean = cleanTextForSpeech(text);
  if (!clean) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = settings.speechRate || 1.0;
  utterance.pitch = settings.speechPitch || 1.0;
  utterance.lang = 'en-US';

  // Select preferred voice if set
  if (settings.browserVoiceURI) {
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.voiceURI === settings.browserVoiceURI);
    if (match) utterance.voice = match;
  } else {
    // Pick natural English voice if possible
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Arthur')));
    if (preferred) utterance.voice = preferred;
  }

  utterance.onstart = () => {
    notifySpeakingState(true, messageId);
    onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    notifySpeakingState(false);
    onEnd?.();
  };

  utterance.onerror = (e) => {
    activeUtterance = null;
    notifySpeakingState(false);
    // Ignore cancellation errors
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      console.warn('SpeechSynthesis error:', e);
      onError?.(e);
    }
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Universal Speak Function:
 * - If online and settings.voiceType === 'gemini': attempts Gemini cloud TTS.
 * - If offline, or if Gemini TTS returns empty / fails: immediately falls back to browser speech synthesis (100% offline).
 */
export async function speakBotResponse(
  text: string,
  options: {
    messageId?: string;
    isOnline?: boolean;
    settings?: SpeechSettings;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
): Promise<void> {
  const {
    messageId,
    isOnline = true,
    settings = loadSpeechSettings(),
    onStart,
    onEnd,
    onError
  } = options;

  const clean = cleanTextForSpeech(text);
  if (!clean) return;

  // If OFFLINE, directly speak with browser SpeechSynthesis (instant & zero network)
  if (!isOnline || settings.voiceType === 'browser') {
    speakWithBrowser(clean, settings, messageId, onStart, onEnd, onError);
    return;
  }

  // ONLINE Flow: Try Gemini high-quality TTS
  try {
    notifySpeakingState(true, messageId);
    
    // Shorten chunk for TTS request if too massive
    const textChunk = clean.slice(0, 1200);

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: textChunk,
        voiceName: settings.geminiVoice || 'Kore'
      })
    });

    if (!res.ok) {
      throw new Error(`TTS server responded with ${res.status}`);
    }

    const data = await res.json();
    if (data.audioData) {
      playBase64Audio(
        data.audioData, 
        data.mimeType || 'audio/wav',
        () => {
          notifySpeakingState(true, messageId);
          onStart?.();
        },
        () => {
          notifySpeakingState(false);
          onEnd?.();
        },
        (err) => {
          console.warn('Gemini audio playback error, falling back to browser voice:', err);
          speakWithBrowser(clean, settings, messageId, onStart, onEnd, onError);
        }
      );
    } else {
      // Fallback to local browser voice if audioData was null
      speakWithBrowser(clean, settings, messageId, onStart, onEnd, onError);
    }
  } catch (err) {
    console.warn('Gemini TTS failed or offline, using local browser voice:', err);
    speakWithBrowser(clean, settings, messageId, onStart, onEnd, onError);
  }
}

/**
 * Cancel any ongoing speech (both Gemini audio and browser speech synthesis)
 */
export function stopSpeaking(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  activeUtterance = null;
  notifySpeakingState(false);
}

/**
 * Get list of available browser voices
 */
export function getBrowserVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

/**
 * Speech-to-Text (STT) Recognition Controller
 */
export class SpeechToTextController {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback?: (text: string, isFinal: boolean) => void;
  private onEndCallback?: () => void;
  private onErrorCallback?: (error: string) => void;
  private onStartCallback?: () => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false; // single phrase / turn
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.setupHandlers();
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  private setupHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.playChime(true);
      this.onStartCallback?.();
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const resultText = finalTranscript || interimTranscript;
      const isFinal = Boolean(finalTranscript);
      this.onResultCallback?.(resultText, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      this.isListening = false;
      if (event.error !== 'no-speech') {
        this.onErrorCallback?.(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.playChime(false);
      this.onEndCallback?.();
    };
  }

  public startListening(callbacks: {
    onStart?: () => void;
    onResult: (text: string, isFinal: boolean) => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }): boolean {
    if (!this.recognition) {
      callbacks.onError?.('Speech recognition is not supported in this browser.');
      return false;
    }

    // Stop speaking if the bot was currently talking
    stopSpeaking();

    this.onStartCallback = callbacks.onStart;
    this.onResultCallback = callbacks.onResult;
    this.onEndCallback = callbacks.onEnd;
    this.onErrorCallback = callbacks.onError;

    try {
      this.recognition.start();
      return true;
    } catch (e: any) {
      console.warn('Recognition start exception:', e);
      if (e.name === 'InvalidStateError') {
        // Already started, restart
        this.recognition.stop();
        setTimeout(() => {
          try {
            this.recognition.start();
          } catch (inner) {
            this.onErrorCallback?.('Could not activate microphone');
          }
        }, 150);
      } else {
        this.onErrorCallback?.(e.message || 'Microphone error');
      }
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping recognition', e);
      }
      this.isListening = false;
    }
  }

  public playChime(isStart: boolean) {
    try {
      if (typeof window === 'undefined' || !window.AudioContext) return;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isStart ? 440 : 330, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(isStart ? 660 : 220, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch (e) {
      // AudioContext optional sound cue
    }
  }
}

/**
 * Play a distinctive melodic ascending chime when "OK Mako" wake word is activated
 */
export function playWakeWordActivationChime(): void {
  try {
    if (typeof window === 'undefined' || !window.AudioContext) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 3-note ascending triad: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
    const notes = [523.25, 659.25, 783.99];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteStart = now + idx * 0.08;
      const noteDuration = 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.08, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + noteDuration + 0.02);
    });
  } catch (e) {
    // optional audio cue
  }
}

/**
 * Wake Word Extraction Result
 */
export interface WakeWordResult {
  triggered: boolean;
  commandText: string;
  wakeWordMatched?: string;
  isFullPhrase: boolean; // whether there was a command immediately spoken after Mako
}

/**
 * Regex matching for "OK Mako", "Okay Mako", "Hey Mako", "Mako" and phonetic variants (mak-oh)
 */
const MAKO_WAKE_REGEX = /\b(?:ok|okay|hey|hi|yo)?\s*(?:mako|maco|macho|make[- ]?o|mac[- ]?oh|marco)\b[\s,:;]*/i;

export function extractWakeWordCommand(transcript: string): WakeWordResult {
  if (!transcript || typeof transcript !== 'string') {
    return { triggered: false, commandText: '', isFullPhrase: false };
  }

  const match = transcript.match(MAKO_WAKE_REGEX);
  if (!match) {
    return { triggered: false, commandText: '', isFullPhrase: false };
  }

  const matchIndex = match.index ?? 0;
  const matchLength = match[0].length;
  const wakeWordMatched = match[0].trim();
  
  // Extract text after wake word
  const afterWakeWord = transcript.slice(matchIndex + matchLength).trim();
  // Also remove trailing/leading punctuation
  const cleanCommand = afterWakeWord.replace(/^[\s,:;!?.-]+/, '').trim();

  return {
    triggered: true,
    commandText: cleanCommand,
    wakeWordMatched,
    isFullPhrase: cleanCommand.length > 0
  };
}

/**
 * Continuous Wake Word Listener for "OK Mako"
 * Runs background speech recognition and triggers callback whenever wake word is spoken.
 */
export class WakeWordListener {
  private recognition: any = null;
  private isRunning: boolean = false;
  private shouldRestart: boolean = false;
  private onWakeWordDetectedCallback?: (result: WakeWordResult) => void;
  private onStatusChangeCallback?: (isListeningForWakeWord: boolean) => void;
  private onErrorCallback?: (err: string) => void;
  private lastProcessedTimestamp: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.setupHandlers();
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  private setupHandlers() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isRunning = true;
      this.onStatusChangeCallback?.(true);
    };

    this.recognition.onresult = (event: any) => {
      // Don't process wake words if bot is actively speaking
      if (getIsSpeaking()) return;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;

        const wakeResult = extractWakeWordCommand(transcript);
        if (wakeResult.triggered) {
          const now = Date.now();
          // Debounce duplicate triggers within 1.2s
          if (now - this.lastProcessedTimestamp > 1200) {
            this.lastProcessedTimestamp = now;
            playWakeWordActivationChime();
            this.onWakeWordDetectedCallback?.(wakeResult);
          }
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        this.isRunning = false;
        this.shouldRestart = false;
        this.onStatusChangeCallback?.(false);
        this.onErrorCallback?.('Microphone access was denied.');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Wake word recognition warning:', event.error);
      }
    };

    this.recognition.onend = () => {
      this.isRunning = false;
      this.onStatusChangeCallback?.(false);

      // Auto-restart if we are in continuous wake-word listening mode
      if (this.shouldRestart) {
        setTimeout(() => {
          if (this.shouldRestart && !this.isRunning) {
            try {
              this.recognition.start();
            } catch (e) {
              // Ignore restart collision
            }
          }
        }, 300);
      }
    };
  }

  public start(callbacks: {
    onWakeWordDetected: (result: WakeWordResult) => void;
    onStatusChange?: (isListening: boolean) => void;
    onError?: (err: string) => void;
  }): boolean {
    if (!this.recognition) {
      callbacks.onError?.('Speech recognition is not supported in this browser.');
      return false;
    }

    this.onWakeWordDetectedCallback = callbacks.onWakeWordDetected;
    this.onStatusChangeCallback = callbacks.onStatusChange;
    this.onErrorCallback = callbacks.onError;
    this.shouldRestart = true;

    try {
      this.recognition.start();
      return true;
    } catch (e: any) {
      if (e.name === 'InvalidStateError') {
        // already running
        return true;
      }
      console.warn('WakeWord start error:', e);
      callbacks.onError?.(e.message || 'Microphone activation error');
      return false;
    }
  }

  public stop(): void {
    this.shouldRestart = false;
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isRunning = false;
      this.onStatusChangeCallback?.(false);
    }
  }

  public pause(): void {
    if (this.recognition && this.isRunning) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }

  public resume(): void {
    if (this.shouldRestart && !this.isRunning && this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        // ignore
      }
    }
  }
}

