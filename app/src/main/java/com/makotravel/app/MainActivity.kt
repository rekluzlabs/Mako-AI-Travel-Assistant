package com.makotravel.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognizerIntent
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Checklist
import androidx.compose.material.icons.filled.Flight
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.makotravel.app.ui.screens.AirportHandbookScreen
import com.makotravel.app.ui.screens.ChatScreen
import com.makotravel.app.ui.screens.DocumentVaultScreen
import com.makotravel.app.ui.screens.PackingListScreen
import com.makotravel.app.ui.theme.MakoTravelTheme
import com.makotravel.app.ui.viewmodel.ChatViewModel
import com.makotravel.app.ui.viewmodel.DocumentViewModel
import com.makotravel.app.ui.viewmodel.PackingViewModel
import com.makotravel.app.ui.viewmodel.VoiceSettingsViewModel
import kotlinx.coroutines.flow.collectLatest
import java.util.Locale

class MainActivity : ComponentActivity() {

    private val chatViewModel: ChatViewModel by viewModels()
    private val packingViewModel: PackingViewModel by viewModels()
    private val documentViewModel: DocumentViewModel by viewModels()
    private val voiceSettingsViewModel: VoiceSettingsViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            MakoTravelTheme {
                val navController = rememberNavController()
                val voiceSettings by voiceSettingsViewModel.voiceSettings.collectAsState()

                // Speech Recognizer Launcher for Hands-Free Voice
                val speechLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.StartActivityForResult()
                ) { result ->
                    if (result.resultCode == RESULT_OK) {
                        val spokenText = result.data
                            ?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                            ?.firstOrNull()
                        if (!spokenText.isNullOrBlank()) {
                            chatViewModel.sendMessage(spokenText)
                        }
                    }
                }

                // Audio permission launcher
                val audioPermissionLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestPermission()
                ) { isGranted ->
                    if (isGranted) {
                        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                            putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak to Mako...")
                        }
                        speechLauncher.launch(intent)
                    }
                }

                fun launchVoiceInput() {
                    if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
                            putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak to Mako...")
                        }
                        speechLauncher.launch(intent)
                    } else {
                        audioPermissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                    }
                }

                // Listen for assistant auto-speech trigger
                LaunchedEffect(Unit) {
                    chatViewModel.speakEvent.collectLatest { (speechText, settings) ->
                        voiceSettingsViewModel.speechManager.speak(speechText, settings)
                    }
                }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        val navBackStackEntry by navController.currentBackStackEntryAsState()
                        val currentDestination = navBackStackEntry?.destination

                        NavigationBar {
                            NavigationBarItem(
                                icon = { Icon(Icons.Default.Chat, contentDescription = "Chat") },
                                label = { Text("Mako AI") },
                                selected = currentDestination?.route == "chat",
                                onClick = {
                                    navController.navigate("chat") {
                                        popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            )
                            NavigationBarItem(
                                icon = { Icon(Icons.Default.Checklist, contentDescription = "Packing") },
                                label = { Text("Packing") },
                                selected = currentDestination?.route == "packing",
                                onClick = {
                                    navController.navigate("packing") {
                                        popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            )
                            NavigationBarItem(
                                icon = { Icon(Icons.Default.Folder, contentDescription = "Vault") },
                                label = { Text("Vault") },
                                selected = currentDestination?.route == "vault",
                                onClick = {
                                    navController.navigate("vault") {
                                        popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            )
                            NavigationBarItem(
                                icon = { Icon(Icons.Default.Flight, contentDescription = "Handbook") },
                                label = { Text("Handbook") },
                                selected = currentDestination?.route == "handbook",
                                onClick = {
                                    navController.navigate("handbook") {
                                        popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            )
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = "chat",
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable("chat") {
                            ChatScreen(
                                chatViewModel = chatViewModel,
                                voiceSettingsViewModel = voiceSettingsViewModel,
                                onVoiceClick = { launchVoiceInput() }
                            )
                        }
                        composable("packing") {
                            PackingListScreen(
                                packingViewModel = packingViewModel
                            )
                        }
                        composable("vault") {
                            DocumentVaultScreen(
                                documentViewModel = documentViewModel
                            )
                        }
                        composable("handbook") {
                            AirportHandbookScreen()
                        }
                    }
                }
            }
        }
    }
}
