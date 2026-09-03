package com.makotravel.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AirportHandbookScreen() {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Airport & TSA Offline Handbook", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("International aviation rules & safety regulations", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f))
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                HandbookCard(
                    title = "💧 Liquids 3-1-1 Carry-On Rule",
                    category = "Carry-On Requirement",
                    description = "• 3.4 ounces (100ml) or smaller container per item.\n• 1 quart-sized clear zip-top bag holding all liquid containers.\n• 1 bag per passenger placed in the screening bin.\n*Exceptions*: Medically necessary liquids and baby formula are permitted in reasonable quantities with declaration."
                )
            }

            item {
                HandbookCard(
                    title = "🔋 Lithium-ion Batteries & Power Banks",
                    category = "Safety Prohibition",
                    description = "• Power banks and spare loose lithium batteries MUST be carried in CARRY-ON baggage only.\n• Strictly FORBIDDEN in checked baggage due to fire hazard.\n• Maximum rating allowed: 100 Watt-hours (Wh) without prior airline approval."
                )
            }

            item {
                HandbookCard(
                    title = "💊 Prescription Medications",
                    category = "Health & Customs",
                    description = "• Keep all prescription pills and injectables in their original pharmacy packaging with patient name.\n• Always pack critical medication in your personal carry-on, never in checked luggage in case of delays."
                )
            }

            item {
                HandbookCard(
                    title = "⚖️ Standard Airline Baggage Weight Limits",
                    category = "Luggage Allowances",
                    description = "• Carry-On: typically 7kg to 10kg (15-22 lbs).\n• Economy Checked: 23kg (50 lbs) per bag.\n• Business / First: 32kg (70 lbs) per bag.\n*Tip*: Weigh your bag before leaving to avoid steep overweight airport surcharges."
                )
            }
        }
    }
}

@Composable
fun HandbookCard(
    title: String,
    category: String,
    description: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = category.uppercase(),
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = description,
                fontSize = 14.sp,
                lineHeight = 20.sp,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
            )
        }
    }
}
