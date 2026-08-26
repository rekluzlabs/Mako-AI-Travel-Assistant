import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Mic, 
  Settings2, 
  X, 
  Sparkles, 
  Play, 
  Square, 
  Check, 
  Sliders, 
  Radio,
  Cpu,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  SpeechSettings, 
  getBrowserVoices, 
  speakBotResponse, 
  stopSpeaking, 
  getIsSpeaking,
  subscribeSpeakingState
} from '../utils/speech';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SpeechSettings;
  onSaveSettings: (settings: SpeechSettings) => void;
  isOnline: boolean;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  isOnline
}) => {
  const [localSettings, setLocalSettings] = useState<SpeechSettings>(settings);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = getBrowserVoices();
        setBrowserVoices(voices.filter(v => v.lang.startsWith('en') || v.lang.startsWith('es') || v.lang.startsWith('fr')));
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    const unsub = subscribeSpeakingState((speaking) => {
      setIsPlayingPreview(speaking);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleTestVoice = async () => {
    if (isPlayingPreview) {
      stopSpeaking();
      setIsPlayingPreview(false);
      return;
    }

    const previewText = localSettings.voiceType === 'gemini' && isOnline
      ? "Hello traveler! I am TravelBot. Your flights, itineraries, and packing lists are all set!"
      : "Hello traveler! I am speaking with your device's offline speech voice. Ready for the trip!";

    await speakBotResponse(previewText, {
      isOnline,
      settings: localSettings,
      onStart: () => setIsPlayingPreview(true),
      onEnd: () => setIsPlayingPreview(false),
      onError: () => setIsPlayingPreview(false)
    });
  };

  const handleSave = () => {
    stopSpeaking();
    onSaveSettings(localSettings);
    onClose();
  };

  const geminiVoices = [
    { id: 'Kore', name: 'Kore (Warm & Natural)', desc: 'Friendly, balanced travel host' },
    { id: 'Puck', name: 'Puck (Lively & Clear)', desc: 'Energetic and upbeat' },
    { id: 'Fenrir', name: 'Fenrir (Deep & Confident)', desc: 'Authoritative and crisp' },
    { id: 'Zephyr', name: 'Zephyr (Calm & Soothing)', desc: 'Gentle and relaxed' },
    { id: 'Charon', name: 'Charon (Formal & Direct)', desc: 'Concise and informative' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Voice & Speech Settings</h2>
              <p className="text-xs text-stone-700">Two-way voice conversation (Online & Offline)</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Toggles: Wake Word, Auto-Speak & Continuous Hands-Free Mode */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">Conversation & Hands-Free Modes</h3>
            
            {/* OK Mako Wake Word Toggle */}
            <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/60 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>"OK Mako" Wake Word Mode</span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-mono font-normal">
                    mak-oh
                  </span>
                </div>
                <p className="text-xs text-stone-700">
                  Say <strong>"OK Mako"</strong>, <strong>"Hey Mako"</strong>, or <strong>"Mako"</strong> to activate voice input hands-free anytime.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={localSettings.enableWakeWord}
                onClick={() => setLocalSettings(prev => ({ ...prev, enableWakeWord: !prev.enableWakeWord }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  localSettings.enableWakeWord ? 'bg-amber-700' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    localSettings.enableWakeWord ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-700" />
                  <span>Auto-Speak Bot Responses</span>
                </div>
                <p className="text-xs text-stone-700">
                  Automatically read aloud all new assistant replies as they arrive.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={localSettings.autoSpeak}
                onClick={() => setLocalSettings(prev => ({ ...prev, autoSpeak: !prev.autoSpeak }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  localSettings.autoSpeak ? 'bg-amber-700' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    localSettings.autoSpeak ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-rose-700" />
                  <span>Hands-Free Follow-up Listening</span>
                </div>
                <p className="text-xs text-stone-700">
                  Automatically activate the microphone after the assistant finishes speaking.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={localSettings.continuousListening}
                onClick={() => setLocalSettings(prev => ({ ...prev, continuousListening: !prev.continuousListening }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  localSettings.continuousListening ? 'bg-rose-700' : 'bg-stone-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    localSettings.continuousListening ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Voice Engine Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">Voice Synthesis Engine</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Gemini Cloud Voice */}
              <button
                type="button"
                onClick={() => setLocalSettings(prev => ({ ...prev, voiceType: 'gemini' }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  localSettings.voiceType === 'gemini'
                    ? 'border-amber-700 bg-amber-50/60 ring-1 ring-amber-700'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Gemini Neural Voice</span>
                  </span>
                  {localSettings.voiceType === 'gemini' && <Check className="w-4 h-4 text-amber-700" />}
                </div>
                <p className="text-[11px] text-stone-700 leading-tight">
                  High-fidelity natural neural voices. Seamlessly switches to offline voice when disconnected.
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-900 font-medium">
                  <Wifi className="w-3 h-3" /> Online Cloud AI
                </div>
              </button>

              {/* Browser Local Voice */}
              <button
                type="button"
                onClick={() => setLocalSettings(prev => ({ ...prev, voiceType: 'browser' }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  localSettings.voiceType === 'browser'
                    ? 'border-amber-700 bg-amber-50/60 ring-1 ring-amber-700'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-stone-700" />
                    <span>Device Offline Voice</span>
                  </span>
                  {localSettings.voiceType === 'browser' && <Check className="w-4 h-4 text-amber-700" />}
                </div>
                <p className="text-[11px] text-stone-700 leading-tight">
                  Uses device built-in speech engine. Instant playback with zero latency and 100% offline.
                </p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
                  <WifiOff className="w-3 h-3 text-emerald-700" /> 100% Offline Ready
                </div>
              </button>
            </div>
          </div>

          {/* Voice Personality Choice */}
          {localSettings.voiceType === 'gemini' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                Gemini Voice Persona
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {geminiVoices.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setLocalSettings(prev => ({ ...prev, geminiVoice: v.id as any }))}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      localSettings.geminiVoice === v.id
                        ? 'border-amber-700 bg-amber-100/50 text-amber-950 font-bold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="font-semibold text-stone-900">{v.name}</div>
                    <div className="text-[10px] text-stone-600 mt-0.5">{v.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                Installed Offline Voice
              </label>
              <select
                value={localSettings.browserVoiceURI || ''}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, browserVoiceURI: e.target.value }))}
                className="w-full text-xs rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-hidden"
              >
                <option value="">Default System Voice (Auto-detect English)</option>
                {browserVoices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Speech Rate (Speed) Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold uppercase tracking-wider text-stone-600">
                Speech Speed ({localSettings.speechRate}x)
              </label>
              <span className="text-[11px] text-stone-600">
                {localSettings.speechRate < 1.0 ? 'Relaxed' : localSettings.speechRate === 1.0 ? 'Normal' : 'Fast'}
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.1"
              value={localSettings.speechRate}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, speechRate: parseFloat(e.target.value) }))}
              className="w-full accent-amber-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-600 px-0.5">
              <span>0.8x</span>
              <span>1.0x (Standard)</span>
              <span>1.2x</span>
              <span>1.4x</span>
            </div>
          </div>
        </div>

        {/* Footer with Test Preview & Save */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestVoice}
            className={`px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isPlayingPreview
                ? 'border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100'
                : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-100'
            }`}
          >
            {isPlayingPreview ? (
              <>
                <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>Stop Preview</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-stone-700 text-stone-700" />
                <span>Test Voice Sample</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl text-stone-600 hover:bg-stone-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
