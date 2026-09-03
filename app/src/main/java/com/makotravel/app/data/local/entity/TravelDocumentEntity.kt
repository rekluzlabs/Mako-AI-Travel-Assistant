package com.makotravel.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "travel_documents")
data class TravelDocumentEntity(
    @PrimaryKey val id: String,
    val title: String,
    val type: String, // "Passport", "Visa", "Flight", "Hotel", "Insurance", "Ticket", "Prescription", "Other"
    val referenceNumber: String = "",
    val expirationDate: String = "",
    val notes: String = "",
    val localFilePath: String = "",
    val imageBase64: String = "",
    val extractedText: String = "",
    val isEncrypted: Boolean = true,
    val createdAt: Long = System.currentTimeMillis()
)
