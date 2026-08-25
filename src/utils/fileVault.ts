import { TravelDocument, SavedPackingList, PackingItem, TripInfo, DocumentCategory, PackingCategory, LuggageType, ItemPriority } from '../types';
import { DEFAULT_PACKING_ITEMS, DEFAULT_TRIP } from './storage';
import { guessCategory, guessLuggageType } from './offlineEngine';

const DB_NAME = 'TravelBotVaultDB';
const DB_VERSION = 1;
const STORE_DOCS = 'travel_documents';
const STORE_LISTS = 'saved_packing_lists';

const FALLBACK_DOCS_KEY = 'travelbot_docs_fallback_v1';
const FALLBACK_LISTS_KEY = 'travelbot_lists_fallback_v1';

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        const docStore = db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
        docStore.createIndex('category', 'category', { unique: false });
        docStore.createIndex('uploadDate', 'uploadDate', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_LISTS)) {
        const listStore = db.createObjectStore(STORE_LISTS, { keyPath: 'id' });
        listStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Initial Sample Documents for First-Time Users
export const SAMPLE_DOCUMENTS: TravelDocument[] = [
  {
    id: 'doc-sample-1',
    name: 'Tokyo Flight e-Ticket & Boarding Details (NH204)',
    category: 'tickets',
    fileName: 'tokyo_flight_nh204_confirmation.pdf',
    fileType: 'application/pdf',
    fileSize: 184320, // ~180 KB
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDY5L0ZpbHRlci9GbGF0ZURlY29kZT4+c3RyZWFtCnicS0wuyUxUCPEMcPRScPZw9nMNV3B08/R1cnTR9/T1d1UwNPFzcHRz9HdzBwAXQApCCmVuZHN0cmVhbQplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDE+PmVuZG9iago=',
    uploadDate: Date.now() - 172800000,
    referenceCode: 'NH-98314A',
    notes: 'Departure Terminal 1, Seat 14A. Carry-on allowance: 10kg.',
    isPinned: true,
    linkedDestination: 'Tokyo, Japan',
    parsedInfo: {
      destination: 'Tokyo (Haneda - HND)',
      dates: 'Departing: 10:45 AM',
      detectedItems: ['Passport', 'Universal Power Adapter', 'Noise-Canceling Earbuds', '100ml Toiletries pouch']
    }
  },
  {
    id: 'doc-sample-2',
    name: 'Hotel Shinjuku Ryokan Reservation Voucher',
    category: 'hotel',
    fileName: 'shinjuku_granbell_hotel_booking.txt',
    fileType: 'text/plain',
    fileSize: 1240,
    fileData: 'data:text/plain;charset=utf-8,' + encodeURIComponent(`SHINJUKU GRANBELL HOTEL BOOKING CONFIRMATION
==============================================
Reservation Code: RYK-884920
Guest: Traveler
Check-in: 15:00 (Luggage storage available from 08:00)
Check-out: 11:00
Address: 2-1-1 Kabukicho, Shinjuku-ku, Tokyo, 160-0021 Japan
Phone: +81 3-5155-2666
Special notes: Universal voltage 100V plugs. Free Yukata and slippers provided in room.`),
    uploadDate: Date.now() - 86400000,
    referenceCode: 'RYK-884920',
    notes: 'Early bag drop permitted from 8am at front desk.',
    isPinned: false,
    linkedDestination: 'Tokyo, Japan',
  }
];

export const SAMPLE_SAVED_LISTS: SavedPackingList[] = [
  {
    id: 'list-business-travel-master',
    title: 'Executive Business Travel Master List',
    description: 'Complete corporate trip checklist: suits, dress shirts, briefcase tech, backup phone, corporate cards, toiletries & medical kit.',
    destination: 'Tokyo, Japan (Business Conference)',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 1000000,
    itemCount: DEFAULT_PACKING_ITEMS.length,
    packedCount: DEFAULT_PACKING_ITEMS.filter(i => i.packed).length,
    items: DEFAULT_PACKING_ITEMS,
    tripInfo: DEFAULT_TRIP,
    tags: ['Business', 'Corporate', 'Conference', 'Executive']
  },
  {
    id: 'list-beach-escape',
    title: 'Mediterranean Beach & Island Holiday',
    description: 'Swimwear, reef-safe sunscreen, sunglasses, light linen apparel, and flip flops.',
    destination: 'Santorini, Greece',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 2,
    itemCount: 8,
    packedCount: 4,
    items: [
      { id: 'b1', name: 'Swimsuits / Boardshorts', category: 'clothing', quantity: 3, packed: true, luggageType: 'checked', priority: 'essential', weightGrams: 300, createdAt: Date.now() },
      { id: 'b2', name: 'Reef-safe Sunscreen SPF 50', category: 'toiletries', quantity: 1, packed: true, luggageType: 'checked', priority: 'essential', weightGrams: 200, createdAt: Date.now() },
      { id: 'b3', name: 'Polarized Sunglasses & Case', category: 'clothing', quantity: 1, packed: true, luggageType: 'personal', priority: 'essential', weightGrams: 50, createdAt: Date.now() },
      { id: 'b4', name: 'Light Linen Shirts', category: 'clothing', quantity: 4, packed: false, luggageType: 'checked', priority: 'essential', weightGrams: 600, createdAt: Date.now() },
      { id: 'b5', name: 'Beach Towel', category: 'misc', quantity: 1, packed: false, luggageType: 'checked', priority: 'optional', weightGrams: 400, createdAt: Date.now() },
      { id: 'b6', name: 'Waterproof Phone Pouch', category: 'electronics', quantity: 1, packed: true, luggageType: 'carry-on', priority: 'recommended', weightGrams: 50, createdAt: Date.now() },
      { id: 'b7', name: 'Hat & Sun Visor', category: 'clothing', quantity: 1, packed: false, luggageType: 'carry-on', priority: 'recommended', weightGrams: 100, createdAt: Date.now() },
      { id: 'b8', name: 'Flip Flops & Sandals', category: 'clothing', quantity: 1, packed: false, luggageType: 'checked', priority: 'essential', weightGrams: 300, createdAt: Date.now() }
    ],
    tripInfo: {
      destination: 'Santorini, Greece',
      departureDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      durationDays: 7,
      tripType: 'Beach & Island Holiday',
      climate: 'Hot & Sunny (29°C / 84°F)',
      baggageAllowance: { carryOnLimitKg: 8, checkedLimitKg: 20 }
    },
    tags: ['Beach', 'Summer', 'Relaxation']
  }
];

// Document DB Operations
export async function getAllDocuments(): Promise<TravelDocument[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_DOCS, 'readonly');
      const store = tx.objectStore(STORE_DOCS);
      const request = store.getAll();
      request.onsuccess = () => {
        const results: TravelDocument[] = request.result || [];
        if (results.length === 0) {
          // Seed samples if empty
          SAMPLE_DOCUMENTS.forEach(doc => saveDocument(doc));
          resolve(SAMPLE_DOCUMENTS);
        } else {
          resolve(results);
        }
      };
      request.onerror = () => {
        resolve(getFallbackDocuments());
      };
    });
  } catch (e) {
    console.warn('Using localStorage fallback for documents', e);
    return getFallbackDocuments();
  }
}

export async function saveDocument(doc: TravelDocument): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_DOCS, 'readwrite');
      const store = tx.objectStore(STORE_DOCS);
      const request = store.put(doc);
      request.onsuccess = () => {
        saveFallbackDocument(doc);
        resolve(true);
      };
      request.onerror = () => {
        saveFallbackDocument(doc);
        resolve(true);
      };
    });
  } catch (e) {
    saveFallbackDocument(doc);
    return true;
  }
}

export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_DOCS, 'readwrite');
      const store = tx.objectStore(STORE_DOCS);
      const request = store.delete(id);
      request.onsuccess = () => {
        deleteFallbackDocument(id);
        resolve(true);
      };
      request.onerror = () => {
        deleteFallbackDocument(id);
        resolve(true);
      };
    });
  } catch (e) {
    deleteFallbackDocument(id);
    return true;
  }
}

// Saved Packing Lists Operations
export async function getAllSavedLists(): Promise<SavedPackingList[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_LISTS, 'readonly');
      const store = tx.objectStore(STORE_LISTS);
      const request = store.getAll();
      request.onsuccess = () => {
        const results: SavedPackingList[] = request.result || [];
        if (results.length === 0) {
          SAMPLE_SAVED_LISTS.forEach(list => savePackingListRecord(list));
          resolve(SAMPLE_SAVED_LISTS);
        } else {
          resolve(results);
        }
      };
      request.onerror = () => {
        resolve(getFallbackSavedLists());
      };
    });
  } catch (e) {
    console.warn('Using localStorage fallback for saved packing lists', e);
    return getFallbackSavedLists();
  }
}

export async function savePackingListRecord(list: SavedPackingList): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_LISTS, 'readwrite');
      const store = tx.objectStore(STORE_LISTS);
      const request = store.put(list);
      request.onsuccess = () => {
        saveFallbackList(list);
        resolve(true);
      };
      request.onerror = () => {
        saveFallbackList(list);
        resolve(true);
      };
    });
  } catch (e) {
    saveFallbackList(list);
    return true;
  }
}

export async function deleteSavedList(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_LISTS, 'readwrite');
      const store = tx.objectStore(STORE_LISTS);
      const request = store.delete(id);
      request.onsuccess = () => {
        deleteFallbackList(id);
        resolve(true);
      };
      request.onerror = () => {
        deleteFallbackList(id);
        resolve(true);
      };
    });
  } catch (e) {
    deleteFallbackList(id);
    return true;
  }
}

// Fallback LocalStorage Handlers
function getFallbackDocuments(): TravelDocument[] {
  try {
    const raw = localStorage.getItem(FALLBACK_DOCS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return SAMPLE_DOCUMENTS;
}

function saveFallbackDocument(doc: TravelDocument) {
  try {
    const current = getFallbackDocuments();
    const filtered = current.filter(d => d.id !== doc.id);
    // Remove heavy data for localStorage if it exceeds size limits
    const safeDoc = { ...doc };
    if (safeDoc.fileData && safeDoc.fileData.length > 500000) {
      safeDoc.fileData = safeDoc.fileData.substring(0, 1000) + '...[cached in indexeddb]';
    }
    localStorage.setItem(FALLBACK_DOCS_KEY, JSON.stringify([safeDoc, ...filtered]));
  } catch (e) {}
}

function deleteFallbackDocument(id: string) {
  try {
    const current = getFallbackDocuments().filter(d => d.id !== id);
    localStorage.setItem(FALLBACK_DOCS_KEY, JSON.stringify(current));
  } catch (e) {}
}

function getFallbackSavedLists(): SavedPackingList[] {
  try {
    const raw = localStorage.getItem(FALLBACK_LISTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return SAMPLE_SAVED_LISTS;
}

function saveFallbackList(list: SavedPackingList) {
  try {
    const current = getFallbackSavedLists();
    const filtered = current.filter(l => l.id !== list.id);
    localStorage.setItem(FALLBACK_LISTS_KEY, JSON.stringify([list, ...filtered]));
  } catch (e) {}
}

function deleteFallbackList(id: string) {
  try {
    const current = getFallbackSavedLists().filter(l => l.id !== id);
    localStorage.setItem(FALLBACK_LISTS_KEY, JSON.stringify(current));
  } catch (e) {}
}

// File Reading & Parsing Utilities
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Export Packing List as CSV
export function exportPackingListToCSV(items: PackingItem[], tripInfo: TripInfo): string {
  const headers = ['Name', 'Category', 'Quantity', 'Packed', 'Luggage Type', 'Priority', 'Notes'];
  const rows = items.map(item => [
    `"${item.name.replace(/"/g, '""')}"`,
    item.category,
    item.quantity,
    item.packed ? 'YES' : 'NO',
    item.luggageType,
    item.priority,
    `"${(item.notes || '').replace(/"/g, '""')}"`
  ]);

  return [
    `# Packing List for ${tripInfo.destination} (${tripInfo.durationDays} days)`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
}

// Parse imported CSV or TXT file into Packing Items
export function parsePackingListFileContent(content: string): { items: PackingItem[]; tripTitle?: string } {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const items: PackingItem[] = [];
  let tripTitle: string | undefined = undefined;

  for (const line of lines) {
    if (line.startsWith('#')) {
      const match = line.match(/Packing List for ([^(]+)/i);
      if (match) tripTitle = match[1].trim();
      continue;
    }

    // Ignore CSV Header line if present
    if (/^name,category,quantity/i.test(line) || /^"name","category"/i.test(line)) {
      continue;
    }

    // Check if CSV format
    if (line.includes(',')) {
      // Basic CSV splitter handling quotes
      const parts: string[] = [];
      let inQuote = false;
      let cur = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          parts.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      parts.push(cur.trim().replace(/^"|"$/g, ''));

      if (parts.length >= 1 && parts[0]) {
        const name = parts[0];
        const category = (parts[1] as PackingCategory) || guessCategory(name);
        const quantity = parseInt(parts[2], 10) || 1;
        const packed = parts[3]?.toUpperCase() === 'YES' || parts[3] === 'true';
        const luggageType = (parts[4] as LuggageType) || guessLuggageType(name, category);
        const priority = (parts[5] as ItemPriority) || 'recommended';
        const notes = parts[6] || undefined;

        items.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name,
          category,
          quantity,
          packed,
          luggageType,
          priority,
          notes,
          createdAt: Date.now(),
        });
      }
    } else {
      // Plain checklist line (e.g. "- [x] 3x T-Shirts" or "• Passport")
      const cleaned = line.replace(/^[-*•]\s*(\[[ xX]\]\s*)?/, '').trim();
      if (!cleaned) continue;

      const isPacked = /^[-*•]?\s*\[[xX]\]/i.test(line);
      const qtyMatch = cleaned.match(/^(\d+)x?\s+(.+)/i);
      const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      const name = qtyMatch ? qtyMatch[2] : cleaned;
      const category = guessCategory(name);
      const luggageType = guessLuggageType(name, category);

      items.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name,
        category,
        quantity,
        packed: isPacked,
        luggageType,
        priority: /passport|meds|phone|ticket|id/i.test(name) ? 'essential' : 'recommended',
        createdAt: Date.now()
      });
    }
  }

  return { items, tripTitle };
}

// Download content as file helper
export function downloadFile(dataUriOrBlob: string | Blob, fileName: string) {
  const url = typeof dataUriOrBlob === 'string' ? dataUriOrBlob : URL.createObjectURL(dataUriOrBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof dataUriOrBlob !== 'string') {
    URL.revokeObjectURL(url);
  }
}
