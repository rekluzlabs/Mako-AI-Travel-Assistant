package com.makotravel.app.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "packing_items",
    foreignKeys = [
        ForeignKey(
            entity = PackingListEntity::class,
            parentColumns = ["id"],
            childColumns = ["listId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index(value = ["listId"])]
)
data class PackingItemEntity(
    @PrimaryKey val id: String,
    val listId: String,
    val name: String,
    val category: String, // "Clothes", "Toiletries", "Electronics", "Documents", "Medications", "Gear"
    val quantity: Int = 1,
    val weightGrams: Double = 0.0,
    val isPacked: Boolean = false,
    val isEssential: Boolean = false,
    val notes: String = "",
    val bagType: String = "Checked" // "Checked", "CarryOn", "Personal"
)
