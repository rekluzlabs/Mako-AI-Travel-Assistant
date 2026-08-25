import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Download, 
  Trash2, 
  Eye, 
  Pin, 
  PinOff, 
  Copy, 
  CheckCircle2, 
  Plane, 
  Building2, 
  ShieldCheck, 
  FileCheck, 
  FolderArchive, 
  ListOrdered,
  Calendar,
  Briefcase,
  AlertCircle,
  ExternalLink,
  Tag,
  Hash,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { TravelDocument, DocumentCategory, SavedPackingList, TripInfo, PackingItem } from '../types';
import { formatFileSize, downloadFile, exportPackingListToCSV } from '../utils/fileVault';

interface DocumentVaultViewProps {
  documents: TravelDocument[];
  savedLists: SavedPackingList[];
  activeTripInfo: TripInfo;
  activePackingList: PackingItem[];
  onUploadClick: () => void;
  onOpenCamera?: (category: 'document', title?: string) => void;
  onPreviewDocument: (doc: TravelDocument) => void;
  onScanDocument: (doc: TravelDocument) => void;
  onDeleteDocument: (id: string) => void;
  onTogglePinDocument: (id: string) => void;
  onSwitchPackingList: (list: SavedPackingList) => void;
  onSaveCurrentListAsNew: () => void;
  onImportListFileClick: () => void;
  onDeleteSavedList: (id: string) => void;
  onDuplicateSavedList: (list: SavedPackingList) => void;
  onFileDrop: (file: File) => void;
  isOnline: boolean;
}

export const DocumentVaultView: React.FC<DocumentVaultViewProps> = ({
  documents,
  savedLists,
  activeTripInfo,
  activePackingList,
  onUploadClick,
  onOpenCamera,
  onPreviewDocument,
  onScanDocument,
  onDeleteDocument,
  onTogglePinDocument,
  onSwitchPackingList,
  onSaveCurrentListAsNew,
  onImportListFileClick,
  onDeleteSavedList,
  onDuplicateSavedList,
  onFileDrop,
  isOnline
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'documents' | 'packing_lists'>('documents');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileDrop(e.dataTransfer.files[0]);
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.referenceCode && doc.referenceCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.linkedDestination && doc.linkedDestination.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Pinned documents first
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.uploadDate - a.uploadDate;
  });

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'tickets': return <Plane className="w-4 h-4 text-amber-600" />;
      case 'hotel': return <Building2 className="w-4 h-4 text-sky-600" />;
      case 'passport_id': return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'insurance': return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      case 'activities': return <Calendar className="w-4 h-4 text-violet-600" />;
      case 'packing_list': return <FileCheck className="w-4 h-4 text-amber-700" />;
      default: return <FileText className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 space-y-6 transition-all ${
        isDraggingOver ? 'bg-amber-50/50 ring-4 ring-amber-400 ring-inset' : 'bg-stone-50/50'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Document & Packing List Vault
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                100% Offline Vault
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Store travel tickets, IDs, booking confirmations, and manage multiple saved packing lists with offline access.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenCamera && (
              <button
                id="camera-snap-document-button"
                onClick={() => onOpenCamera('document')}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Snap Photo / Doc</span>
              </button>
            )}

            <button
              id="upload-document-button"
              onClick={onUploadClick}
              className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>

            <button
              id="save-current-list-button"
              onClick={onSaveCurrentListAsNew}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save Current List</span>
            </button>
          </div>
        </div>

        {/* Top Switcher: Travel Documents vs. Saved Packing Lists */}
        <div className="flex items-center justify-between border-b border-stone-200 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('documents')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeSubTab === 'documents'
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              <span>Travel Documents & Tickets</span>
              <span className={`text-[11px] px-2 py-0.2 rounded-full ${
                activeSubTab === 'documents' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
              }`}>
                {documents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('packing_lists')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeSubTab === 'packing_lists'
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Saved Packing Lists</span>
              <span className={`text-[11px] px-2 py-0.2 rounded-full ${
                activeSubTab === 'packing_lists' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
              }`}>
                {savedLists.length}
              </span>
            </button>
          </div>

          <div className="text-xs text-stone-400 pb-2 hidden md:block">
            💡 Drag & drop any document or packing file anywhere on this screen to import
          </div>
        </div>

        {/* ----------------- SUBTAB 1: TRAVEL DOCUMENTS ----------------- */}
        {activeSubTab === 'documents' && (
          <div className="space-y-4">
            
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search documents by name, booking reference, or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'all', label: 'All Files', count: documents.length },
                  { id: 'tickets', label: 'Tickets & Flights', count: documents.filter(d => d.category === 'tickets').length },
                  { id: 'hotel', label: 'Hotels & Stays', count: documents.filter(d => d.category === 'hotel').length },
                  { id: 'passport_id', label: 'Passports & IDs', count: documents.filter(d => d.category === 'passport_id').length },
                  { id: 'insurance', label: 'Insurance', count: documents.filter(d => d.category === 'insurance').length },
                  { id: 'packing_list', label: 'List Files', count: documents.filter(d => d.category === 'packing_list').length },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat.id ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-600'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop Quick Notice Banner */}
            {isDraggingOver && (
              <div className="p-8 border-2 border-dashed border-amber-500 bg-amber-100/60 rounded-2xl text-center space-y-2 animate-pulse">
                <UploadCloud className="w-10 h-10 text-amber-700 mx-auto" />
                <h3 className="text-base font-bold text-amber-900">Drop your file to upload to vault</h3>
                <p className="text-xs text-amber-800">File will be safely saved for offline access</p>
              </div>
            )}

            {/* Document Grid */}
            {sortedDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedDocuments.map((doc) => {
                  const isPDF = doc.fileType?.includes('pdf') || doc.fileName.endsWith('.pdf');
                  const isImage = doc.fileType?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(doc.fileName);

                  return (
                    <div
                      key={doc.id}
                      className={`bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden group ${
                        doc.isPinned ? 'border-amber-300 ring-1 ring-amber-300/50' : 'border-stone-200'
                      }`}
                    >
                      {/* Optional Image / Photo Header Preview */}
                      {(isImage || doc.photoUrl) && (
                        <div 
                          onClick={() => onPreviewDocument(doc)}
                          className="w-full h-36 bg-stone-950/5 relative overflow-hidden border-b border-stone-100 cursor-pointer group-hover:opacity-95 transition-opacity"
                        >
                          <img 
                            src={doc.photoUrl || doc.fileData} 
                            alt={doc.name} 
                            className="w-full h-full object-cover object-center"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent flex items-end p-2.5">
                            <span className="text-[11px] text-white font-medium flex items-center gap-1 drop-shadow-xs">
                              <Eye className="w-3.5 h-3.5" /> Tap to expand photo
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Card Header */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                              {isImage ? <ImageIcon className="w-4 h-4 text-amber-600" /> : getCategoryIcon(doc.category)}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                                {doc.category.replace('_', ' ')}
                              </span>
                              <h3 className="font-bold text-stone-900 text-sm truncate" title={doc.name}>
                                {doc.name}
                              </h3>
                            </div>
                          </div>

                          {/* Pin Button */}
                          <button
                            onClick={() => onTogglePinDocument(doc.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              doc.isPinned 
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                                : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'
                            }`}
                            title={doc.isPinned ? 'Pinned Essential Document' : 'Pin to Top'}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                        </div>

                        {/* File Details & Size */}
                        <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
                          <span className="font-mono text-[11px] truncate max-w-[170px]" title={doc.fileName}>
                            {doc.fileName}
                          </span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                        </div>

                        {/* Reference / Confirmation Code Box */}
                        {doc.referenceCode && (
                          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs">
                            <span className="font-bold text-amber-900 flex items-center gap-1">
                              <Hash className="w-3.5 h-3.5 text-amber-600" />
                              Ref: <span className="font-mono">{doc.referenceCode}</span>
                            </span>
                            <button
                              onClick={() => handleCopyCode(doc.referenceCode!)}
                              className="text-amber-800 hover:text-amber-950 p-0.5 cursor-pointer"
                              title="Copy confirmation code"
                            >
                              {copiedCode === doc.referenceCode ? (
                                <span className="text-[10px] font-bold text-emerald-700">Copied!</span>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Notes Preview */}
                        {doc.notes && (
                          <p className="text-xs text-stone-600 line-clamp-2 italic bg-stone-50 p-2 rounded-lg">
                            "{doc.notes}"
                          </p>
                        )}

                        {/* Scanned Badge */}
                        {doc.parsedInfo && (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              {doc.parsedInfo.detectedItems?.length || 0} packing items deduced
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onPreviewDocument(doc)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Preview / Read Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => onScanDocument(doc)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Scan with AI for trip items"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Scan</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => downloadFile(doc.fileData, doc.fileName)}
                            className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                            title="Download to device"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteDocument(doc.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-stone-400 hover:text-rose-700 transition-colors cursor-pointer"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                  <FolderArchive className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-base">No documents found</h3>
                  <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mt-1">
                    {searchQuery 
                      ? 'No files matched your search keyword. Try clearing filters.' 
                      : 'Upload tickets, reservations, or packing records to keep them accessible offline at any time.'}
                  </p>
                </div>
                <button
                  onClick={onUploadClick}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload First Document</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------- SUBTAB 2: SAVED PACKING LISTS ----------------- */}
        {activeSubTab === 'packing_lists' && (
          <div className="space-y-4">
            
            {/* Top Packing Lists Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              <div>
                <span className="font-bold text-stone-900 text-sm">Packing List Archives</span>
                <p className="text-xs text-stone-500">
                  Switch between different trips, import packing list files (.csv, .json, .txt), or backup current list.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onImportListFileClick}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Import external .json, .csv, or .txt packing list file"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-stone-600" />
                  <span>Import List File</span>
                </button>

                <button
                  onClick={() => {
                    const csv = exportPackingListToCSV(activePackingList, activeTripInfo);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    downloadFile(blob, `packing_list_${activeTripInfo.destination.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Export active packing list to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>Export Active (CSV)</span>
                </button>
              </div>
            </div>

            {/* Saved Packing List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedLists.map((list) => {
                const total = list.items.length;
                const packed = list.items.filter(i => i.packed).length;
                const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;
                const isActive = list.destination === activeTripInfo.destination && list.title === activeTripInfo.notes;

                return (
                  <div
                    key={list.id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      
                      {/* Destination & Title */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                            {list.destination}
                          </span>
                          <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                            {list.title}
                          </h3>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </div>
                      </div>

                      {list.description && (
                        <p className="text-xs text-stone-500 line-clamp-2">
                          {list.description}
                        </p>
                      )}

                      {/* Progress Bar & Stats */}
                      <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 border border-stone-100">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-stone-700">Packed Progress</span>
                          <span className="text-amber-800 font-mono">{packed}/{total} items ({percentage}%)</span>
                        </div>
                        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${percentage === 100 ? 'bg-emerald-500' : 'bg-amber-600'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Date & Tags */}
                      <div className="flex items-center justify-between text-[11px] text-stone-400">
                        <span>Updated: {new Date(list.updatedAt).toLocaleDateString()}</span>
                        <span>{list.tripInfo?.durationDays || 7} Days Trip</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSwitchPackingList(list)}
                        className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Load / Switch to List</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const jsonStr = JSON.stringify(list, null, 2);
                            const blob = new Blob([jsonStr], { type: 'application/json' });
                            downloadFile(blob, `${list.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_list.json`);
                          }}
                          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Export list as JSON"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateSavedList(list)}
                          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Duplicate list"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteSavedList(list.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete saved list record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
