package com.makotravel.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "mako_voice_settings")

data class VoiceSettings(
    val enableWakeWord: Boolean = false,
    val autoSpeak: Boolean = true,
    val continuousListening: Boolean = false,
    val voiceEngine: String = "gemini", // "gemini" or "device"
    val geminiVoice: String = "Kore", // "Kore", "Puck", "Fenrir", "Zephyr", "Charon"
    val deviceVoiceName: String = "",
    val speechRate: Float = 1.0f,
    val speechPitch: Float = 1.0f
)

class VoicePreferences(private val context: Context) {
    private val WAKE_WORD_KEY = booleanPreferencesKey("enable_wake_word")
    private val AUTO_SPEAK_KEY = booleanPreferencesKey("auto_speak")
    private val CONTINUOUS_LISTENING_KEY = booleanPreferencesKey("continuous_listening")
    private val VOICE_ENGINE_KEY = stringPreferencesKey("voice_engine")
    private val GEMINI_VOICE_KEY = stringPreferencesKey("gemini_voice")
    private val DEVICE_VOICE_NAME_KEY = stringPreferencesKey("device_voice_name")
    private val SPEECH_RATE_KEY = floatPreferencesKey("speech_rate")
    private val SPEECH_PITCH_KEY = floatPreferencesKey("speech_pitch")

    val voiceSettingsFlow: Flow<VoiceSettings> = context.dataStore.data.map { preferences ->
        VoiceSettings(
            enableWakeWord = preferences[WAKE_WORD_KEY] ?: false,
            autoSpeak = preferences[AUTO_SPEAK_KEY] ?: true,
            continuousListening = preferences[CONTINUOUS_LISTENING_KEY] ?: false,
            voiceEngine = preferences[VOICE_ENGINE_KEY] ?: "gemini",
            geminiVoice = preferences[GEMINI_VOICE_KEY] ?: "Kore",
            deviceVoiceName = preferences[DEVICE_VOICE_NAME_KEY] ?: "",
            speechRate = preferences[SPEECH_RATE_KEY] ?: 1.0f,
            speechPitch = preferences[SPEECH_PITCH_KEY] ?: 1.0f
        )
    }

    suspend fun updateSettings(settings: VoiceSettings) {
        context.dataStore.edit { preferences ->
            preferences[WAKE_WORD_KEY] = settings.enableWakeWord
            preferences[AUTO_SPEAK_KEY] = settings.autoSpeak
            preferences[CONTINUOUS_LISTENING_KEY] = settings.continuousListening
            preferences[VOICE_ENGINE_KEY] = settings.voiceEngine
            preferences[GEMINI_VOICE_KEY] = settings.geminiVoice
            preferences[DEVICE_VOICE_NAME_KEY] = settings.deviceVoiceName
            preferences[SPEECH_RATE_KEY] = settings.speechRate
            preferences[SPEECH_PITCH_KEY] = settings.speechPitch
        }
    }
}
