import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ListPlus, 
  Replace, 
  BookmarkCheck
} from 'lucide-react';
import { PackingItem, TripInfo } from '../types';
import { parsePackingListFileContent, readFileAsText, formatFileSize } from '../utils/fileVault';

interface ImportListFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportItems: (items: PackingItem[], mode: 'replace' | 'merge' | 'new_record', listTitle?: string) => void;
}

export const ImportListFileModal: React.FC<ImportListFileModalProps> = ({
  isOpen,
  onClose,
  onImportItems
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<PackingItem[]>([]);
  const [detectedTitle, setDetectedTitle] = useState<string>('');
  const [importMode, setImportMode] = useState<'replace' | 'merge' | 'new_record'>('replace');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);

    try {
      const textContent = await readFileAsText(selectedFile);
      
      // Check if JSON format
      if (selectedFile.name.endsWith('.json')) {
        try {
          const parsedJSON = JSON.parse(textContent);
          if (parsedJSON.items && Array.isArray(parsedJSON.items)) {
            setParsedItems(parsedJSON.items);
            setDetectedTitle(parsedJSON.title || selectedFile.name.replace(/\.json$/i, ''));
            return;
          } else if (Array.isArray(parsedJSON)) {
            setParsedItems(parsedJSON);
            setDetectedTitle(selectedFile.name.replace(/\.json$/i, ''));
            return;
          }
        } catch (e) {
          // fallback to line parser
        }
      }

      // Parse CSV or Text checklist
      const { items, tripTitle } = parsePackingListFileContent(textContent);
      if (items.length === 0) {
        throw new Error('No valid packing items found in this file.');
      }
      setParsedItems(items);
      setDetectedTitle(tripTitle || selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    } catch (err: any) {
      setError(err.message || 'Failed to read packing list file');
      setParsedItems([]);
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
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleExecuteImport = () => {
    if (parsedItems.length === 0) return;
    onImportItems(parsedItems, importMode, detectedTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Import Packing List File
              </h3>
              <p className="text-xs text-stone-500">
                Upload .CSV, .JSON, or .TXT files from another app or backup
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-50/70'
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
                  handleFileProcess(e.target.files[0]);
                }
              }}
              className="hidden"
              accept=".json,.csv,.txt,.md"
            />

            {file ? (
              <div className="space-y-1.5">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-stone-800 text-xs sm:text-sm">{file.name}</h4>
                <p className="text-xs text-emerald-800 font-semibold">
                  ✓ Successfully detected {parsedItems.length} packing items
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <FileText className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="font-bold text-stone-800 text-xs sm:text-sm">
                  Drag & drop your list file here, or <span className="text-amber-700 underline">browse</span>
                </p>
                <p className="text-[11px] text-stone-400">
                  Accepts .CSV, .JSON, .TXT, or bulleted checklists
                </p>
              </div>
            )}
          </div>

          {/* Parsed Items Preview */}
          {parsedItems.length > 0 && (
            <div className="space-y-3 animate-in fade-in duration-200">
              
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  List Record Title
                </label>
                <input
                  type="text"
                  value={detectedTitle}
                  onChange={(e) => setDetectedTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm font-semibold text-stone-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Import Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  How would you like to apply these items?
                </label>
                <div className="space-y-2">
                  <label 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'replace' ? 'bg-amber-50/80 border-amber-400' : 'bg-white border-stone-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block flex items-center gap-1.5">
                        <Replace className="w-3.5 h-3.5 text-amber-700" />
                        Replace active packing list ({parsedItems.length} items)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Overwrites current workspace with this new imported list
                      </span>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'merge' ? 'bg-amber-50/80 border-amber-400' : 'bg-white border-stone-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block flex items-center gap-1.5">
                        <ListPlus className="w-3.5 h-3.5 text-amber-700" />
                        Merge into active list (+{parsedItems.length} items)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Appends the items to your existing trip list without deleting current items
                      </span>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'new_record' ? 'bg-amber-50/80 border-amber-400' : 'bg-white border-stone-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'new_record'}
                      onChange={() => setImportMode('new_record')}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 block flex items-center gap-1.5">
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-700" />
                        Save as new separate list in Vault
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Stores this list in your archives for later trips without changing active list
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview of first 5 items */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <span className="text-[11px] font-bold text-stone-600 block">
                  Preview ({parsedItems.length} items detected):
                </span>
                <div className="text-xs text-stone-700 space-y-1 max-h-[120px] overflow-y-auto">
                  {parsedItems.slice(0, 8).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-0.5 border-b border-stone-200/50 last:border-0">
                      <span className="truncate">• {item.name}</span>
                      <span className="text-[10px] text-stone-500 capitalize">{item.category}</span>
                    </div>
                  ))}
                  {parsedItems.length > 8 && (
                    <div className="text-[11px] text-stone-400 italic">
                      + {parsedItems.length - 8} more items...
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

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
            onClick={handleExecuteImport}
            disabled={parsedItems.length === 0}
            className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm & Import List</span>
          </button>
        </div>

      </div>
    </div>
  );
};
