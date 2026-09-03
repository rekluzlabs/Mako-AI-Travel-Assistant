package com.makotravel.app.data.remote

import android.graphics.Bitmap
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.makotravel.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GeminiTravelService {
    private val apiKey: String = BuildConfig.GEMINI_API_KEY

    private val travelAssistantModel by lazy {
        GenerativeModel(
            modelName = "gemini-1.5-flash",
            apiKey = apiKey,
            systemInstruction = content {
                text(
                    """
                    You are "Mako", an intelligent, friendly, highly versatile travel companion, smart packing advisor, and itinerary planner.
                    You specialize in:
                    1. Detailed day-by-day travel planning, destinations, culture, safety, food, and logistics.
                    2. Weather-adaptive clothing recommendations and seasonal packing guidance.
                    3. Airport security rules, TSA guidelines, baggage weight optimization, and document checklists.
                    Format your answers cleanly using Markdown formatting with bullet points and bold section titles.
                    """.trimIndent()
                )
            }
        )
    }

    private val visionModel by lazy {
        GenerativeModel(
            modelName = "gemini-1.5-flash",
            apiKey = apiKey
        )
    }

    suspend fun generateChatResponse(userPrompt: String, contextInfo: String = ""): String {
        return withContext(Dispatchers.IO) {
            if (apiKey.isBlank() || apiKey == "your_gemini_api_key_here") {
                return@withContext "⚠️ Gemini API Key not configured. Please add your key to local.properties (e.g. GEMINI_API_KEY=AIzaSy...).\n\nIn the meantime, your offline packing lists, weight estimator, TSA handbook, and document vault are completely functional!"
            }

            try {
                val fullPrompt = if (contextInfo.isNotBlank()) {
                    "[Current Trip Context: $contextInfo]\n\nUser Question: $userPrompt"
                } else {
                    userPrompt
                }

                val response = travelAssistantModel.generateContent(fullPrompt)
                response.text ?: "I couldn't generate a response. Please try again."
            } catch (e: Exception) {
                "Error connecting to Mako AI: ${e.localizedMessage ?: "Unknown error"}"
            }
        }
    }

    suspend fun analyzeDocumentImage(bitmap: Bitmap, prompt: String = "Analyze this travel document, ticket, or passport. Extract the document title, type, reference number, dates, and any essential packing or travel warnings."): String {
        return withContext(Dispatchers.IO) {
            if (apiKey.isBlank() || apiKey == "your_gemini_api_key_here") {
                return@withContext "⚠️ Gemini API key required for AI OCR document scanning."
            }
            try {
                val inputContent = content {
                    image(bitmap)
                    text(prompt)
                }
                val response = visionModel.generateContent(inputContent)
                response.text ?: "No details extracted from document image."
            } catch (e: Exception) {
                "OCR analysis failed: ${e.localizedMessage}"
            }
        }
    }
}
