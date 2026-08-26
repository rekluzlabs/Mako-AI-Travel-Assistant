# MAKO Travel AI & Offline Packing Assistant

Mako Travel AI & Offline Packing Assistant is an offline-first travel companion built with React, TypeScript, Tailwind CSS, and Google Gemini. It handles trip planning, packing, document storage, photo capture, and emergency medical profiles in one app.

## 1. Packing List & Gear Manager

- **Categories:** Clothing, Toiletries, Electronics, Documents, Health & Meds, Weather Gear, and Miscellaneous.
- **Luggage assignment:** Sort and filter items across Carry-on, Checked Bag, or Personal Item.
- **Batch operations:** Select all or deselect all per category, and delete a whole category with a confirmation step.
- **Priority and weight tracking:** Mark items Essential, Recommended, or Optional, and log gear weight in grams or kilograms with live luggage capacity totals.
- **Packing presets:** One-click templates for Beach Vacations, Cold-Weather Ski Trips, Business Trips, Backpacking & Hiking, Weekend Getaways, and International Long-Hauls.
- **Multi-list archiving:** Save the current packing state as a snapshot and load a different list for another trip.

## 2. Camera Capture & Photo Snapping

- **Camera integration:** Snap photos with a laptop webcam or phone camera, with framing guides, preview, and retake.
- **Gallery fallback:** Drag and drop or select images from your gallery when the camera isn't available.
- **Photo tagging categories:**
  - Documents and tickets: passports, boarding passes, train tickets, hotel confirmations, parking stubs.
  - Medications: prescription labels, dosage schedules, doctor instructions for customs and travel clinics.
  - Travel companions: reference photos for co-travelers and emergency contacts.
  - Gear and valuables: baggage contents for insurance claims.
- **Lightbox viewer:** Full-screen image view with zoom and pinch.

## 3. Emergency Contacts & Medical Safety Hub

Found under the Emergency & ICE tab.

- **ICE profiles:** Primary and secondary emergency contacts with relationship, phone numbers, backup numbers, email, and address. One-tap dialing.
- **Medical card:** Blood type, severe allergies, and health insurance policy numbers.
- **Travel companion directory:** Mobile numbers, passport numbers, room numbers, and photos for each companion.
- **Medication records:** Active medications, frequency, prescribing physician, Rx numbers, and pill bottle photos. Life-saving medications like EpiPens and insulin can be flagged for carry-on priority.
- **Destination emergency numbers:** Local police, ambulance, and fire dispatch numbers for countries including Japan, the US, UK, France, Germany, Italy, Spain, Australia, and Thailand.

## 4. Document Vault

- **Offline storage:** PDFs, images, text files, and booking confirmations stored on-device using IndexedDB and LocalStorage.
- **AI document scanning:** When online, parse booking codes, departure gates, hotel check-in times, and seat numbers from raw tickets.
- **File management:** Filter by category (Tickets & Boarding Passes, Hotel Reservations, Passports & IDs, Insurance & Medical, Car Rentals), pin key documents, and export files locally.

## 5. AI Travel Planner (Gemini)

- **Itinerary planning:** Day-by-day itineraries based on destination, climate, and trip length.
- **Packing recommendations:** Ask for climate-specific gear, like power adapters for a given country.
- **Direct item injection:** The AI can add suggested items straight to your packing list.

## 6. Trip Itinerary & Countdown Dashboard

- **Trip details:** Destination, departure date, return date, traveler count.
- **Countdown timer:** Days, hours, and minutes until departure.
- **Weather modes:** Warm/Sunny, Cold/Snow, Tropical/Humid, or Rainy/Monsoon, which adjust packing suggestions.
- **Scratchpad:** Free-form notes for flight numbers, reservation codes, and itinerary highlights.
- **Trip reset:** Clear trip data without a browser popup.

## 7. Offline Resilience & Data Portability

- **Offline-first:** Packing lists, emergency contacts, medications, notes, and documents all work without a connection.
- **Offline simulation toggle:** Test app behavior in airplane mode or while roaming.
- **JSON backup and restore:** Export your full travel profile, packing lists, contacts, and settings to one JSON file.
- **CSV export:** Download packing checklists as CSV files for printing or sharing.

## 8. Addon Modules

Toggle these on or off in the Addons Manager:

- **Flight & Transit Mode:** Airport security checklist items.
- **Budget & Currency Tracker:** Cost estimation and spending notes.
- **Weather Advisory Alerts:** Destination weather forecasts.
- **Multi-Bag Weight Optimizer:** Baggage scale calculations to avoid excess fees.

## Software & Technology Used

This repo contains two versions of the app, built with different approaches.

### Version 1: Web App (React + TypeScript)

**Frontend**
- React 19 & TypeScript — component-driven UI architecture with full type safety
- Vite — build tool and development server
- Tailwind CSS (`@tailwindcss/vite`) — utility-first styling for responsive layouts
- Lucide React — iconography
- Canvas-Confetti — reward animations on completed packing lists

**Backend & Server**
- Node.js with Express — server-side API endpoints (`/api/*`) for AI chat completions, document processing, and proxying
- `@google/genai` (Gemini 2.5 Flash) — itinerary generation, vision scanning for tickets/vouchers, multimodal document analysis

**Offline & Storage**
- IndexedDB (`idb-keyval`) & LocalStorage — client-side storage for packing lists, scanned documents, and emergency contacts
- Web Speech API & Web Audio API — browser-native voice recognition, "OK Mako" wake-word detection, and text-to-speech feedback

> Note: voice recognition relies on the Web Speech API, which is Chrome/Chromium-only — it does not work in Firefox. This applies to both versions below, since they share the same React frontend.

### Version 2: Android Studio Build (Capacitor + Native Android Integration)

Based on the Capacitor project structure, build configurations, and native plugins, the Android Studio environment for this application integrates the following software components, libraries, and frameworks alongside the React frontend above:

- **Capacitor Core & Android Bridge** (`@capacitor/core`, `@capacitor/android`) — provides the native runtime container and JavaScript-to-Native bridge that connects the React web frontend to the underlying Android OS
- **Capacitor Plugins:**
  - `capacitor-voice-recorder` — handles native Android microphone access and audio recording for the AI voice companion
  - `@capacitor/dialog` — triggers native Android system alert dialogs and prompts from JavaScript
  - `@capacitor/assets` — command-line asset tool used to downscale, crop, and generate multi-density launcher icons and splash screen image assets (`mdpi` through `xxxhdpi`)
- **Android Gradle Plugin (AGP) & Gradle** — the native build automation system used inside Android Studio to compile Java/Kotlin sources, package web assets from `assets/public`, manage dependencies, and output signed `.apk` / `.aab` binaries
- **ProGuard / R8** — code shrinking, obfuscation, and optimization engine used during the release build phase to process native code dependencies and optimize binary file size
- **Android SDK & AndroidX Libraries** — modern native Android platform APIs, support libraries, and activity contracts used by Capacitor to run the native `WebView` host inside `MainActivity`
