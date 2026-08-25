import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { PackingListDashboard } from './components/PackingListDashboard';
import { TripPlannerView } from './components/TripPlannerView';
import { AddonManager } from './components/AddonManager';
import { OfflineHandbook } from './components/OfflineHandbook';
import { DocumentVaultView } from './components/DocumentVaultView';
import { EmergencyContactsView } from './components/EmergencyContactsView';
import { CameraCaptureModal, CapturedPhotoPayload, PhotoCategory } from './components/CameraCaptureModal';
import { UploadDocumentModal } from './components/UploadDocumentModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { DocumentScanModal } from './components/DocumentScanModal';
import { ImportListFileModal } from './components/ImportListFileModal';
import { PackingTemplateModal } from './components/PackingTemplateModal';
import { PackingAuditModal } from './components/PackingAuditModal';
import { TripSettingsModal } from './components/TripSettingsModal';
import { 
  PackingItem, 
  TripInfo, 
  AddonModule, 
  ChatMessage, 
  PackingTemplate, 
  PackingCategory, 
  LuggageType, 
  ItemPriority,
  TravelDocument,
  DocumentCategory,
  SavedPackingList,
  EmergencyContact,
  MedicationRecord
} from './types';
import { 
  loadPackingList, 
  savePackingList, 
  loadTripInfo, 
  saveTripInfo, 
  loadAddons, 
  saveAddons,
  loadEmergencyContacts,
  saveEmergencyContacts,
  loadMedications,
  saveMedications,
  DEFAULT_TRIP,
  EMPTY_TRIP,
  DEFAULT_PACKING_ITEMS
} from './utils/storage';
import { 
  getAllDocuments, 
  saveDocument, 
  deleteDocument, 
  getAllSavedLists, 
  savePackingListRecord, 
  deleteSavedList,
  SAMPLE_SAVED_LISTS
} from './utils/fileVault';
import { guessCategory, guessLuggageType } from './utils/offlineEngine';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'chat' | 'packing' | 'vault' | 'emergency' | 'trip' | 'addons' | 'handbook'>('chat');

  // Network Online/Offline State with real listener + test override
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [manualOfflineOverride, setIsOnlineManualOverride] = useState<boolean | null>(null);

  // Effective online status
  const isOnline = manualOfflineOverride !== null ? manualOfflineOverride : isBrowserOnline;

  // Primary Data States with LocalStorage Persistence
  const [packingList, setPackingList] = useState<PackingItem[]>(() => loadPackingList());
  const [tripInfo, setTripInfo] = useState<TripInfo>(() => loadTripInfo());
  const [addons, setAddons] = useState<AddonModule[]>(() => loadAddons());
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => loadEmergencyContacts());
  const [medications, setMedications] = useState<MedicationRecord[]>(() => loadMedications());

  // Document Vault and Multiple Saved Packing Lists State (Stored in IndexedDB / LocalStorage)
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [savedLists, setSavedLists] = useState<SavedPackingList[]>([]);

  // Modal Visibility States
  const [showTripModal, setShowTripModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showUploadDocModal, setShowUploadDocModal] = useState(false);
  const [showImportListModal, setShowImportListModal] = useState(false);

  // Live Camera Capture Modal State
  const [cameraModal, setCameraModal] = useState<{
    isOpen: boolean;
    defaultCategory?: PhotoCategory;
    defaultTitle?: string;
    targetId?: string;
  }>({
    isOpen: false,
    defaultCategory: 'document',
    defaultTitle: '',
    targetId: undefined
  });

  // Active Document Modals
  const [previewingDoc, setPreviewingDoc] = useState<TravelDocument | null>(null);
  const [scanningDoc, setScanningDoc] = useState<TravelDocument | null>(null);

  // Chatbot Messages State
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello! I'm **TravelBot**, your AI travel planner, intelligent packing assistant, and travel document organizer.\n\nHere's what I can do for you:\n• 🗂️ **Store & Scan Documents**: Upload boarding passes, hotel vouchers, and tickets to extract trip details and packing items\n• 📋 **Manage Multiple Packing Lists**: Keep records of different packing checklists for beach, business, and hiking trips\n• 🌦️ **Recommend Clothes & Climate Gear**: Weather-adaptive suggestions for **${tripInfo.destination || 'your destination'}**\n• 🧳 **Track Real-Time Baggage**: Carry-on, checked, and personal item weight estimates\n• ✈️ **Check Airport Security Rules**: Offline TSA & airline liquid/battery handbook\n\n*All documents and packing lists are encrypted & saved locally on your device for seamless offline use!*`,
      timestamp: Date.now(),
      suggestedActions: [
        { label: `Plan trip to ${tripInfo.destination}`, promptText: `Help me plan a 5-day itinerary for ${tripInfo.destination}` },
        { label: "What's missing from my list?", promptText: "What critical items do I still need to pack?" },
        { label: "Pack 2x T-shirts & adapter", promptText: "Add 2 breathable t-shirts and universal power adapter to my packing list" },
        { label: "TSA Liquid & Battery Rules", promptText: "Can I bring power banks and liquids on the airplane?" }
      ]
    }
  ]);

  // Load Documents and Saved Lists from IndexedDB on startup
  useEffect(() => {
    let isMounted = true;
    const initializeVault = async () => {
      try {
        const loadedDocs = await getAllDocuments();
        const loadedLists = await getAllSavedLists();
        if (isMounted) {
          setDocuments(loadedDocs);
          setSavedLists(loadedLists.length > 0 ? loadedLists : SAMPLE_SAVED_LISTS);
        }
      } catch (err) {
        console.warn('Vault initialization fallback', err);
      }
    };
    initializeVault();
    return () => { isMounted = false; };
  }, []);

  // Sync to LocalStorage on changes
  useEffect(() => {
    savePackingList(packingList);
  }, [packingList]);

  useEffect(() => {
    saveTripInfo(tripInfo);
  }, [tripInfo]);

  useEffect(() => {
    saveAddons(addons);
  }, [addons]);

  useEffect(() => {
    saveEmergencyContacts(emergencyContacts);
  }, [emergencyContacts]);

  useEffect(() => {
    saveMedications(medications);
  }, [medications]);

  // Network Listeners
  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handler: Add items to packing list
  const handleAddPackingItems = useCallback((newItems: any[]) => {
    setPackingList(prev => {
      const addedItems: PackingItem[] = [];
      
      newItems.forEach(item => {
        const itemName = typeof item === 'string' ? item.trim() : item.name?.trim();
        if (!itemName) return;

        // Check if item already exists
        const existing = prev.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        if (existing) {
          // If already exists, increment quantity
          existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
        } else {
          const category = (item.category as PackingCategory) || guessCategory(itemName);
          const luggageType = (item.luggageType as LuggageType) || guessLuggageType(category, itemName);
          const priority = (item.priority as ItemPriority) || (category === 'documents' || category === 'health_meds' ? 'essential' : 'recommended');

          addedItems.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name: itemName,
            category,
            quantity: typeof item.quantity === 'number' ? item.quantity : 1,
            packed: Boolean(item.packed),
            luggageType,
            priority,
            notes: item.notes || '',
            weightGrams: item.weightGrams || 150,
            createdAt: item.createdAt || Date.now(),
          });
        }
      });

      return [...prev, ...addedItems];
    });
  }, []);

  // Handler: Update packed status
  const handleUpdatePackingStatus = useCallback((itemNames: string[], packed: boolean) => {
    setPackingList(prev => prev.map(item => {
      const isMatch = itemNames.some(name => 
        item.name.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(item.name.toLowerCase())
      );
      if (isMatch) {
        return { ...item, packed };
      }
      return item;
    }));
  }, []);

  // Handler: Remove items
  const handleRemovePackingItems = useCallback((itemNames: string[]) => {
    setPackingList(prev => prev.filter(item => {
      const isMatch = itemNames.some(name => 
        item.name.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(item.name.toLowerCase())
      );
      return !isMatch;
    }));
  }, []);

  // Handler: Apply template
  const handleApplyTemplate = (template: PackingTemplate, mode: 'replace' | 'merge') => {
    const templateItems: PackingItem[] = template.items.map(t => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: t.name,
      category: t.category,
      quantity: t.quantity,
      packed: false,
      luggageType: t.luggageType,
      priority: t.priority,
      notes: t.notes || '',
      weightGrams: 150,
      createdAt: Date.now(),
    }));

    if (mode === 'replace') {
      setPackingList(templateItems);
      setTripInfo(prev => ({
        ...prev,
        climate: template.climate,
        durationDays: template.durationDays,
        notes: `Applied Preset: ${template.title}`,
      }));
    } else {
      handleAddPackingItems(templateItems);
    }
  };

  // Handler: Reload sample trip data
  const handleReloadAllData = () => {
    setPackingList(DEFAULT_PACKING_ITEMS);
    setTripInfo(DEFAULT_TRIP);
    setShowTripModal(false);
  };

  // Document Vault Handlers
  const handleSaveDocument = async (doc: TravelDocument, autoScan?: boolean) => {
    try {
      await saveDocument(doc);
      setDocuments(prev => {
        const idx = prev.findIndex(d => d.id === doc.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = doc;
          return next;
        }
        return [doc, ...prev];
      });
      if (autoScan) {
        setScanningDoc(doc);
      }
    } catch (err) {
      console.error('Failed to save document', err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (previewingDoc?.id === id) setPreviewingDoc(null);
      if (scanningDoc?.id === id) setScanningDoc(null);
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  const handleTogglePinDocument = async (id: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const updated = { ...doc, isPinned: !doc.isPinned };
    await handleSaveDocument(updated);
  };

  // Saved Lists Handlers
  const handleSaveCurrentAsList = async (customTitle?: string) => {
    const listTitle = customTitle || `${tripInfo.destination} Checklist (${new Date().toLocaleDateString()})`;
    const newListRecord: SavedPackingList = {
      id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: listTitle,
      description: tripInfo.notes || `Saved record for ${tripInfo.destination}`,
      destination: tripInfo.destination,
      items: JSON.parse(JSON.stringify(packingList)),
      tripInfo: JSON.parse(JSON.stringify(tripInfo)),
      itemCount: packingList.length,
      packedCount: packingList.filter(i => i.packed).length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [tripInfo.tripType, tripInfo.climate],
    };

    await savePackingListRecord(newListRecord);
    setSavedLists(prev => [newListRecord, ...prev.filter(l => l.id !== newListRecord.id)]);
  };

  const handleSwitchPackingList = (savedList: SavedPackingList) => {
    setPackingList(JSON.parse(JSON.stringify(savedList.items)));
    if (savedList.tripInfo) {
      setTripInfo(JSON.parse(JSON.stringify(savedList.tripInfo)));
    } else {
      setTripInfo(prev => ({
        ...prev,
        destination: savedList.destination || prev.destination,
        notes: savedList.title,
      }));
    }
    setActiveTab('packing');
  };

  const handleDeleteSavedList = async (id: string) => {
    await deleteSavedList(id);
    setSavedLists(prev => prev.filter(l => l.id !== id));
  };

  const handleDuplicateSavedList = async (list: SavedPackingList) => {
    const duplicated: SavedPackingList = {
      ...list,
      id: `list-copy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: `${list.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: JSON.parse(JSON.stringify(list.items)),
    };
    await savePackingListRecord(duplicated);
    setSavedLists(prev => [duplicated, ...prev]);
  };

  const handleFileDropDirect = async (file: File) => {
    try {
      const data = await (await import('./utils/fileVault')).readFileAsDataURL(file);
      const cat: DocumentCategory = /flight|ticket|boarding|airline/i.test(file.name)
        ? 'tickets'
        : /hotel|airbnb|booking|reservation|hostel/i.test(file.name)
        ? 'hotel'
        : /passport|visa|id|insurance/i.test(file.name)
        ? 'passport_id'
        : 'general';

      const newDoc: TravelDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
        category: cat,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        fileData: data,
        uploadDate: Date.now(),
        linkedDestination: tripInfo.destination,
      };
      await handleSaveDocument(newDoc, isOnline);
    } catch (e) {
      console.error('Failed to process dropped file', e);
    }
  };

  // Import packing list file (.csv / .json / .txt)
  const handleImportPackingListItems = (
    importedItems: PackingItem[], 
    mode: 'replace' | 'merge' | 'new_record',
    listTitle?: string
  ) => {
    // Ensure all imported items have createdAt timestamp
    const safeItems = importedItems.map(item => ({
      ...item,
      createdAt: item.createdAt || Date.now(),
    }));

    if (mode === 'replace') {
      setPackingList(safeItems);
      if (listTitle) {
        setTripInfo(prev => ({ ...prev, destination: listTitle }));
      }
      setActiveTab('packing');
    } else if (mode === 'merge') {
      handleAddPackingItems(safeItems);
      setActiveTab('packing');
    } else if (mode === 'new_record') {
      const record: SavedPackingList = {
        id: `list-import-${Date.now()}`,
        title: listTitle || 'Imported File Checklist',
        description: 'Imported from checklist file',
        destination: listTitle || tripInfo.destination,
        items: safeItems,
        tripInfo: {
          ...tripInfo,
          destination: listTitle || tripInfo.destination,
        },
        itemCount: safeItems.length,
        packedCount: safeItems.filter(i => i.packed).length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      savePackingListRecord(record);
      setSavedLists(prev => [record, ...prev]);
    }
  };

  // Camera Open Trigger Handler
  const handleOpenCamera = (
    category: PhotoCategory = 'document',
    title: string = '',
    targetId?: string
  ) => {
    setCameraModal({
      isOpen: true,
      defaultCategory: category,
      defaultTitle: title,
      targetId: targetId
    });
  };

  // Captured Camera Photo Handler
  const handlePhotoSaved = async (payload: CapturedPhotoPayload) => {
    if (payload.category === 'companion' && payload.targetId) {
      // Update existing companion with photo
      setEmergencyContacts(prev => prev.map(c => 
        c.id === payload.targetId ? { ...c, photoUrl: payload.dataUrl } : c
      ));
    } else if (payload.category === 'medication' && payload.targetId) {
      // Update medication record with photo of bottle
      setMedications(prev => prev.map(m => 
        m.id === payload.targetId ? { ...m, photoUrl: payload.dataUrl } : m
      ));
    } else {
      // Save as a document in vault
      const newDoc: TravelDocument = {
        id: `doc-photo-${Date.now()}`,
        name: payload.title || 'Camera Snapshot',
        category: (payload.category === 'medication' || payload.category === 'companion') ? 'general' : (payload.category === 'document' ? 'tickets' : 'general'),
        fileName: `${(payload.title || 'photo').toLowerCase().replace(/[^a-z0-9]/gi, '_')}.jpg`,
        fileType: 'image/jpeg',
        fileSize: Math.round(payload.dataUrl.length * 0.75),
        fileData: payload.dataUrl,
        uploadDate: Date.now(),
        notes: payload.notes || '',
        referenceCode: payload.referenceCode,
        photoUrl: payload.dataUrl,
        linkedDestination: tripInfo.destination
      };
      await handleSaveDocument(newDoc, isOnline);
    }
  };

  // Emergency Contact Handlers
  const handleAddContact = (contact: EmergencyContact) => {
    setEmergencyContacts(prev => [contact, ...prev]);
  };

  const handleUpdateContact = (updated: EmergencyContact) => {
    setEmergencyContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
  };

  // Medication Handlers
  const handleAddMedication = (med: MedicationRecord) => {
    setMedications(prev => [med, ...prev]);
  };

  const handleUpdateMedication = (updated: MedicationRecord) => {
    setMedications(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  // Stats for Navbar
  const totalItemsCount = packingList.length;
  const packedItemsCount = packingList.filter(i => i.packed).length;
  const enabledAddonsCount = addons.filter(a => a.enabled).length;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        setIsOnlineManualOverride={setIsOnlineManualOverride}
        manualOfflineOverride={manualOfflineOverride}
        tripInfo={tripInfo}
        onOpenTripModal={() => setShowTripModal(true)}
        totalItems={totalItemsCount}
        packedItems={packedItemsCount}
        enabledAddonsCount={enabledAddonsCount}
        totalDocumentsCount={documents.length}
        emergencyContactsCount={emergencyContacts.length}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            setMessages={setMessages}
            isOnline={isOnline}
            packingList={packingList}
            tripInfo={tripInfo}
            addons={addons}
            onAddPackingItems={handleAddPackingItems}
            onUpdatePackingStatus={handleUpdatePackingStatus}
            onRemovePackingItems={handleRemovePackingItems}
            onTriggerAudit={() => setShowAuditModal(true)}
            onOpenTemplateModal={() => setShowTemplateModal(true)}
            onSaveDocumentFromChat={(doc) => handleSaveDocument(doc, false)}
            onOpenVaultTab={() => setActiveTab('vault')}
          />
        )}

        {activeTab === 'packing' && (
          <PackingListDashboard
            items={packingList}
            setItems={setPackingList}
            tripInfo={tripInfo}
            isOnline={isOnline}
            onOpenAuditModal={() => setShowAuditModal(true)}
            onOpenTemplateModal={() => setShowTemplateModal(true)}
            onOpenTripModal={() => setShowTripModal(true)}
            savedLists={savedLists}
            onSwitchPackingList={handleSwitchPackingList}
            onSaveCurrentAsNewRecord={() => handleSaveCurrentAsList()}
            onImportListFileClick={() => setShowImportListModal(true)}
            onOpenVaultTab={() => setActiveTab('vault')}
          />
        )}

        {activeTab === 'vault' && (
          <DocumentVaultView
            documents={documents}
            savedLists={savedLists}
            activeTripInfo={tripInfo}
            activePackingList={packingList}
            onUploadClick={() => setShowUploadDocModal(true)}
            onOpenCamera={(cat, title) => handleOpenCamera(cat, title)}
            onImportListFileClick={() => setShowImportListModal(true)}
            onDeleteDocument={handleDeleteDocument}
            onTogglePinDocument={handleTogglePinDocument}
            onPreviewDocument={(doc) => setPreviewingDoc(doc)}
            onScanDocument={(doc) => setScanningDoc(doc)}
            onSaveCurrentListAsNew={() => handleSaveCurrentAsList()}
            onSwitchPackingList={handleSwitchPackingList}
            onDeleteSavedList={handleDeleteSavedList}
            onDuplicateSavedList={handleDuplicateSavedList}
            onFileDrop={handleFileDropDirect}
            isOnline={isOnline}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyContactsView
            contacts={emergencyContacts}
            medications={medications}
            tripInfo={tripInfo}
            onAddContact={handleAddContact}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            onAddMedication={handleAddMedication}
            onUpdateMedication={handleUpdateMedication}
            onDeleteMedication={handleDeleteMedication}
            onOpenCamera={(cat, title, targetId) => handleOpenCamera(cat, title, targetId)}
          />
        )}

        {activeTab === 'trip' && (
          <TripPlannerView
            tripInfo={tripInfo}
            setTripInfo={setTripInfo}
            packingList={packingList}
            onOpenTripModal={() => setShowTripModal(true)}
            onNavigateToPacking={() => setActiveTab('packing')}
            onResetTrip={() => setTripInfo(EMPTY_TRIP)}
            isOnline={isOnline}
          />
        )}

        {activeTab === 'addons' && (
          <AddonManager
            addons={addons}
            setAddons={setAddons}
            isOnline={isOnline}
          />
        )}

        {activeTab === 'handbook' && (
          <OfflineHandbook />
        )}
      </main>

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={cameraModal.isOpen}
        onClose={() => setCameraModal(prev => ({ ...prev, isOpen: false }))}
        onPhotoSaved={handlePhotoSaved}
        defaultCategory={cameraModal.defaultCategory}
        defaultTitle={cameraModal.defaultTitle}
        targetId={cameraModal.targetId}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={showUploadDocModal}
        onClose={() => setShowUploadDocModal(false)}
        onSaveDocument={handleSaveDocument}
        onOpenCamera={(cat, title) => handleOpenCamera(cat, title)}
        tripInfo={tripInfo}
        isOnline={isOnline}
      />

      {/* Import Packing List File (.csv / .json / .txt) */}
      <ImportListFileModal
        isOpen={showImportListModal}
        onClose={() => setShowImportListModal(false)}
        onImportItems={handleImportPackingListItems}
      />

      {/* Document Viewer Modal */}
      <DocumentPreviewModal
        document={previewingDoc}
        isOpen={previewingDoc !== null}
        onClose={() => setPreviewingDoc(null)}
        onScanDocument={(doc) => {
          setPreviewingDoc(null);
          setScanningDoc(doc);
        }}
        onAddDetectedItems={(items) => handleAddPackingItems(items)}
      />

      {/* AI Document Scanner Modal */}
      <DocumentScanModal
        document={scanningDoc}
        isOpen={scanningDoc !== null}
        onClose={() => setScanningDoc(null)}
        isOnline={isOnline}
        onApplyDetectedItems={(items) => {
          handleAddPackingItems(items);
          setActiveTab('packing');
        }}
        onUpdateTripDetails={(dest) => {
          setTripInfo(prev => ({ ...prev, destination: dest }));
        }}
      />

      {/* Trip Details Modal */}
      <TripSettingsModal
        isOpen={showTripModal}
        onClose={() => setShowTripModal(false)}
        tripInfo={tripInfo}
        setTripInfo={setTripInfo}
        onReloadAllData={handleReloadAllData}
        onDeleteTrip={() => setTripInfo(EMPTY_TRIP)}
      />

      {/* Packing Templates Preset Modal */}
      <PackingTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onApplyTemplate={handleApplyTemplate}
        tripInfo={tripInfo}
      />

      {/* AI Packing Audit Modal */}
      <PackingAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        packingList={packingList}
        tripInfo={tripInfo}
        isOnline={isOnline}
        onAddMissingItem={(item) => handleAddPackingItems([item])}
      />

    </div>
  );
}
