package com.makotravel.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "emergency_contacts")
data class EmergencyContactEntity(
    @PrimaryKey val id: String,
    val name: String,
    val role: String, // "Embassy", "Local Police", "Ambulance", "Hotel Concierge", "Family", "Insurance"
    val phoneNumber: String,
    val address: String = "",
    val notes: String = "",
    val country: String = ""
)
