package com.makotravel.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.makotravel.app.data.local.dao.*
import com.makotravel.app.data.local.entity.*

@Database(
    entities = [
        PackingListEntity::class,
        PackingItemEntity::class,
        TravelDocumentEntity::class,
        EmergencyContactEntity::class,
        ChatMessageEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class MakoDatabase : RoomDatabase() {
    abstract fun packingDao(): PackingDao
    abstract fun documentDao(): DocumentDao
    abstract fun emergencyContactDao(): EmergencyContactDao
    abstract fun chatDao(): ChatDao

    companion object {
        @Volatile
        private var INSTANCE: MakoDatabase? = null

        fun getDatabase(context: Context): MakoDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    MakoDatabase::class.java,
                    "mako_travel_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
