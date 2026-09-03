package com.makotravel.app.ui.viewmodel

import android.app.Application
import android.graphics.Bitmap
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.makotravel.app.MakoApplication
import com.makotravel.app.data.local.entity.TravelDocumentEntity
import com.makotravel.app.data.remote.GeminiTravelService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

class DocumentViewModel(application: Application) : AndroidViewModel(application) {
    private val database = (application as MakoApplication).database
    private val documentDao = database.documentDao()
    private val geminiService = GeminiTravelService()

    val documents: StateFlow<List<TravelDocumentEntity>> = documentDao.getAllDocuments()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _isScanning = MutableStateFlow(false)
    val isScanning: StateFlow<Boolean> = _isScanning.asStateFlow()

    fun addDocument(title: String, type: String, refNumber: String, expiry: String, notes: String) {
        val newDoc = TravelDocumentEntity(
            id = UUID.randomUUID().toString(),
            title = title.ifBlank { "$type Document" },
            type = type,
            referenceNumber = refNumber,
            expirationDate = expiry,
            notes = notes
        )
        viewModelScope.launch {
            documentDao.insertDocument(newDoc)
        }
    }

    fun scanAndSaveDocument(bitmap: Bitmap, defaultType: String = "Ticket") {
        viewModelScope.launch {
            _isScanning.value = true
            try {
                val extracted = geminiService.analyzeDocumentImage(bitmap)
                val newDoc = TravelDocumentEntity(
                    id = UUID.randomUUID().toString(),
                    title = "Scanned $defaultType",
                    type = defaultType,
                    extractedText = extracted,
                    notes = "AI Scanned OCR record"
                )
                documentDao.insertDocument(newDoc)
            } finally {
                _isScanning.value = false
            }
        }
    }

    fun deleteDocument(doc: TravelDocumentEntity) {
        viewModelScope.launch {
            documentDao.deleteDocument(doc)
        }
    }
}
