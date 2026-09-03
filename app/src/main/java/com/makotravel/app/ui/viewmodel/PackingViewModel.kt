package com.makotravel.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.makotravel.app.MakoApplication
import com.makotravel.app.data.local.entity.PackingItemEntity
import com.makotravel.app.data.local.entity.PackingListEntity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

class PackingViewModel(application: Application) : AndroidViewModel(application) {
    private val database = (application as MakoApplication).database
    private val packingDao = database.packingDao()

    val allLists: StateFlow<List<PackingListEntity>> = packingDao.getAllLists()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _selectedListId = MutableStateFlow<String?>(null)
    val selectedListId: StateFlow<String?> = _selectedListId.asStateFlow()

    val currentItems: StateFlow<List<PackingItemEntity>> = _selectedListId
        .flatMapLatest { listId ->
            if (listId != null) packingDao.getItemsForList(listId) else flowOf(emptyList())
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        viewModelScope.launch {
            allLists.collect { lists ->
                if (_selectedListId.value == null && lists.isNotEmpty()) {
                    _selectedListId.value = lists.first().id
                }
            }
        }
    }

    fun selectList(listId: String) {
        _selectedListId.value = listId
    }

    fun toggleItemPacked(item: PackingItemEntity) {
        viewModelScope.launch {
            packingDao.setItemPacked(item.id, !item.isPacked)
        }
    }

    fun addItem(name: String, category: String, bagType: String, weightGrams: Double, isEssential: Boolean) {
        val listId = _selectedListId.value ?: return
        if (name.isBlank()) return

        val newItem = PackingItemEntity(
            id = UUID.randomUUID().toString(),
            listId = listId,
            name = name.trim(),
            category = category,
            weightGrams = weightGrams,
            isEssential = isEssential,
            bagType = bagType
        )
        viewModelScope.launch {
            packingDao.insertItem(newItem)
        }
    }

    fun deleteItem(item: PackingItemEntity) {
        viewModelScope.launch {
            packingDao.deleteItem(item)
        }
    }

    fun createNewList(title: String, destination: String, tripType: String, season: String) {
        val newList = PackingListEntity(
            id = UUID.randomUUID().toString(),
            title = title.ifBlank { "$destination Trip" },
            destination = destination.ifBlank { "Unspecified" },
            startDate = "2026-10-01",
            endDate = "2026-10-08",
            tripType = tripType,
            season = season
        )
        viewModelScope.launch {
            packingDao.insertList(newList)
            _selectedListId.value = newList.id
        }
    }
}
