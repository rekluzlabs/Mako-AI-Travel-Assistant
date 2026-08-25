import { PackingItem, TripInfo, AddonModule, PackingTemplate, EmergencyContact, MedicationRecord, LocalEmergencyNumbers } from '../types';

const STORAGE_KEYS = {
  PACKING_LIST: 'travelbot_packing_list_v1',
  TRIP_INFO: 'travelbot_trip_info_v1',
  ADDONS: 'travelbot_addons_v1',
  CHAT_MESSAGES: 'travelbot_chat_messages_v1',
  USER_PREFS: 'travelbot_user_prefs_v1',
  EMERGENCY_CONTACTS: 'travelbot_emergency_contacts_v1',
  MEDICATIONS: 'travelbot_medications_v1',
};

export const DEFAULT_TRIP: TripInfo = {
  destination: 'Tokyo, Japan',
  departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  durationDays: 5,
  tripType: 'Corporate & Business Travel',
  climate: 'Mild / Professional (18°C / 64°F)',
  baggageAllowance: {
    carryOnLimitKg: 8,
    checkedLimitKg: 23,
  },
  notes: 'Business meetings, client presentations, and conference itinerary.'
};

export const EMPTY_TRIP: TripInfo = {
  destination: '',
  departureDate: '',
  returnDate: '',
  durationDays: 1,
  tripType: 'Vacation & Leisure',
  climate: 'Mild',
  baggageAllowance: {
    carryOnLimitKg: 7,
    checkedLimitKg: 23,
  },
  notes: ''
};

export const BUSINESS_TRAVEL_PACKING_LIST: PackingItem[] = [
  // --- CLOTHING ---
  {
    id: 'biz-c-1',
    name: 'Dress shirts / Dress pants',
    category: 'clothing',
    quantity: 4,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Ironed & wrinkle-protected for business meetings',
    weightGrams: 900,
    createdAt: Date.now() - 4000000,
  },
  {
    id: 'biz-c-2',
    name: 'Suits',
    category: 'clothing',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Garment bag or wrinkle-resistant fold',
    weightGrams: 1200,
    createdAt: Date.now() - 3950000,
  },
  {
    id: 'biz-c-3',
    name: 'Sport Coats',
    category: 'clothing',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Smart casual blazer for dinners',
    weightGrams: 700,
    createdAt: Date.now() - 3900000,
  },
  {
    id: 'biz-c-4',
    name: 'Ties / Suspenders',
    category: 'clothing',
    quantity: 3,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Silk ties & matching suspenders/clips',
    weightGrams: 150,
    createdAt: Date.now() - 3850000,
  },
  {
    id: 'biz-c-5',
    name: 'Dress shoes',
    category: 'clothing',
    quantity: 1,
    packed: true,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Polished oxfords / loafers',
    weightGrams: 800,
    createdAt: Date.now() - 3800000,
  },
  {
    id: 'biz-c-6',
    name: 'Belts',
    category: 'clothing',
    quantity: 2,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Black and brown leather belts',
    weightGrams: 220,
    createdAt: Date.now() - 3750000,
  },
  {
    id: 'biz-c-7',
    name: 'Casual shirts / T-shirts',
    category: 'clothing',
    quantity: 3,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Evenings and downtime',
    weightGrams: 450,
    createdAt: Date.now() - 3700000,
  },
  {
    id: 'biz-c-8',
    name: 'Casual pants / Shorts',
    category: 'clothing',
    quantity: 2,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Chinos and casual trousers',
    weightGrams: 600,
    createdAt: Date.now() - 3650000,
  },
  {
    id: 'biz-c-9',
    name: 'Underwear',
    category: 'clothing',
    quantity: 5,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Breathable fabric',
    weightGrams: 350,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'biz-c-10',
    name: 'Socks',
    category: 'clothing',
    quantity: 5,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Dress socks & casual socks',
    weightGrams: 250,
    createdAt: Date.now() - 3550000,
  },
  {
    id: 'biz-c-11',
    name: 'Sweaters',
    category: 'clothing',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'V-neck or cardigan layer',
    weightGrams: 350,
    createdAt: Date.now() - 3500000,
  },
  {
    id: 'biz-c-12',
    name: 'Jackets / Coats / Sweaters',
    category: 'clothing',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Weather appropriate outer layer',
    weightGrams: 650,
    createdAt: Date.now() - 3450000,
  },
  {
    id: 'biz-c-13',
    name: 'Pajamas / Robe / Slippers',
    category: 'clothing',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Sleepwear for hotel room',
    weightGrams: 300,
    createdAt: Date.now() - 3400000,
  },
  {
    id: 'biz-c-14',
    name: 'Casual shoes / Sandals',
    category: 'clothing',
    quantity: 1,
    packed: false,
    luggageType: 'checked',
    priority: 'recommended',
    notes: 'Comfortable off-duty footwear',
    weightGrams: 550,
    createdAt: Date.now() - 3350000,
  },
  {
    id: 'biz-c-15',
    name: 'Workout clothes / shoes',
    category: 'clothing',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'optional',
    notes: 'Gym gear for hotel fitness center',
    weightGrams: 500,
    createdAt: Date.now() - 3300000,
  },
  {
    id: 'biz-c-16',
    name: 'Swimwear',
    category: 'clothing',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'optional',
    notes: 'Hotel pool / sauna',
    weightGrams: 150,
    createdAt: Date.now() - 3250000,
  },
  {
    id: 'biz-c-17',
    name: 'Hats / Scarves / Gloves',
    category: 'clothing',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'optional',
    notes: 'Climate protection',
    weightGrams: 180,
    createdAt: Date.now() - 3200000,
  },
  {
    id: 'biz-c-18',
    name: 'Slippers',
    category: 'clothing',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'optional',
    notes: 'Indoor hotel comfort',
    weightGrams: 120,
    createdAt: Date.now() - 3150000,
  },
  {
    id: 'biz-c-19',
    name: 'Sunglasses clip on',
    category: 'clothing',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'optional',
    notes: 'UV eye protection',
    weightGrams: 40,
    createdAt: Date.now() - 3100000,
  },

  // --- BRIEFCASE / ELECTRONICS ---
  {
    id: 'biz-e-1',
    name: 'Cellphone and accessories (charger, bluetooth, case)',
    category: 'electronics',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Primary smartphone, charging cable, bluetooth headset',
    weightGrams: 280,
    createdAt: Date.now() - 3050000,
  },
  {
    id: 'biz-e-2',
    name: '2nd Phone (charger, extra battery, case)',
    category: 'electronics',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'recommended',
    notes: 'Work/backup device & spare battery pack',
    weightGrams: 300,
    createdAt: Date.now() - 3000000,
  },
  {
    id: 'biz-e-3',
    name: 'Tablet',
    category: 'electronics',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'recommended',
    notes: 'For slides, e-documents, flight reading',
    weightGrams: 480,
    createdAt: Date.now() - 2950000,
  },
  {
    id: 'biz-e-4',
    name: 'Smartwatch',
    category: 'electronics',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'recommended',
    notes: 'With magnetic charging cable',
    weightGrams: 80,
    createdAt: Date.now() - 2900000,
  },
  {
    id: 'biz-e-5',
    name: 'Company documents',
    category: 'documents',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Briefcase files, pitch decks, NDAs, contract copies',
    weightGrams: 300,
    createdAt: Date.now() - 2850000,
  },
  {
    id: 'biz-e-6',
    name: 'Flash drive(s)',
    category: 'electronics',
    quantity: 2,
    packed: false,
    luggageType: 'personal',
    priority: 'recommended',
    notes: 'Encrypted presentation backup drives',
    weightGrams: 30,
    createdAt: Date.now() - 2800000,
  },
  {
    id: 'biz-e-7',
    name: 'Headphones',
    category: 'electronics',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'recommended',
    notes: 'Noise-canceling for flight & conference calls',
    weightGrams: 200,
    createdAt: Date.now() - 2750000,
  },
  {
    id: 'biz-e-8',
    name: 'Meeting agenda / Itinerary',
    category: 'documents',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Detailed timetable and client contact sheet',
    weightGrams: 50,
    createdAt: Date.now() - 2700000,
  },

  // --- DOCUMENTATION ---
  {
    id: 'biz-d-1',
    name: 'Drivers License / ID',
    category: 'documents',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Valid photo ID for security & rental car',
    weightGrams: 20,
    createdAt: Date.now() - 2650000,
  },
  {
    id: 'biz-d-2',
    name: 'Visa / Passport',
    category: 'documents',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Valid passport and required business entry visas',
    weightGrams: 50,
    createdAt: Date.now() - 2600000,
  },
  {
    id: 'biz-d-3',
    name: 'Travel Itinerary',
    category: 'documents',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Flight & hotel booking confirmation printouts',
    weightGrams: 30,
    createdAt: Date.now() - 2550000,
  },
  {
    id: 'biz-d-4',
    name: 'Tickets',
    category: 'documents',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Boarding passes & train/transfer tickets',
    weightGrams: 20,
    createdAt: Date.now() - 2500000,
  },
  {
    id: 'biz-d-5',
    name: 'Maps',
    category: 'documents',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'optional',
    notes: 'Downloaded offline maps or city transit guide',
    weightGrams: 40,
    createdAt: Date.now() - 2450000,
  },
  {
    id: 'biz-d-6',
    name: 'Travel guide',
    category: 'documents',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'optional',
    notes: 'Local business etiquette & city guide',
    weightGrams: 150,
    createdAt: Date.now() - 2400000,
  },
  {
    id: 'biz-d-7',
    name: 'Money Belt / Wallet',
    category: 'documents',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Secure RFID-blocking wallet',
    weightGrams: 90,
    createdAt: Date.now() - 2350000,
  },

  // --- MONEY ---
  {
    id: 'biz-m-1',
    name: 'Company credit card',
    category: 'documents',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Corporate expense account card',
    weightGrams: 10,
    createdAt: Date.now() - 2300000,
  },
  {
    id: 'biz-m-2',
    name: 'Debit card / Credit card',
    category: 'documents',
    quantity: 2,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Primary personal payment cards',
    weightGrams: 20,
    createdAt: Date.now() - 2250000,
  },
  {
    id: 'biz-m-3',
    name: 'Cash',
    category: 'documents',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Local banknotes and currency',
    weightGrams: 20,
    createdAt: Date.now() - 2200000,
  },
  {
    id: 'biz-m-4',
    name: 'Change for Cab',
    category: 'documents',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'recommended',
    notes: 'Small bills and coins for airport transit & tips',
    weightGrams: 60,
    createdAt: Date.now() - 2150000,
  },
  {
    id: 'biz-m-5',
    name: 'Checks / Travelers checks',
    category: 'documents',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'optional',
    notes: 'Backup payment method',
    weightGrams: 30,
    createdAt: Date.now() - 2100000,
  },

  // --- TOILETRIES ---
  {
    id: 'biz-t-1',
    name: 'Toothbrush / Toothpaste',
    category: 'toiletries',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Travel toothbrush & TSA travel toothpaste (<100ml)',
    weightGrams: 100,
    createdAt: Date.now() - 2050000,
  },
  {
    id: 'biz-t-2',
    name: 'Dental floss / Picks / Mouthwash',
    category: 'toiletries',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Dental hygiene for meeting days',
    weightGrams: 120,
    createdAt: Date.now() - 2000000,
  },
  {
    id: 'biz-t-3',
    name: 'Glasses / Case / Contacts / Solution',
    category: 'toiletries',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Eyewear, spare contacts, travel saline solution',
    weightGrams: 160,
    createdAt: Date.now() - 1950000,
  },
  {
    id: 'biz-t-4',
    name: 'Deodorant',
    category: 'toiletries',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Solid / roll-on deodorant stick',
    weightGrams: 90,
    createdAt: Date.now() - 1900000,
  },
  {
    id: 'biz-t-5',
    name: 'Shampoo & Conditioner',
    category: 'toiletries',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Travel sized bottles (<100ml)',
    weightGrams: 150,
    createdAt: Date.now() - 1850000,
  },
  {
    id: 'biz-t-6',
    name: 'Soap / Body Wash',
    category: 'toiletries',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Travel body cleanser',
    weightGrams: 120,
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'biz-t-7',
    name: 'Razor / Shave gel',
    category: 'toiletries',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'essential',
    notes: 'Safety razor / travel shave foam',
    weightGrams: 140,
    createdAt: Date.now() - 1750000,
  },
  {
    id: 'biz-t-8',
    name: 'Lotion / Lip balm',
    category: 'toiletries',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Moisturizer for dry plane cabin air',
    weightGrams: 70,
    createdAt: Date.now() - 1700000,
  },
  {
    id: 'biz-t-9',
    name: 'Brush / Comb',
    category: 'toiletries',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Pocket comb or travel styling brush',
    weightGrams: 60,
    createdAt: Date.now() - 1650000,
  },
  {
    id: 'biz-t-10',
    name: 'nail clippers',
    category: 'toiletries',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Standard travel nail clipper',
    weightGrams: 40,
    createdAt: Date.now() - 1600000,
  },
  {
    id: 'biz-t-11',
    name: 'Q-Tips / Cotton balls / Tissues',
    category: 'toiletries',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Pocket tissue pack & hygiene cotton',
    weightGrams: 50,
    createdAt: Date.now() - 1550000,
  },
  {
    id: 'biz-t-12',
    name: 'Washcloth',
    category: 'toiletries',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'optional',
    notes: 'Microfiber travel washcloth',
    weightGrams: 50,
    createdAt: Date.now() - 1500000,
  },
  {
    id: 'biz-t-13',
    name: 'Ear Plugs',
    category: 'misc',
    quantity: 2,
    packed: false,
    luggageType: 'personal',
    priority: 'recommended',
    notes: 'Noise dampening for hotel/flights',
    weightGrams: 10,
    createdAt: Date.now() - 1450000,
  },
  {
    id: 'biz-t-14',
    name: 'Eye Mask',
    category: 'misc',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'recommended',
    notes: 'Silk sleep mask for overnight travel',
    weightGrams: 30,
    createdAt: Date.now() - 1400000,
  },
  {
    id: 'biz-t-15',
    name: 'Trident Gum',
    category: 'misc',
    quantity: 2,
    packed: true,
    luggageType: 'personal',
    priority: 'optional',
    notes: 'Fresh breath for client meetings & ear pressure relief',
    weightGrams: 40,
    createdAt: Date.now() - 1350000,
  },
  {
    id: 'biz-t-16',
    name: 'Zip Lock Bags',
    category: 'misc',
    quantity: 3,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Clear 1-quart bags for liquids & receipts',
    weightGrams: 20,
    createdAt: Date.now() - 1300000,
  },

  // --- MEDICAL / HEALTH ---
  {
    id: 'biz-h-1',
    name: 'Prescriptions',
    category: 'health_meds',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Prescription medications in original labeled containers',
    weightGrams: 100,
    createdAt: Date.now() - 1250000,
  },
  {
    id: 'biz-h-2',
    name: 'Pain medication',
    category: 'health_meds',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Ibuprofen / Acetaminophen for headaches and jet lag',
    weightGrams: 40,
    createdAt: Date.now() - 1200000,
  },
  {
    id: 'biz-h-3',
    name: 'Hand sanitizer / Antibacterial wipes',
    category: 'health_meds',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Pocket hand sanitizer (<100ml) & sanitizing wipes',
    weightGrams: 80,
    createdAt: Date.now() - 1150000,
  },
  {
    id: 'biz-h-4',
    name: 'Imodium / Roboxacet',
    category: 'health_meds',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Anti-diarrheal & muscle relaxant relief',
    weightGrams: 40,
    createdAt: Date.now() - 1100000,
  },
  {
    id: 'biz-h-5',
    name: 'Allergy medication',
    category: 'health_meds',
    quantity: 1,
    packed: false,
    luggageType: 'personal',
    priority: 'recommended',
    notes: 'Antihistamines for seasonal & food allergies',
    weightGrams: 30,
    createdAt: Date.now() - 1050000,
  },
  {
    id: 'biz-h-6',
    name: 'First Aid kit',
    category: 'health_meds',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Adhesive bandages, antiseptic wipes, blister pads',
    weightGrams: 110,
    createdAt: Date.now() - 1000000,
  },

  // --- MISCELLANEOUS ---
  {
    id: 'biz-x-1',
    name: 'Watch / Keys',
    category: 'misc',
    quantity: 1,
    packed: true,
    luggageType: 'personal',
    priority: 'essential',
    notes: 'Dress watch and home/office keys',
    weightGrams: 120,
    createdAt: Date.now() - 950000,
  },
  {
    id: 'biz-x-2',
    name: 'Umbrella',
    category: 'weather_gear',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Compact windproof umbrella for rain',
    weightGrams: 240,
    createdAt: Date.now() - 900000,
  },
  {
    id: 'biz-x-3',
    name: 'Travel locks',
    category: 'misc',
    quantity: 2,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'TSA-approved combination locks',
    weightGrams: 100,
    createdAt: Date.now() - 850000,
  },
  {
    id: 'biz-x-4',
    name: 'Batteries',
    category: 'electronics',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'recommended',
    notes: 'Spare AA/AAA or device batteries (carry-on only)',
    weightGrams: 90,
    createdAt: Date.now() - 800000,
  },
  {
    id: 'biz-x-5',
    name: 'Camera & accessories',
    category: 'electronics',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'optional',
    notes: 'Digital camera, memory cards & charger',
    weightGrams: 400,
    createdAt: Date.now() - 750000,
  },
  {
    id: 'biz-x-6',
    name: 'Laundry Soap',
    category: 'misc',
    quantity: 1,
    packed: false,
    luggageType: 'carry-on',
    priority: 'optional',
    notes: 'Travel sink detergent sheets/packets',
    weightGrams: 50,
    createdAt: Date.now() - 700000,
  },
  {
    id: 'biz-x-7',
    name: 'Tweezers / Scissors',
    category: 'misc',
    quantity: 1,
    packed: false,
    luggageType: 'checked',
    priority: 'optional',
    notes: 'Grooming tools (pack in checked luggage if sharp)',
    weightGrams: 60,
    createdAt: Date.now() - 650000,
  },
  {
    id: 'biz-x-8',
    name: 'Swiss Army Knife',
    category: 'misc',
    quantity: 1,
    packed: false,
    luggageType: 'checked',
    priority: 'optional',
    notes: 'MUST be in checked luggage (prohibited in carry-on)',
    weightGrams: 110,
    createdAt: Date.now() - 600000,
  }
];

export const DEFAULT_PACKING_ITEMS: PackingItem[] = BUSINESS_TRAVEL_PACKING_LIST;

export const DEFAULT_ADDONS: AddonModule[] = [
  {
    id: 'packing_tracker',
    name: 'Packing & Baggage Tracker',
    description: 'Real-time item tracking, carry-on vs checked luggage allocation, and completion indicators. Fully active offline.',
    icon: 'Briefcase',
    enabled: true,
    isCore: true,
    offlineSupported: true,
    badge: 'Offline Ready',
    promptContribution: 'Maintain strict awareness of the user\'s packing list. Proactively use tool calls to add, remove, and verify packed items.'
  },
  {
    id: 'weather_forecaster',
    name: 'Live Weather & Climate Forecaster',
    description: 'Analyzes destination climate patterns and suggests clothing adaptations and weather gear.',
    icon: 'CloudSun',
    enabled: true,
    offlineSupported: false,
    badge: 'Online AI',
    promptContribution: 'Incorporate destination temperature, forecast trends, seasonal quirks, and precipitation warnings when giving packing advice.'
  },
  {
    id: 'itinerary_planner',
    name: 'Itinerary & Day-by-Day Planner',
    description: 'Coordinates packing with planned activities (e.g. formal dinners, beach days, hiking trips).',
    icon: 'MapPin',
    enabled: true,
    offlineSupported: true,
    badge: 'Offline Ready',
    promptContribution: 'Structure travel plans into cohesive daily itineraries with suggested outfits and required gear for each activity.'
  },
  {
    id: 'departure_reminders',
    name: 'Departure Countdown & Priority Alerts',
    description: 'Highlights critical documents, chargers, and last-minute essentials before you head out.',
    icon: 'ClockAlert',
    enabled: true,
    offlineSupported: true,
    badge: 'Offline Ready',
    promptContribution: 'Remind the traveler about high-priority uncompleted packing items and time-sensitive departure steps.'
  },
  {
    id: 'luggage_rules_auditor',
    name: 'Airline & Security Regulations Auditor',
    description: 'Enforces TSA 3-1-1 liquids rule, carry-on lithium battery limits, and checked bag weight estimates.',
    icon: 'ShieldCheck',
    enabled: true,
    offlineSupported: true,
    badge: 'Offline Ready',
    promptContribution: 'Alert the user immediately if they attempt to put lithium power banks in checked baggage or oversized liquids in carry-on.'
  },
  {
    id: 'emergency_handbook',
    name: 'Offline Survival Handbook & Phrases',
    description: 'Instant offline access to emergency hotline numbers, international phrases, and embassy protocols.',
    icon: 'BookOpen',
    enabled: true,
    offlineSupported: true,
    badge: 'Offline Ready',
    promptContribution: 'Provide concise emergency advice, translation phrases, and embassy guidance when requested.'
  }
];

export const PRESET_TEMPLATES: PackingTemplate[] = [
  {
    id: 'business_travel_comprehensive',
    title: 'Executive Business Travel Master',
    description: 'Comprehensive business itinerary checklist: suits, dress shirts, briefcase tech, backup phone, documents, corporate credit cards, grooming & toiletries.',
    icon: 'Briefcase',
    climate: 'Mild / Professional (18°C - 24°C)',
    durationDays: 5,
    items: BUSINESS_TRAVEL_PACKING_LIST.map(item => ({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      priority: item.priority,
      luggageType: item.luggageType,
      notes: item.notes
    }))
  },
  {
    id: 'beach_vacation',
    title: 'Sunny Beach Vacation',
    description: 'Resort wear, swimsuits, sun protection, reef-safe sunscreen, and light evening attire.',
    icon: 'Sun',
    climate: 'Hot / Tropical (28°C - 34°C)',
    durationDays: 7,
    items: [
      { name: 'Swimsuits / Boardshorts', category: 'clothing', quantity: 3, priority: 'essential', luggageType: 'checked', notes: 'Quick-dry fabric' },
      { name: 'Reef-safe Sunscreen SPF 50', category: 'toiletries', quantity: 1, priority: 'essential', luggageType: 'checked', notes: 'Eco-friendly formula' },
      { name: 'Polarized Sunglasses & Case', category: 'clothing', quantity: 1, priority: 'essential', luggageType: 'personal', notes: 'UV400 protection' },
      { name: 'Light Linen Shirts & Tops', category: 'clothing', quantity: 5, priority: 'essential', luggageType: 'checked' },
      { name: 'Sandals / Flip-flops', category: 'clothing', quantity: 1, priority: 'recommended', luggageType: 'checked' },
      { name: 'Waterproof Phone Pouch', category: 'electronics', quantity: 1, priority: 'recommended', luggageType: 'carry-on' },
      { name: 'Aloe Vera / After-sun Gel', category: 'toiletries', quantity: 1, priority: 'recommended', luggageType: 'checked' },
      { name: 'Lightweight Beach Towel', category: 'misc', quantity: 1, priority: 'optional', luggageType: 'checked' },
      { name: 'Wide-brim Sun Hat', category: 'clothing', quantity: 1, priority: 'recommended', luggageType: 'carry-on' },
    ]
  },
  {
    id: 'weekend_city_break',
    title: '3-Day Weekend City Break',
    description: 'Ultra-compact carry-on setup with versatile smart-casual layers and metro comfort.',
    icon: 'Building2',
    climate: 'Moderate (15°C - 22°C)',
    durationDays: 3,
    items: [
      { name: 'Smart Casual Outfits (Mix & Match)', category: 'clothing', quantity: 3, priority: 'essential', luggageType: 'carry-on' },
      { name: 'Comfortable City Walking Shoes', category: 'clothing', quantity: 1, priority: 'essential', luggageType: 'carry-on' },
      { name: 'Compact 3-in-1 Charging Cable', category: 'electronics', quantity: 1, priority: 'essential', luggageType: 'personal' },
      { name: 'Light Layer Jacket / Cardigan', category: 'clothing', quantity: 1, priority: 'recommended', luggageType: 'carry-on' },
      { name: 'Travel Toiletry Minis (<100ml)', category: 'toiletries', quantity: 1, priority: 'essential', luggageType: 'carry-on' },
      { name: 'Crossbody Anti-theft Daypack', category: 'misc', quantity: 1, priority: 'recommended', luggageType: 'personal' },
    ]
  },
  {
    id: 'winter_ski_snow',
    title: 'Winter & Snow Getaway',
    description: 'Thermal base layers, waterproof outer shells, hand warmers, and cold-weather skincare.',
    icon: 'Snowflake',
    climate: 'Cold / Sub-zero (-5°C to 4°C)',
    durationDays: 6,
    items: [
      { name: 'Merino Wool Thermal Tops & Bottoms', category: 'clothing', quantity: 3, priority: 'essential', luggageType: 'checked' },
      { name: 'Waterproof Ski/Winter Jacket', category: 'weather_gear', quantity: 1, priority: 'essential', luggageType: 'checked' },
      { name: 'Insulated Waterproof Snow Gloves', category: 'weather_gear', quantity: 1, priority: 'essential', luggageType: 'checked' },
      { name: 'Heavy-duty Lip Balm & Moisturizer', category: 'toiletries', quantity: 2, priority: 'essential', luggageType: 'carry-on' },
      { name: 'Fleece-lined Beanie & Neck Gaiter', category: 'clothing', quantity: 2, priority: 'essential', luggageType: 'carry-on' },
      { name: 'Rechargeable Hand Warmers', category: 'electronics', quantity: 2, priority: 'recommended', luggageType: 'carry-on' },
      { name: 'Wool Hiking/Ski Socks', category: 'clothing', quantity: 4, priority: 'essential', luggageType: 'checked' },
    ]
  },
  {
    id: 'international_adventure',
    title: 'International Multi-Week Explorer',
    description: 'Comprehensive gear for long-haul travel, multiple climates, and foreign transit.',
    icon: 'Globe',
    climate: 'Variable Climates',
    durationDays: 14,
    items: [
      { name: 'Passport, International License & Visa', category: 'documents', quantity: 1, priority: 'essential', luggageType: 'personal' },
      { name: 'Universal Socket Adapter with USB-C', category: 'electronics', quantity: 1, priority: 'essential', luggageType: 'carry-on' },
      { name: 'First Aid & Travel Meds Kit (GI, Pain, Bandages)', category: 'health_meds', quantity: 1, priority: 'essential', luggageType: 'carry-on' },
      { name: '7-Day Mix-and-Match Capsule Wardrobe', category: 'clothing', quantity: 7, priority: 'essential', luggageType: 'checked' },
      { name: 'Packable Rain Jacket / Windbreaker', category: 'weather_gear', quantity: 1, priority: 'essential', luggageType: 'carry-on' },
      { name: 'Luggage Combination Padlocks (TSA Approved)', category: 'misc', quantity: 2, priority: 'recommended', luggageType: 'checked' },
      { name: 'Inflatable Neck Pillow & Sleep Mask', category: 'misc', quantity: 1, priority: 'recommended', luggageType: 'carry-on' },
      { name: 'Emergency Cash ($100 local currency equivalent)', category: 'documents', quantity: 1, priority: 'essential', luggageType: 'personal' },
    ]
  }
];

// Helper functions for storage
export function loadPackingList(): PackingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PACKING_LIST);
    if (raw) {
      const stored: PackingItem[] = JSON.parse(raw);
      if (Array.isArray(stored) && stored.length > 0) {
        // Merge with business items if missing
        const existingNames = new Set(stored.map(s => s.name.toLowerCase().trim()));
        const missingBusinessItems = BUSINESS_TRAVEL_PACKING_LIST.filter(
          biz => !existingNames.has(biz.name.toLowerCase().trim())
        );
        if (missingBusinessItems.length > 0) {
          const merged = [...stored, ...missingBusinessItems];
          localStorage.setItem(STORAGE_KEYS.PACKING_LIST, JSON.stringify(merged));
          return merged;
        }
        return stored;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored packing list', e);
  }
  return DEFAULT_PACKING_ITEMS;
}

export function savePackingList(items: PackingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PACKING_LIST, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save packing list to localStorage', e);
  }
}

export function loadTripInfo(): TripInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRIP_INFO);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse trip info', e);
  }
  return DEFAULT_TRIP;
}

export function saveTripInfo(info: TripInfo): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRIP_INFO, JSON.stringify(info));
  } catch (e) {
    console.error('Failed to save trip info', e);
  }
}

export function loadAddons(): AddonModule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADDONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with default list in case new addons exist
      const merged = DEFAULT_ADDONS.map(def => {
        const found = parsed.find((p: AddonModule) => p.id === def.id);
        return found ? { ...def, enabled: found.enabled, customSystemPrompt: found.customSystemPrompt } : def;
      });
      // Also preserve user custom addons
      const customOnes = parsed.filter((p: AddonModule) => !DEFAULT_ADDONS.some(d => d.id === p.id));
      return [...merged, ...customOnes];
    }
  } catch (e) {
    console.error('Failed to load addons', e);
  }
  return DEFAULT_ADDONS;
}

export function saveAddons(addons: AddonModule[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ADDONS, JSON.stringify(addons));
  } catch (e) {
    console.error('Failed to save addons', e);
  }
}

export const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact-ice-1',
    name: 'Emily Carter',
    relationship: 'Spouse / Partner',
    phone: '+1 (555) 234-8901',
    altPhone: '+1 (555) 890-1234',
    email: 'emily.carter@example.com',
    address: '428 Elm Street, Seattle, WA 98101',
    isICE: true,
    isCompanion: false,
    bloodType: 'O+',
    allergiesMedications: 'Penicillin allergy (severe)',
    insurancePolicy: 'Allianz Global Care #AZ-8839102',
    notes: 'Key emergency ICE contact. Holds spare house keys & power of attorney.',
    createdAt: Date.now() - 5000000
  },
  {
    id: 'contact-companion-1',
    name: 'Marcus Vance',
    relationship: 'Travel Companion / Colleague',
    phone: '+1 (555) 432-7788',
    email: 'marcus.vance@company.com',
    isICE: false,
    isCompanion: true,
    passportNumber: 'USA #982341029',
    bloodType: 'A+',
    notes: 'Traveling together on flights & staying at same hotel (Room 402).',
    createdAt: Date.now() - 4000000
  },
  {
    id: 'contact-doctor-1',
    name: 'Dr. Robert Hayes, MD',
    relationship: 'Primary Care Physician',
    phone: '+1 (555) 678-9012',
    email: 'clinic@hayesmedicine.com',
    address: 'Cascade Medical Center, Suite 300, Seattle, WA',
    isICE: false,
    isCompanion: false,
    notes: 'Available for telehealth consultations during travel emergencies.',
    createdAt: Date.now() - 3000000
  }
];

export const DEFAULT_MEDICATIONS: MedicationRecord[] = [
  {
    id: 'med-1',
    name: 'Atorvastatin (Lipitor)',
    dosage: '20mg Tablet',
    frequency: '1 tablet daily at bedtime',
    prescribingDoctor: 'Dr. Robert Hayes',
    rxNumber: 'RX-982341-B',
    emergencyCritical: true,
    notes: 'Keep in carry-on bag with original label. Do not store in checked luggage.',
    createdAt: Date.now() - 4000000
  },
  {
    id: 'med-2',
    name: 'Albuterol Inhaler',
    dosage: '90mcg / spray',
    frequency: '2 puffs as needed for asthma / shortness of breath',
    prescribingDoctor: 'Dr. Robert Hayes',
    rxNumber: 'RX-771829-A',
    emergencyCritical: true,
    notes: 'Keep in personal daypack / pocket during flights and excursions.',
    createdAt: Date.now() - 3500000
  },
  {
    id: 'med-3',
    name: 'Daily Multivitamin & B-Complex',
    dosage: '1 capsule',
    frequency: 'Once every morning with breakfast',
    emergencyCritical: false,
    notes: 'General travel immunity & stamina.',
    createdAt: Date.now() - 3000000
  }
];

export const COUNTRY_EMERGENCY_NUMBERS: Record<string, LocalEmergencyNumbers> = {
  'japan': { country: 'Japan', general: '110 / 119', police: '110', ambulance: '119', fire: '119', embassyPhone: '+81 3-3224-5000' },
  'united states': { country: 'United States', general: '911', police: '911', ambulance: '911', fire: '911' },
  'canada': { country: 'Canada', general: '911', police: '911', ambulance: '911', fire: '911' },
  'united kingdom': { country: 'United Kingdom', general: '999 / 112', police: '999', ambulance: '999', fire: '999' },
  'france': { country: 'France', general: '112', police: '17', ambulance: '15', fire: '18' },
  'germany': { country: 'Germany', general: '112', police: '110', ambulance: '112', fire: '112' },
  'italy': { country: 'Italy', general: '112', police: '113', ambulance: '118', fire: '115' },
  'spain': { country: 'Spain', general: '112', police: '091', ambulance: '061', fire: '080' },
  'australia': { country: 'Australia', general: '000', police: '000', ambulance: '000', fire: '000' },
  'new zealand': { country: 'New Zealand', general: '111', police: '111', ambulance: '111', fire: '111' },
  'mexico': { country: 'Mexico', general: '911', police: '911', ambulance: '911', fire: '911' },
  'thailand': { country: 'Thailand', general: '191 / 1155 (Tourist Police)', police: '191', ambulance: '1669', fire: '199' },
  'singapore': { country: 'Singapore', general: '999 / 995', police: '999', ambulance: '995', fire: '995' },
  'switzerland': { country: 'Switzerland', general: '112', police: '117', ambulance: '144', fire: '118' },
};

export function getEmergencyNumbersForDestination(destination: string): LocalEmergencyNumbers {
  const destLower = destination.toLowerCase();
  for (const [key, val] of Object.entries(COUNTRY_EMERGENCY_NUMBERS)) {
    if (destLower.includes(key)) {
      return val;
    }
  }
  // Default international standard
  return {
    country: destination || 'International',
    general: '112 (Universal GSM) or 911',
    police: '112 / 911',
    ambulance: '112 / 911',
    fire: '112 / 911',
    embassyPhone: 'Contact nearest diplomatic consulate'
  };
}

export function loadEmergencyContacts(): EmergencyContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load emergency contacts', e);
  }
  return DEFAULT_EMERGENCY_CONTACTS;
}

export function saveEmergencyContacts(contacts: EmergencyContact[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
  } catch (e) {
    console.error('Failed to save emergency contacts', e);
  }
}

export function loadMedications(): MedicationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load medications', e);
  }
  return DEFAULT_MEDICATIONS;
}

export function saveMedications(meds: MedicationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(meds));
  } catch (e) {
    console.error('Failed to save medications', e);
  }
}

export function exportDataAsJSON(): string {
  const data = {
    tripInfo: loadTripInfo(),
    packingList: loadPackingList(),
    addons: loadAddons(),
    emergencyContacts: loadEmergencyContacts(),
    medications: loadMedications(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDataFromJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.packingList && Array.isArray(parsed.packingList)) {
      savePackingList(parsed.packingList);
    }
    if (parsed.tripInfo) {
      saveTripInfo(parsed.tripInfo);
    }
    if (parsed.addons && Array.isArray(parsed.addons)) {
      saveAddons(parsed.addons);
    }
    if (parsed.emergencyContacts && Array.isArray(parsed.emergencyContacts)) {
      saveEmergencyContacts(parsed.emergencyContacts);
    }
    if (parsed.medications && Array.isArray(parsed.medications)) {
      saveMedications(parsed.medications);
    }
    return true;
  } catch (e) {
    console.error('Invalid import data format', e);
    return false;
  }
}
