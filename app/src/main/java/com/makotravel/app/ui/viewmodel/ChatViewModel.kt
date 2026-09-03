package com.makotravel.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.makotravel.app.MakoApplication
import com.makotravel.app.data.local.VoicePreferences
import com.makotravel.app.data.local.VoiceSettings
import com.makotravel.app.data.local.entity.ChatMessageEntity
import com.makotravel.app.data.remote.GeminiTravelService
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

class ChatViewModel(application: Application) : AndroidViewModel(application) {
    private val database = (application as MakoApplication).database
    private val chatDao = database.chatDao()
    private val voicePreferences = VoicePreferences(application)
    private val geminiService = GeminiTravelService()

    val messages: StateFlow<List<ChatMessageEntity>> = chatDao.getAllMessages()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    // Event emitted when a bot message should be spoken aloud
    private val _speakEvent = MutableSharedFlow<Pair<String, VoiceSettings>>()
    val speakEvent: SharedFlow<Pair<String, VoiceSettings>> = _speakEvent.asSharedFlow()

    init {
        viewModelScope.launch {
            if (chatDao.getAllMessages().stateIn(viewModelScope).value.isEmpty()) {
                val welcome = ChatMessageEntity(
                    id = "welcome-msg",
                    role = "assistant",
                    content = "Hello! I'm **Mako**, your offline-ready travel companion and smart packing advisor.\n\nAsk me anything about:\n• 🗺️ Day-by-day itineraries and hidden gems\n• 🧳 Weather-adaptive packing checklists\n• ✈️ Airline baggage limits and TSA rules\n• 🛂 Document requirements and visas"
                )
                chatDao.insertMessage(welcome)
            }
        }
    }

    fun sendMessage(promptText: String, tripDestination: String = "Paris, France") {
        if (promptText.isBlank() || _isLoading.value) return

        val userMessage = ChatMessageEntity(
            id = UUID.randomUUID().toString(),
            role = "user",
            content = promptText.trim()
        )

        viewModelScope.launch {
            chatDao.insertMessage(userMessage)
            _isLoading.value = true

            try {
                val responseText = geminiService.generateChatResponse(promptText, "Destination: $tripDestination")
                val botMessage = ChatMessageEntity(
                    id = UUID.randomUUID().toString(),
                    role = "assistant",
                    content = responseText
                )
                chatDao.insertMessage(botMessage)

                val settings = voicePreferences.voiceSettingsFlow.first()
                if (settings.autoSpeak) {
                    // Strip basic markdown formatting for cleaner speech reading
                    val plainSpeechText = responseText
                        .replace(Regex("[#*`_~]"), "")
                        .replace(Regex("\\[(.*?)\\]\\(.*?\\)"), "$1")
                    _speakEvent.emit(Pair(plainSpeechText, settings))
                }
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun clearChat() {
        viewModelScope.launch {
            chatDao.clearHistory()
        }
    }
}
