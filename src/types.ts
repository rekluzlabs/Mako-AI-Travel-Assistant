export type PackingCategory =
  | 'clothing'
  | 'toiletries'
  | 'electronics'
  | 'documents'
  | 'health_meds'
  | 'weather_gear'
  | 'misc';

export type LuggageType = 'carry-on' | 'checked' | 'personal';

export type ItemPriority = 'essential' | 'recommended' | 'optional';

export interface PackingItem {
  id: string;
  name: string;
  category: PackingCategory;
  quantity: number;
  packed: boolean;
  luggageType: LuggageType;
  priority: ItemPriority;
  notes?: string;
  photoUrl?: string; // Camera photo snapshot (e.g. medication label, power adapter)
  weightGrams?: number;
  reminderDate?: string;
  createdAt: number;
}

export interface TripInfo {
  destination: string;
  departureDate?: string;
  returnDate?: string;
  durationDays: number;
  tripType: string;
  climate: string;
  baggageAllowance?: {
    carryOnLimitKg?: number;
    checkedLimitKg?: number;
  };
  notes?: string;
}

export interface SuggestedAction {
  label: string;
  promptText: string;
  icon?: string;
  actionType?: 'add_items' | 'check_items' | 'audit' | 'weather' | 'itinerary' | 'template';
  payload?: any;
}

export interface PackingActionSummary {
  action: 'add' | 'update' | 'remove' | 'audit';
  summary: string;
  itemsCount?: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  suggestedActions?: SuggestedAction[];
  packingActionsApplied?: PackingActionSummary[];
  isOfflineGenerated?: boolean;
}

export interface AddonModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  isCore?: boolean;
  offlineSupported: boolean;
  badge?: string;
  promptContribution: string;
  customSystemPrompt?: string;
}

export interface PackingAuditResult {
  readinessScore: number;
  statusAssessment: string;
  missingEssentials: Array<{
    name: string;
    category: string;
    reason: string;
    suggestedLuggage?: string;
  }>;
  luggageRulesWarnings: string[];
  lightenLoadTips: string[];
}

export type DocumentCategory =
  | 'tickets'
  | 'passport_id'
  | 'hotel'
  | 'insurance'
  | 'activities'
  | 'packing_list'
  | 'general';

export interface TravelDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string; // Base64 / Data URL
  uploadDate: number;
  referenceCode?: string;
  notes?: string;
  photoUrl?: string; // Captured photo thumbnail / image
  isPinned?: boolean;
  linkedDestination?: string;
  parsedInfo?: {
    destination?: string;
    dates?: string;
    detectedItems?: string[];
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address?: string;
  isICE: boolean; // In Case of Emergency primary contact
  isCompanion: boolean; // Traveling companion
  photoUrl?: string; // Companion photo / avatar
  passportNumber?: string;
  bloodType?: string;
  allergiesMedications?: string;
  insurancePolicy?: string;
  notes?: string;
  createdAt: number;
}

export interface MedicationRecord {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescribingDoctor?: string;
  rxNumber?: string;
  notes?: string;
  photoUrl?: string; // Photo of pill bottle or prescription label
  emergencyCritical?: boolean;
  createdAt: number;
}

export interface LocalEmergencyNumbers {
  country: string;
  general: string;
  police: string;
  ambulance: string;
  fire: string;
  embassyPhone?: string;
}

export interface PackingTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  climate: string;
  durationDays: number;
  items: Array<{
    name: string;
    category: PackingCategory;
    quantity: number;
    priority: ItemPriority;
    luggageType: LuggageType;
    notes?: string;
  }>;
}

export interface SavedPackingList {
  id: string;
  title: string;
  description?: string;
  destination: string;
  createdAt: number;
  updatedAt: number;
  itemCount: number;
  packedCount: number;
  items: PackingItem[];
  tripInfo: TripInfo;
  tags?: string[];
}
