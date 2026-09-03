package com.makotravel.app.data.local.dao

import androidx.room.*
import com.makotravel.app.data.local.entity.PackingItemEntity
import com.makotravel.app.data.local.entity.PackingListEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PackingDao {
    @Query("SELECT * FROM packing_lists WHERE isArchived = 0 ORDER BY createdAt DESC")
    fun getAllLists(): Flow<List<PackingListEntity>>

    @Query("SELECT * FROM packing_lists WHERE id = :id LIMIT 1")
    fun getListById(id: String): Flow<PackingListEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertList(list: PackingListEntity)

    @Update
    suspend fun updateList(list: PackingListEntity)

    @Delete
    suspend fun deleteList(list: PackingListEntity)

    // Items
    @Query("SELECT * FROM packing_items WHERE listId = :listId ORDER BY isPacked ASC, category ASC")
    fun getItemsForList(listId: String): Flow<List<PackingItemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItem(item: PackingItemEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertItems(items: List<PackingItemEntity>)

    @Update
    suspend fun updateItem(item: PackingItemEntity)

    @Delete
    suspend fun deleteItem(item: PackingItemEntity)

    @Query("UPDATE packing_items SET isPacked = :isPacked WHERE id = :id")
    suspend fun setItemPacked(id: String, isPacked: Boolean)

    @Query("DELETE FROM packing_items WHERE listId = :listId")
    suspend fun clearItemsForList(listId: String)
}
