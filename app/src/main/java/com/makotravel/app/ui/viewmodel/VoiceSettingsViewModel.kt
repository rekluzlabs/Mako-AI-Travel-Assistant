package com.makotravel.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.makotravel.app.data.local.VoicePreferences
import com.makotravel.app.data.local.VoiceSettings
import com.makotravel.app.voice.MakoSpeechManager
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class VoiceSettingsViewModel(application: Application) : AndroidViewModel(application) {
    private val voicePreferences = VoicePreferences(application)
    val speechManager = MakoSpeechManager(application)

    val voiceSettings: StateFlow<VoiceSettings> = voicePreferences.voiceSettingsFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), VoiceSettings())

    val isSpeaking: StateFlow<Boolean> = speechManager.isSpeaking
    val availableVoices: StateFlow<List<String>> = speechManager.availableVoices

    fun saveSettings(newSettings: VoiceSettings) {
        viewModelScope.launch {
            voicePreferences.updateSettings(newSettings)
        }
    }

    fun testVoice(settings: VoiceSettings) {
        if (speechManager.isSpeaking.value) {
            speechManager.stop()
        } else {
            speechManager.playSample(settings)
        }
    }

    fun stopSpeaking() {
        speechManager.stop()
    }

    override fun onCleared() {
        super.onCleared()
        speechManager.shutdown()
    }
}
