package com.makotravel.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.makotravel.app.data.local.entity.PackingItemEntity
import com.makotravel.app.ui.viewmodel.PackingViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PackingListScreen(
    packingViewModel: PackingViewModel
) {
    val lists by packingViewModel.allLists.collectAsState()
    val selectedListId by packingViewModel.selectedListId.collectAsState()
    val items by packingViewModel.currentItems.collectAsState()

    var showAddItemDialog by remember { mutableStateOf(false) }
    var newItemName by remember { mutableStateOf("") }
    var newItemCategory by remember { mutableStateOf("Clothes") }
    var newItemBagType by remember { mutableStateOf("CarryOn") }
    var newItemWeight by remember { mutableStateOf("200") }
    var newItemEssential by remember { mutableStateOf(false) }

    val packedCount = items.count { it.isPacked }
    val totalCount = items.size
    val progress = if (totalCount > 0) packedCount.toFloat() / totalCount else 0f
    val totalWeightKg = items.sumOf { it.weightGrams } / 1000.0

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Packing Checklist", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text(
                            text = if (totalCount > 0) "$packedCount of $totalCount packed • ${String.format("%.1f", totalWeightKg)} kg total" else "No items yet",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddItemDialog = true },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Packing Item")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Progress Bar Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Trip Readiness", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                        Text("${(progress * 100).toInt()}%", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp),
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = Color.LightGray.copy(alpha = 0.4f)
                    )
                }
            }

            // Items List
            if (items.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "No items in this checklist.\nTap + below to add travel essentials!",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        fontSize = 15.sp
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(items, key = { it.id }) { item ->
                        PackingItemRow(
                            item = item,
                            onTogglePacked = { packingViewModel.toggleItemPacked(item) },
                            onDelete = { packingViewModel.deleteItem(item) }
                        )
                    }
                }
            }
        }

        // Add Item Dialog
        if (showAddItemDialog) {
            AlertDialog(
                onDismissRequest = { showAddItemDialog = false },
                title = { Text("Add Packing Item") },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = newItemName,
                            onValueChange = { newItemName = it },
                            label = { Text("Item Name (e.g. Passport, Jacket)") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = newItemWeight,
                            onValueChange = { newItemWeight = it },
                            label = { Text("Est. Weight (grams)") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Checkbox(
                                checked = newItemEssential,
                                onCheckedChange = { newItemEssential = it }
                            )
                            Text("Must-not-forget essential")
                        }
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            val weight = newItemWeight.toDoubleOrNull() ?: 200.0
                            packingViewModel.addItem(
                                name = newItemName,
                                category = newItemCategory,
                                bagType = newItemBagType,
                                weightGrams = weight,
                                isEssential = newItemEssential
                            )
                            newItemName = ""
                            showAddItemDialog = false
                        }
                    ) {
                        Text("Add Item")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showAddItemDialog = false }) {
                        Text("Cancel")
                    }
                }
            )
        }
    }
}

@Composable
fun PackingItemRow(
    item: PackingItemEntity,
    onTogglePacked: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (item.isPacked) MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f) else MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(if (item.isPacked) 0.dp else 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = item.isPacked,
                onCheckedChange = { onTogglePacked() }
            )

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 8.dp)
            ) {
                Text(
                    text = item.name,
                    fontWeight = FontWeight.Medium,
                    fontSize = 16.sp,
                    textDecoration = if (item.isPacked) TextDecoration.LineThrough else TextDecoration.None,
                    color = if (item.isPacked) MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f) else MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "${item.category} • ${item.bagType} • ${(item.weightGrams).toInt()}g",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
            }

            IconButton(onClick = onDelete) {
                Icon(
                    Icons.Default.Delete,
                    contentDescription = "Delete Item",
                    tint = Color.Gray.copy(alpha = 0.7f)
                )
            }
        }
    }
}
