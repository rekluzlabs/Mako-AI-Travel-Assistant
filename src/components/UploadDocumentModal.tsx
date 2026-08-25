import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Tag, 
  Hash, 
  Sparkles, 
  MapPin, 
  AlertCircle, 
  File, 
  CheckCircle2,
  Camera
} from 'lucide-react';
import { TravelDocument, DocumentCategory, TripInfo } from '../types';
import { readFileAsDataURL, formatFileSize } from '../utils/fileVault';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument: (doc: TravelDocument, autoScan: boolean) => void;
  onOpenCamera?: (category: 'document', title?: string) => void;
  tripInfo: TripInfo;
  isOnline: boolean;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSaveDocument,
  onOpenCamera,
  tripInfo,
  isOnline
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('tickets');
  const [referenceCode, setReferenceCode] = useState('');
  const [linkedDestination, setLinkedDestination] = useState(tripInfo.destination || '');
  const [notes, setNotes] = useState('');
  const [autoScan, setAutoScan] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);

    // Default name if empty
    if (!name) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      setName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Auto categorize based on filename
    const lowerName = selectedFile.name.toLowerCase();
    if (/flight|ticket|boarding|airline|train|transit/i.test(lowerName)) {
      setCategory('tickets');
    } else if (/hotel|airbnb|booking|resort|hostel|stay/i.test(lowerName)) {
      setCategory('hotel');
    } else if (/passport|visa|license|id|identity/i.test(lowerName)) {
      setCategory('passport_id');
    } else if (/insurance|policy|medical|health|claim/i.test(lowerName)) {
      setCategory('insurance');
    } else if (/packing|pack|list|gear/i.test(lowerName)) {
      setCategory('packing_list');
    } else if (/tour|activity|museum|pass|event/i.test(lowerName)) {
      setCategory('activities');
    }

    // Read preview
    try {
      const dataUrl = await readFileAsDataURL(selectedFile);
      setFilePreview(dataUrl);
    } catch (e) {
      console.warn('Could not read file preview', e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !filePreview) {
      setError('Please select or drag a document file.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter a document title.');
      return;
    }

    setIsProcessing(true);

    try {
      let fileDataString = filePreview || '';
      if (!fileDataString && file) {
        fileDataString = await readFileAsDataURL(file);
      }

      const newDoc: TravelDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: name.trim(),
        category,
        fileName: file?.name || 'document.txt',
        fileType: file?.type || 'application/octet-stream',
        fileSize: file?.size || fileDataString.length,
        fileData: fileDataString,
        uploadDate: Date.now(),
        referenceCode: referenceCode.trim() || undefined,
        notes: notes.trim() || undefined,
        linkedDestination: linkedDestination.trim() || tripInfo.destination,
        isPinned: category === 'passport_id' || category === 'tickets',
      };

      onSaveDocument(newDoc, autoScan);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to process document file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Upload Travel Document & Record
              </h3>
              <p className="text-xs text-stone-500">
                Save tickets, boarding passes, hotel reservations, or packing lists offline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

            {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-50/70 scale-[0.99]'
                : file
                ? 'border-emerald-300 bg-emerald-50/40'
                : 'border-stone-200 hover:border-amber-400 hover:bg-stone-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.json,.csv,.md,.doc,.docx"
            />

            {file ? (
              <div className="space-y-2">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-800 text-sm">{file.name}</h4>
                  <p className="text-xs text-stone-500">{formatFileSize(file.size)} • {file.type || 'Document'}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="text-xs text-amber-700 hover:underline font-semibold"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 bg-stone-100 text-stone-600 rounded-xl flex items-center justify-center mx-auto">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-800 text-sm">
                    Drag and drop file here, or <span className="text-amber-700 underline">browse</span>
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Supports PDFs, PNG/JPG images, Text, CSV, JSON, and Markdown
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Camera Snap Action */}
          {onOpenCamera && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-700" />
                <span className="text-xs text-amber-950 font-semibold">Have a physical document or pass?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCamera('document', name || 'Document Photo');
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Snap with Camera
              </button>
            </div>
          )}

          {/* Document Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Document Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Flight to Tokyo NH204 Ticket, Hotel Reservation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Category & Reference Code Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-stone-400" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-amber-500 transition-all cursor-pointer"
              >
                <option value="tickets">✈️ Tickets & Transit Passes</option>
                <option value="hotel">🏨 Hotel & Accommodations</option>
                <option value="passport_id">🪪 Passports, IDs & Visas</option>
                <option value="insurance">🛡️ Insurance & Medical</option>
                <option value="activities">🎟️ Activities & Attractions</option>
                <option value="packing_list">📋 Packing List Records</option>
                <option value="general">📁 General Travel Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-stone-400" /> Ref / Confirmation Code
              </label>
              <input
                type="text"
                placeholder="e.g. PNR-98234, BKG-1102"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm font-mono text-stone-800 focus:outline-hidden focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Linked Destination */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-stone-400" /> Associated Destination
            </label>
            <input
              type="text"
              placeholder="e.g. Tokyo, Japan"
              value={linkedDestination}
              onChange={(e) => setLinkedDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-amber-500 transition-all"
            />
          </div>

          {/* Notes / Special Instructions */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Notes & Reminders (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Terminal 1, gate closes 20 mins prior. Show QR code at check-in desk."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 focus:outline-hidden focus:border-amber-500 transition-all resize-none"
            />
          </div>

          {/* Auto Scan Option */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-xs text-amber-950 block">AI Smart Document Scanner</span>
                <span className="text-[11px] text-amber-800">
                  Automatically deduce trip dates, confirmation codes, and gear to pack
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoScan}
              onChange={(e) => setAutoScan(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
            />
          </div>

        </form>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing || !file}
            className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {isProcessing ? (
              <span>Saving Document...</span>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Save Document Record</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
