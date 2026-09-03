package com.makotravel.app

import android.app.Application
import com.makotravel.app.data.local.MakoDatabase
import com.makotravel.app.data.local.entity.EmergencyContactEntity
import com.makotravel.app.data.local.entity.PackingItemEntity
import com.makotravel.app.data.local.entity.PackingListEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.UUID

class MakoApplication : Application() {
    val database: MakoDatabase by lazy { MakoDatabase.getDatabase(this) }

    override fun onCreate() {
        super.onCreate()
        seedInitialDataIfEmpty()
    }

    private fun seedInitialDataIfEmpty() {
        CoroutineScope(Dispatchers.IO).launch {
            val packingDao = database.packingDao()
            val contactDao = database.emergencyContactDao()

            // Seed default emergency contacts if none exist
            contactDao.insertContacts(
                listOf(
                    EmergencyContactEntity(
                        id = "contact-us-embassy",
                        name = "U.S. Embassy / Citizen Services",
                        role = "Embassy",
                        phoneNumber = "+1-202-501-4444",
                        notes = "24/7 Worldwide Emergency Assistance"
                    ),
                    EmergencyContactEntity(
                        id = "contact-global-sos",
                        name = "Universal Travel SOS (Police & Medical)",
                        role = "Local Police",
                        phoneNumber = "112",
                        notes = "Universal emergency number in Europe and worldwide GSM networks"
                    ),
                    EmergencyContactEntity(
                        id = "contact-travel-insurance",
                        name = "Allianz Global Assistance",
                        role = "Insurance",
                        phoneNumber = "+1-800-654-1908",
                        notes = "Medical evacuation & luggage claim emergency line"
                    )
                )
            )

            // Seed default initial packing list if none exist
            val listId = "default-paris-trip"
            packingDao.insertList(
                PackingListEntity(
                    id = listId,
                    title = "Paris Spring Getaway",
                    destination = "Paris, France",
                    startDate = "2026-09-15",
                    endDate = "2026-09-22",
                    tripType = "leisure",
                    season = "Spring",
                    baggageAllowanceKg = 23.0,
                    carryOnAllowanceKg = 10.0
                )
            )

            val defaultItems = listOf(
                PackingItemEntity(UUID.randomUUID().toString(), listId, "Passport & Visa copies", "Documents", 1, 100.0, false, true, "Keep in personal bag", "Personal"),
                PackingItemEntity(UUID.randomUUID().toString(), listId, "Universal Power Adapter", "Electronics", 1, 150.0, false, true, "Type C / E for France", "CarryOn"),
                PackingItemEntity(UUID.randomUUID().toString(), listId, "Noise-Cancelling Headphones", "Electronics", 1, 250.0, false, false, "", "CarryOn"),
                PackingItemEntity(UUID.randomUUID().toString(), listId, "Walking Shoes", "Clothes", 1, 800.0, false, true, "Break in before trip", "Checked"),
                PackingItemEntity(UUID.randomUUID().toString(), listId, "Waterproof Trench Coat", "Clothes", 1, 600.0, false, true, "Paris spring showers", "Checked"),
                PackingItemEntity(UUID.randomUUID().toString(), listId, "Prescription Medications", "Medications", 1, 120.0, false, true, "Keep in original packaging", "CarryOn"),
                PackingItemEntity(UUID.randomUUID().toString(), listId, "TSA 3-1-1 Toiletry Bag", "Toiletries", 1, 350.0, false, true, "Max 100ml containers", "CarryOn"),
                PackingItemEntity(UUID.randomUUID().toString(), listId, "Portable Power Bank (10,000mAh)", "Electronics", 1, 220.0, false, true, "MUST be in carry-on (TSA rule)", "CarryOn")
            )
            packingDao.insertItems(defaultItems)
        }
    }
}
