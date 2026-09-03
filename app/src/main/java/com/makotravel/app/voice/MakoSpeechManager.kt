package com.makotravel.app.voice

import android.content.Context
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.tts.Voice
import com.makotravel.app.data.local.VoiceSettings
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Locale

class MakoSpeechManager(
    private val context: Context,
    private val onSpeechCompleted: (() -> Unit)? = null
) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = null
    private var isInitialized = false

    private val _isSpeaking = MutableStateFlow(false)
    val isSpeaking: StateFlow<Boolean> = _isSpeaking.asStateFlow()

    private val _availableVoices = MutableStateFlow<List<String>>(emptyList())
    val availableVoices: StateFlow<List<String>> = _availableVoices.asStateFlow()

    init {
        tts = TextToSpeech(context.applicationContext, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.getDefault()
            isInitialized = true

            // Fetch available system voices
            tts?.voices?.let { voiceSet ->
                val voiceNames = voiceSet
                    .filter { !it.isNetworkConnectionRequired }
                    .map { it.name }
                    .sorted()
                _availableVoices.value = voiceNames
            }

            tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                override fun onStart(utteranceId: String?) {
                    _isSpeaking.value = true
                }

                override fun onDone(utteranceId: String?) {
                    _isSpeaking.value = false
                    if (utteranceId != "test_sample_utterance") {
                        onSpeechCompleted?.invoke()
                    }
                }

                @Deprecated("Deprecated in Java")
                override fun onError(utteranceId: String?) {
                    _isSpeaking.value = false
                }

                override fun onError(utteranceId: String?, errorCode: Int) {
                    _isSpeaking.value = false
                }
            })
        }
    }

    fun speak(text: String, settings: VoiceSettings, utteranceId: String = "mako_response") {
        if (!isInitialized || tts == null) return

        stop()

        tts?.apply {
            setSpeechRate(settings.speechRate)
            setPitch(settings.speechPitch)

            if (settings.deviceVoiceName.isNotBlank()) {
                voices?.find { it.name == settings.deviceVoiceName }?.let { selectedVoice ->
                    voice = selectedVoice
                }
            }

            val params = Bundle()
            speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId)
        }
    }

    fun playSample(settings: VoiceSettings) {
        val sampleText = if (settings.voiceEngine == "gemini") {
            "Hello traveler! I am Mako using the ${settings.geminiVoice} voice persona. Ready to plan your journey!"
        } else {
            "Hello traveler! I am speaking with your device's offline speech engine at ${String.format("%.1f", settings.speechRate)}x speed."
        }
        speak(sampleText, settings, utteranceId = "test_sample_utterance")
    }

    fun stop() {
        if (isInitialized && tts?.isSpeaking == true) {
            tts?.stop()
        }
        _isSpeaking.value = false
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
    }
}
