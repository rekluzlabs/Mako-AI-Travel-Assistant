package com.makotravel.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "packing_lists")
data class PackingListEntity(
    @PrimaryKey val id: String,
    val title: String,
    val destination: String,
    val startDate: String,
    val endDate: String,
    val tripType: String, // "leisure", "business", "hiking", "beach", etc.
    val season: String,
    val baggageAllowanceKg: Double = 23.0,
    val carryOnAllowanceKg: Double = 8.0,
    val isArchived: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)
