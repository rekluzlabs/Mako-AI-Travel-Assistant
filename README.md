# Mako Travel - Android (Kotlin + Jetpack Compose)

A pure Kotlin, offline-first Android application built with Jetpack Compose, Room Database, and the Google Gemini Generative AI SDK.

## Features
- **Mako AI Travel Planner**: Gemini 1.5 Flash assistant for itineraries, packing advice, and local insights.
- **Two-Way Voice Conversation & Speech Settings**:
  - **"OK Mako" Wake Word Mode**: Hands-free voice activation.
  - **Auto-Speak Assistant Responses**: Text-To-Speech (TTS) automatically reads aloud new answers.
  - **Hands-Free Follow-up Listening**: Automatically opens the microphone after Mako finishes speaking.
  - **Dual Voice Engines**: Switch between **Gemini Neural Cloud Voices** (Kore, Puck, Fenrir, Zephyr, Charon) and **100% Offline Device TTS**.
  - **Speech Speed & Pitch Controls**: Custom playback rates from 0.8x to 1.4x with live sample testing.
- **Offline Interactive Packing Checklist**: Room Database persistence with category tags, weight calculation, and progress tracking.
- **Encrypted Document Vault**: Store tickets, vouchers, and passports with Gemini Vision OCR scanning.
- **Airport & TSA Security Handbook**: Offline aviation guidelines, 3-1-1 liquids rule, and lithium battery safety.

## How to Run in Android Studio
1. Open **Android Studio** (Ladybug / Iguana or newer).
2. Click **Open** and select this root repository folder.
3. Add your Gemini API Key in `local.properties`:
   ```properties
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```
4. Click **Sync Project with Gradle Files**.
5. Connect your Android device or start an emulator and click **Run** (`Shift + F10`).
