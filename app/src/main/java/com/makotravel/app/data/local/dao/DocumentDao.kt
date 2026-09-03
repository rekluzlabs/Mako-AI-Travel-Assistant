package com.makotravel.app.data.local.dao

import androidx.room.*
import com.makotravel.app.data.local.entity.TravelDocumentEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DocumentDao {
    @Query("SELECT * FROM travel_documents ORDER BY createdAt DESC")
    fun getAllDocuments(): Flow<List<TravelDocumentEntity>>

    @Query("SELECT * FROM travel_documents WHERE id = :id LIMIT 1")
    suspend fun getDocumentById(id: String): TravelDocumentEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDocument(doc: TravelDocumentEntity)

    @Delete
    suspend fun deleteDocument(doc: TravelDocumentEntity)
}
