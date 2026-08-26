# MAKO AI TravelBot & Offline Packing Assistant

TravelBot & Offline Packing Assistant is an offline-first travel companion built with React, TypeScript, Tailwind CSS, and Google Gemini. It handles trip planning, packing, document storage, photo capture, and emergency medical profiles in one app.

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
