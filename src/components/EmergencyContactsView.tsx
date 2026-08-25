import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Phone, 
  Mail, 
  MapPin, 
  UserPlus, 
  Camera, 
  Plus, 
  Trash2, 
  Edit2, 
  HeartPulse, 
  Users, 
  Pill, 
  FileText, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  ExternalLink,
  Info,
  ChevronRight,
  Maximize2,
  X
} from 'lucide-react';
import { EmergencyContact, MedicationRecord, TripInfo, LocalEmergencyNumbers } from '../types';
import { getEmergencyNumbersForDestination } from '../utils/storage';

interface EmergencyContactsViewProps {
  contacts: EmergencyContact[];
  medications: MedicationRecord[];
  tripInfo: TripInfo;
  onAddContact: (contact: EmergencyContact) => void;
  onUpdateContact: (contact: EmergencyContact) => void;
  onDeleteContact: (id: string) => void;
  onAddMedication: (med: MedicationRecord) => void;
  onUpdateMedication: (med: MedicationRecord) => void;
  onDeleteMedication: (id: string) => void;
  onOpenCamera: (defaultCategory: 'companion' | 'medication' | 'document', defaultTitle?: string, targetId?: string) => void;
}

export const EmergencyContactsView: React.FC<EmergencyContactsViewProps> = ({
  contacts,
  medications,
  tripInfo,
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
  onOpenCamera,
}) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'companions' | 'medications' | 'numbers'>('contacts');
  
  // Modals state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<MedicationRecord | null>(null);

  // Photo Lightbox
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  // Confirm delete modal
  const [deletingItem, setDeletingItem] = useState<{ id: string; type: 'contact' | 'medication'; name: string } | null>(null);

  // Destination emergency numbers
  const emergencyNumbers: LocalEmergencyNumbers = getEmergencyNumbersForDestination(tripInfo.destination);

  // Filtered contacts
  const iceContacts = contacts.filter(c => c.isICE);
  const companionContacts = contacts.filter(c => c.isCompanion);
  const generalContacts = contacts.filter(c => !c.isICE && !c.isCompanion);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAltPhone, setContactAltPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactIsICE, setContactIsICE] = useState(false);
  const [contactIsCompanion, setContactIsCompanion] = useState(false);
  const [contactBloodType, setContactBloodType] = useState('');
  const [contactAllergies, setContactAllergies] = useState('');
  const [contactPassport, setContactPassport] = useState('');
  const [contactInsurance, setContactInsurance] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [contactPhotoUrl, setContactPhotoUrl] = useState<string | undefined>(undefined);

  // Medication Form State
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');
  const [medDoctor, setMedDoctor] = useState('');
  const [medRx, setMedRx] = useState('');
  const [medCritical, setMedCritical] = useState(false);
  const [medNotes, setMedNotes] = useState('');
  const [medPhotoUrl, setMedPhotoUrl] = useState<string | undefined>(undefined);

  const openAddContactModal = (isCompanionDefault = false, isICEDefault = false) => {
    setEditingContact(null);
    setContactName('');
    setContactRelation(isCompanionDefault ? 'Travel Companion' : isICEDefault ? 'Spouse / Family' : 'Friend');
    setContactPhone('');
    setContactAltPhone('');
    setContactEmail('');
    setContactAddress('');
    setContactIsICE(isICEDefault);
    setContactIsCompanion(isCompanionDefault);
    setContactBloodType('');
    setContactAllergies('');
    setContactPassport('');
    setContactInsurance('');
    setContactNotes('');
    setContactPhotoUrl(undefined);
    setIsContactModalOpen(true);
  };

  const openEditContactModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactName(contact.name);
    setContactRelation(contact.relationship);
    setContactPhone(contact.phone);
    setContactAltPhone(contact.altPhone || '');
    setContactEmail(contact.email || '');
    setContactAddress(contact.address || '');
    setContactIsICE(contact.isICE);
    setContactIsCompanion(contact.isCompanion);
    setContactBloodType(contact.bloodType || '');
    setContactAllergies(contact.allergiesMedications || '');
    setContactPassport(contact.passportNumber || '');
    setContactInsurance(contact.insurancePolicy || '');
    setContactNotes(contact.notes || '');
    setContactPhotoUrl(contact.photoUrl);
    setIsContactModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) return;

    if (editingContact) {
      onUpdateContact({
        ...editingContact,
        name: contactName.trim(),
        relationship: contactRelation.trim() || 'Contact',
        phone: contactPhone.trim(),
        altPhone: contactAltPhone.trim() || undefined,
        email: contactEmail.trim() || undefined,
        address: contactAddress.trim() || undefined,
        isICE: contactIsICE,
        isCompanion: contactIsCompanion,
        bloodType: contactBloodType.trim() || undefined,
        allergiesMedications: contactAllergies.trim() || undefined,
        passportNumber: contactPassport.trim() || undefined,
        insurancePolicy: contactInsurance.trim() || undefined,
        notes: contactNotes.trim() || undefined,
        photoUrl: contactPhotoUrl,
      });
    } else {
      const newContact: EmergencyContact = {
        id: `contact-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: contactName.trim(),
        relationship: contactRelation.trim() || 'Contact',
        phone: contactPhone.trim(),
        altPhone: contactAltPhone.trim() || undefined,
        email: contactEmail.trim() || undefined,
        address: contactAddress.trim() || undefined,
        isICE: contactIsICE,
        isCompanion: contactIsCompanion,
        bloodType: contactBloodType.trim() || undefined,
        allergiesMedications: contactAllergies.trim() || undefined,
        passportNumber: contactPassport.trim() || undefined,
        insurancePolicy: contactInsurance.trim() || undefined,
        notes: contactNotes.trim() || undefined,
        photoUrl: contactPhotoUrl,
        createdAt: Date.now()
      };
      onAddContact(newContact);
    }

    setIsContactModalOpen(false);
  };

  const openAddMedModal = () => {
    setEditingMed(null);
    setMedName('');
    setMedDosage('');
    setMedFrequency('');
    setMedDoctor('');
    setMedRx('');
    setMedCritical(false);
    setMedNotes('');
    setMedPhotoUrl(undefined);
    setIsMedModalOpen(true);
  };

  const openEditMedModal = (med: MedicationRecord) => {
    setEditingMed(med);
    setMedName(med.name);
    setMedDosage(med.dosage);
    setMedFrequency(med.frequency);
    setMedDoctor(med.prescribingDoctor || '');
    setMedRx(med.rxNumber || '');
    setMedCritical(!!med.emergencyCritical);
    setMedNotes(med.notes || '');
    setMedPhotoUrl(med.photoUrl);
    setIsMedModalOpen(true);
  };

  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim() || !medDosage.trim()) return;

    if (editingMed) {
      onUpdateMedication({
        ...editingMed,
        name: medName.trim(),
        dosage: medDosage.trim(),
        frequency: medFrequency.trim() || 'As prescribed',
        prescribingDoctor: medDoctor.trim() || undefined,
        rxNumber: medRx.trim() || undefined,
        emergencyCritical: medCritical,
        notes: medNotes.trim() || undefined,
        photoUrl: medPhotoUrl
      });
    } else {
      const newMed: MedicationRecord = {
        id: `med-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: medName.trim(),
        dosage: medDosage.trim(),
        frequency: medFrequency.trim() || 'As prescribed',
        prescribingDoctor: medDoctor.trim() || undefined,
        rxNumber: medRx.trim() || undefined,
        emergencyCritical: medCritical,
        notes: medNotes.trim() || undefined,
        photoUrl: medPhotoUrl,
        createdAt: Date.now()
      };
      onAddMedication(newMed);
    }

    setIsMedModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    if (deletingItem.type === 'contact') {
      onDeleteContact(deletingItem.id);
    } else {
      onDeleteMedication(deletingItem.id);
    }
    setDeletingItem(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Top Banner & Quick ICE Action Bar */}
      <div className="bg-stone-900 rounded-3xl p-6 sm:p-8 text-white border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Offline-Accessible Emergency & Medical Safety Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Emergency Contacts & Companion Vault
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed">
              Store In Case of Emergency (ICE) contacts, snap camera photos of companions & prescription pill labels, and access instant local police and ambulance hotlines for {tripInfo.destination || 'your destination'}.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="camera-snap-action-button"
              type="button"
              onClick={() => onOpenCamera('companion', 'Companion Snapshot')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Snap Photo</span>
            </button>

            <button
              type="button"
              onClick={() => openAddContactModal(false, true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>
      </div>

      {/* Destination Emergency Hotlines Bar */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">
              Local Emergency Hotlines for {emergencyNumbers.country}
            </h3>
            <p className="text-xs text-stone-600">
              One-touch emergency calling available even when roaming or offline
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${emergencyNumbers.police}`}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-rose-400 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>🚨 Police: {emergencyNumbers.police}</span>
          </a>
          <a
            href={`tel:${emergencyNumbers.ambulance}`}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-amber-400 text-amber-800 hover:bg-amber-50 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>🚑 Medical: {emergencyNumbers.ambulance}</span>
          </a>
          <a
            href={`tel:${emergencyNumbers.fire}`}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-orange-400 text-orange-700 hover:bg-orange-50 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <span>🚒 Fire: {emergencyNumbers.fire}</span>
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('contacts')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'contacts'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>ICE & Emergency Contacts ({iceContacts.length + generalContacts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('companions')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'companions'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Travel Companions ({companionContacts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('medications')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'medications'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Prescriptions & Medications ({medications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('numbers')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'numbers'
              ? 'border-stone-800 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Embassy & Country Directory</span>
        </button>
      </div>

      {/* TAB 1: ICE & EMERGENCY CONTACTS */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">In Case of Emergency (ICE) Profiles</h2>
              <p className="text-xs text-stone-500">First responders and airlines will prioritize these contacts.</p>
            </div>

            <button
              type="button"
              onClick={() => openAddContactModal(false, true)}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add ICE Contact</span>
            </button>
          </div>

          {/* Contacts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <div 
                key={contact.id}
                className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between ${
                  contact.isICE ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/10' : 'border-stone-200'
                }`}
              >
                <div>
                  {/* Top row: Badges & Photo */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {contact.photoUrl ? (
                        <div 
                          onClick={() => setViewingPhoto({ url: contact.photoUrl!, title: contact.name, subtitle: contact.relationship })}
                          className="relative w-12 h-12 rounded-2xl overflow-hidden border border-stone-200 cursor-pointer group shrink-0"
                        >
                          <img 
                            src={contact.photoUrl} 
                            alt={contact.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Maximize2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          contact.isICE ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-stone-900 text-base">{contact.name}</h3>
                          {contact.isICE && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase">
                              ICE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 font-medium">{contact.relationship}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenCamera('companion', `Photo of ${contact.name}`, contact.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Take/Update Photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditContactModal(contact)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItem({ id: contact.id, type: 'contact', name: contact.name })}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Primary Phone:</span>
                      <a 
                        href={`tel:${contact.phone}`} 
                        className="font-bold text-rose-700 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{contact.phone}</span>
                      </a>
                    </div>

                    {contact.altPhone && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Alt Phone:</span>
                        <a href={`tel:${contact.altPhone}`} className="text-stone-700 hover:underline">
                          {contact.altPhone}
                        </a>
                      </div>
                    )}

                    {contact.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Email:</span>
                        <a href={`mailto:${contact.email}`} className="text-stone-700 hover:underline truncate max-w-[180px]">
                          {contact.email}
                        </a>
                      </div>
                    )}

                    {contact.bloodType && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Blood Type:</span>
                        <span className="font-bold text-rose-600">{contact.bloodType}</span>
                      </div>
                    )}

                    {contact.allergiesMedications && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-0.5">
                        <span className="font-bold block flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Allergies & Medical Notes:
                        </span>
                        <p>{contact.allergiesMedications}</p>
                      </div>
                    )}

                    {contact.insurancePolicy && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-400">Insurance:</span>
                        <span className="font-mono text-stone-700">{contact.insurancePolicy}</span>
                      </div>
                    )}

                    {contact.notes && (
                      <p className="text-[11px] text-stone-500 italic pt-1">
                        "{contact.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Direct Calling Button */}
                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center gap-2">
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex-1 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call {contact.name.split(' ')[0]}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {contacts.length === 0 && (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="font-bold text-stone-800 text-sm">No Emergency Contacts Stored</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Add family, partners, or doctors who should be notified in case of a medical or travel emergency.
              </p>
              <button
                type="button"
                onClick={() => openAddContactModal(false, true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Add Primary ICE Contact
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: TRAVEL COMPANIONS */}
      {activeTab === 'companions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Travel Companions & Co-Travelers</h2>
              <p className="text-xs text-stone-500">Keep photos, passport numbers, and room info for everyone in your party.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenCamera('companion', 'Companion Photo')}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Photo</span>
              </button>

              <button
                type="button"
                onClick={() => openAddContactModal(true, false)}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Companion</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companionContacts.map((companion) => (
              <div 
                key={companion.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {companion.photoUrl ? (
                        <div 
                          onClick={() => setViewingPhoto({ url: companion.photoUrl!, title: companion.name, subtitle: companion.relationship })}
                          className="relative w-14 h-14 rounded-2xl overflow-hidden border border-stone-200 cursor-pointer group shrink-0"
                        >
                          <img 
                            src={companion.photoUrl} 
                            alt={companion.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Maximize2 className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg shrink-0">
                          {companion.name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h3 className="font-bold text-stone-900 text-base">{companion.name}</h3>
                        <p className="text-xs text-amber-800 font-semibold">{companion.relationship}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenCamera('companion', `Photo of ${companion.name}`, companion.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Take Photo"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditContactModal(companion)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItem({ id: companion.id, type: 'contact', name: companion.name })}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Mobile Phone:</span>
                      <a href={`tel:${companion.phone}`} className="font-bold text-stone-900 hover:underline">
                        {companion.phone}
                      </a>
                    </div>

                    {companion.passportNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Passport / ID:</span>
                        <span className="font-mono font-bold text-stone-800">{companion.passportNumber}</span>
                      </div>
                    )}

                    {companion.bloodType && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Blood Group:</span>
                        <span className="font-bold text-rose-600">{companion.bloodType}</span>
                      </div>
                    )}

                    {companion.notes && (
                      <p className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-xl mt-1">
                        {companion.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center gap-2">
                  <a
                    href={`tel:${companion.phone}`}
                    className="flex-1 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Companion</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {companionContacts.length === 0 && (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <Users className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-bold text-stone-800 text-sm">No Travel Companions Listed</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Add travel buddies, family members, or co-workers who are traveling together on this journey.
              </p>
              <button
                type="button"
                onClick={() => openAddContactModal(true, false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Add Travel Companion
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEDICATIONS & PRESCRIPTIONS */}
      {activeTab === 'medications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Prescriptions & Medical Records</h2>
              <p className="text-xs text-stone-500">Capture photos of medication labels, dosage instructions, and doctor contacts.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenCamera('medication', 'Prescription Pill Label')}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap Pill Label</span>
              </button>

              <button
                type="button"
                onClick={openAddMedModal}
                className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medication</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medications.map((med) => (
              <div 
                key={med.id}
                className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col justify-between ${
                  med.emergencyCritical ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/15' : 'border-stone-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {med.photoUrl ? (
                        <div 
                          onClick={() => setViewingPhoto({ url: med.photoUrl!, title: med.name, subtitle: `${med.dosage} • ${med.frequency}` })}
                          className="relative w-14 h-14 rounded-2xl overflow-hidden border border-stone-200 cursor-pointer group shrink-0"
                        >
                          <img 
                            src={med.photoUrl} 
                            alt={med.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Maximize2 className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
                          med.emergencyCritical ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <Pill className="w-6 h-6" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-stone-900 text-sm sm:text-base">{med.name}</h3>
                          {med.emergencyCritical && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[9px] font-extrabold uppercase">
                              Critical
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-stone-600">{med.dosage}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenCamera('medication', `Label for ${med.name}`, med.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Take Photo of Pill Bottle / Label"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditMedModal(med)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItem({ id: med.id, type: 'medication', name: med.name })}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Medication Details */}
                  <div className="space-y-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                    <div>
                      <span className="text-stone-400 block text-[11px]">Frequency / Timing:</span>
                      <span className="font-semibold text-stone-800">{med.frequency}</span>
                    </div>

                    {med.prescribingDoctor && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Doctor:</span>
                        <span className="text-stone-800">{med.prescribingDoctor}</span>
                      </div>
                    )}

                    {med.rxNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Rx Number:</span>
                        <span className="font-mono font-bold text-stone-800">{med.rxNumber}</span>
                      </div>
                    )}

                    {med.notes && (
                      <p className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 mt-1">
                        {med.notes}
                      </p>
                    )}
                  </div>
                </div>

                {med.photoUrl && (
                  <div className="pt-3 mt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setViewingPhoto({ url: med.photoUrl!, title: med.name, subtitle: `${med.dosage} • ${med.frequency}` })}
                      className="w-full py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>View Prescription Label Photo</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {medications.length === 0 && (
            <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <Pill className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-stone-800 text-sm">No Prescriptions Logged</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Snap photos of your pill containers and record dosages to ensure airport customs compliance and emergency readiness.
              </p>
              <button
                type="button"
                onClick={openAddMedModal}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Add Medication Record
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EMBASSY & COUNTRY DIRECTORY */}
      {activeTab === 'numbers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  Emergency Support for Destination: {tripInfo.destination || 'Global Travel'}
                </h2>
                <p className="text-xs text-stone-500">
                  Verified emergency response codes and diplomatic embassy protocols.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-xs font-bold text-rose-800 uppercase block mb-1">Police / Law Enforcement</span>
                <span className="text-xl font-black text-rose-900">{emergencyNumbers.police}</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-bold text-amber-800 uppercase block mb-1">Ambulance / Paramedics</span>
                <span className="text-xl font-black text-amber-900">{emergencyNumbers.ambulance}</span>
              </div>
              <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                <span className="text-xs font-bold text-orange-800 uppercase block mb-1">Fire Rescue</span>
                <span className="text-xl font-black text-orange-900">{emergencyNumbers.fire}</span>
              </div>
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200">
                <span className="text-xs font-bold text-stone-700 uppercase block mb-1">General Emergency</span>
                <span className="text-xl font-black text-stone-900">{emergencyNumbers.general}</span>
              </div>
            </div>

            {emergencyNumbers.embassyPhone && (
              <div className="p-4 rounded-xl bg-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-stone-400 block font-semibold">Diplomatic Consulate Hotline</span>
                  <span className="text-sm font-bold text-amber-400">{emergencyNumbers.embassyPhone}</span>
                </div>
                <a
                  href={`tel:${emergencyNumbers.embassyPhone}`}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors text-center"
                >
                  Call Embassy Helpline
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CONTACT */}
      {/* ========================================================================= */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    {editingContact ? 'Edit Contact Details' : 'Add Emergency / Companion Contact'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Stored securely offline on your device
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* Photo preview / upload trigger */}
              <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                {contactPhotoUrl ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-stone-300 relative shrink-0">
                    <img src={contactPhotoUrl} alt="Contact" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-stone-200 text-stone-500 flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-stone-800 block">Contact Photo</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsContactModalOpen(false);
                        onOpenCamera('companion', contactName ? `Photo of ${contactName}` : 'Companion Photo', editingContact?.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo</span>
                    </button>
                    {contactPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setContactPhotoUrl(undefined)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name & Relation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emily Carter"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-rose-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spouse, Sister, Colleague"
                    value={contactRelation}
                    onChange={(e) => setContactRelation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              {/* Phone & Alt Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Primary Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 (555) 234-8901"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-rose-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Alt Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 890-1234"
                    value={contactAltPhone}
                    onChange={(e) => setContactAltPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-rose-500 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. contact@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-rose-500 transition-all"
                />
              </div>

              {/* Checkboxes for ICE / Companion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 bg-rose-50/70 border border-rose-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactIsICE}
                    onChange={(e) => setContactIsICE(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-rose-950 block">Primary ICE Contact</span>
                    <span className="text-[10px] text-rose-800">First contact to call in emergency</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactIsCompanion}
                    onChange={(e) => setContactIsCompanion(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">Travel Companion</span>
                    <span className="text-[10px] text-amber-800">Traveling with you on this trip</span>
                  </div>
                </label>
              </div>

              {/* Medical info (Blood Type & Allergies) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Blood Type (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. O+, A-, B+"
                    value={contactBloodType}
                    onChange={(e) => setContactBloodType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-rose-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Passport / ID # (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. USA #982341029"
                    value={contactPassport}
                    onChange={(e) => setContactPassport(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-rose-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Allergies / Medical Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Allergies / Critical Medical Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Penicillin allergy (severe), Asthma, Diabetic"
                  value={contactAllergies}
                  onChange={(e) => setContactAllergies(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-rose-500 transition-all resize-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  General Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hotel room 402, Holds power of attorney, Speaks Japanese"
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-rose-500 transition-all resize-none"
                />
              </div>

              <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between shrink-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {editingContact ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT MEDICATION */}
      {/* ========================================================================= */}
      {isMedModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-lg w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    {editingMed ? 'Edit Medication Record' : 'Add Medication / Prescription'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Track pill instructions and store bottle label photos
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMedModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMed} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* Photo preview / upload trigger */}
              <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                {medPhotoUrl ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-stone-300 relative shrink-0">
                    <img src={medPhotoUrl} alt="Medication" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-stone-200 text-stone-500 flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-stone-800 block">Pill Bottle / Prescription Label Photo</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMedModalOpen(false);
                        onOpenCamera('medication', medName ? `Label for ${medName}` : 'Prescription Label', editingMed?.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo</span>
                    </button>
                    {medPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setMedPhotoUrl(undefined)}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Medication Name & Dosage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Medication Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atorvastatin, Albuterol"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Dosage / Strength *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20mg, 1 spray, 500mg"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Frequency & Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 tablet daily at bedtime with water"
                  value={medFrequency}
                  onChange={(e) => setMedFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Doctor & Rx Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Prescribing Doctor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Robert Hayes"
                    value={medDoctor}
                    onChange={(e) => setMedDoctor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Rx Number / Pharmacy
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RX-982341-B"
                    value={medRx}
                    onChange={(e) => setMedRx(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Emergency Critical Checkbox */}
              <label className="flex items-center gap-2 p-3 bg-rose-50/70 border border-rose-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={medCritical}
                  onChange={(e) => setMedCritical(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-bold text-rose-950 block">Emergency Critical Medication</span>
                  <span className="text-[10px] text-rose-800">Must always be packed in carry-on bag / kept with traveler</span>
                </div>
              </label>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Storage & Custom Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Keep refrigerated, Do not expose to direct sunlight"
                  value={medNotes}
                  onChange={(e) => setMedNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between shrink-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setIsMedModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {editingMed ? 'Save Changes' : 'Add Medication'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHOTO LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {viewingPhoto && (
        <div 
          onClick={() => setViewingPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-stone-900 rounded-3xl overflow-hidden border border-stone-800 flex flex-col shadow-2xl"
          >
            <div className="p-4 flex items-center justify-between border-b border-stone-800 text-white">
              <div>
                <h3 className="font-bold text-sm sm:text-base">{viewingPhoto.title}</h3>
                {viewingPhoto.subtitle && <p className="text-xs text-stone-400">{viewingPhoto.subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={() => setViewingPhoto(null)}
                className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex items-center justify-center bg-black/50 max-h-[75vh]">
              <img 
                src={viewingPhoto.url} 
                alt={viewingPhoto.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-stone-900 text-base">Delete {deletingItem.type === 'contact' ? 'Contact' : 'Medication'}?</h3>
              <p className="text-xs text-stone-500">
                Are you sure you want to remove <span className="font-semibold text-stone-800">"{deletingItem.name}"</span>?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
