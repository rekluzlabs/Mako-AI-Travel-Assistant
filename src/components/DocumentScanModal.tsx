import React from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Plus, 
  FileText, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Hash, 
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { TravelDocument, PackingItem } from '../types';

interface DocumentScanModalProps {
  document: TravelDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyDetectedItems: (items: any[]) => void;
  onUpdateTripDetails?: (destination: string, dates?: string) => void;
  isOnline: boolean;
}

export const DocumentScanModal: React.FC<DocumentScanModalProps> = ({
  document,
  isOpen,
  onClose,
  onApplyDetectedItems,
  onUpdateTripDetails,
  isOnline
}) => {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedItems, setSelectedItems] = React.useState<Record<string, boolean>>({});
  const [applied, setApplied] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && document) {
      handleScan();
    } else {
      setResult(null);
      setError(null);
      setApplied(false);
    }
  }, [isOpen, document]);

  const handleScan = async () => {
    if (!document) return;
    setLoading(true);
    setError(null);
    setApplied(false);

    try {
      if (isOnline) {
        const res = await fetch('/api/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileContent: document.fileData,
            fileName: document.fileName,
            mimeType: document.fileType,
            category: document.category,
          })
        });

        if (!res.ok) {
          throw new Error('AI Document Scanner returned an error');
        }

        const data = await res.json();
        setResult(data);
        
        // Select all suggested items by default
        const initialSelected: Record<string, boolean> = {};
        if (data.suggestedPackingItems && Array.isArray(data.suggestedPackingItems)) {
          data.suggestedPackingItems.forEach((item: any, idx: number) => {
            initialSelected[`item-${idx}`] = true;
          });
        }
        setSelectedItems(initialSelected);
      } else {
        // Offline Heuristic Document Analyzer fallback!
        await new Promise(r => setTimeout(r, 600));
        
        const fallbackItems: any[] = [];
        const isFlight = /flight|boarding|airline|ticket/i.test(document.name + ' ' + document.fileName);
        const isHotel = /hotel|booking|stay|resort|airbnb/i.test(document.name + ' ' + document.fileName);

        if (isFlight) {
          fallbackItems.push(
            { name: 'Passport & Identification', category: 'documents', quantity: 1, priority: 'essential', luggageType: 'personal', notes: 'Required at security check' },
            { name: 'Noise-Canceling Headphones', category: 'electronics', quantity: 1, priority: 'recommended', luggageType: 'personal', notes: 'For long-haul cabin comfort' },
            { name: 'TSA 3-1-1 Liquids Bag (<100ml)', category: 'toiletries', quantity: 1, priority: 'essential', luggageType: 'carry-on', notes: 'Complies with carry-on liquid limits' },
            { name: 'Portable Power Bank (in carry-on)', category: 'electronics', quantity: 1, priority: 'essential', luggageType: 'carry-on', notes: 'Do not put in checked baggage' }
          );
        } else if (isHotel) {
          fallbackItems.push(
            { name: 'Universal Plug Adapter', category: 'electronics', quantity: 1, priority: 'essential', luggageType: 'carry-on', notes: 'For hotel room outlets' },
            { name: 'Sleep Mask & Earplugs', category: 'misc', quantity: 1, priority: 'recommended', luggageType: 'carry-on', notes: 'For restful hotel sleep' },
            { name: 'Comfortable Room Loungewear', category: 'clothing', quantity: 2, priority: 'recommended', luggageType: 'checked', notes: 'For evening relaxation' }
          );
        } else {
          fallbackItems.push(
            { name: 'Document Digital Backup on Phone', category: 'documents', quantity: 1, priority: 'essential', luggageType: 'personal' },
            { name: 'Printed Physical Copy', category: 'documents', quantity: 1, priority: 'recommended', luggageType: 'personal' }
          );
        }

        const offlineResult = {
          detectedTitle: document.name,
          destination: document.linkedDestination || 'Trip Destination',
          dates: 'Refer to document text',
          bookingReference: document.referenceCode || 'Extracted from file metadata',
          summary: `Offline heuristic analysis identified this document as a travel ${document.category.replace('_', ' ')} record.`,
          keyDetails: [
            `File Type: ${document.fileType || 'Standard'}`,
            `Category: ${document.category.replace('_', ' ')}`,
            'Offline mode active: Essentials deduced automatically'
          ],
          suggestedPackingItems: fallbackItems
        };

        setResult(offlineResult);
        const initialSelected: Record<string, boolean> = {};
        fallbackItems.forEach((_, idx) => { initialSelected[`item-${idx}`] = true; });
        setSelectedItems(initialSelected);
      }
    } catch (err: any) {
      console.error('Scan error', err);
      setError(err.message || 'Failed to scan document');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result || !result.suggestedPackingItems) return;
    
    const itemsToAdd = result.suggestedPackingItems.filter((_: any, idx: number) => selectedItems[`item-${idx}`]);
    if (itemsToAdd.length > 0) {
      onApplyDetectedItems(itemsToAdd);
    }

    if (result.destination && onUpdateTripDetails && result.destination !== 'Not specified') {
      onUpdateTripDetails(result.destination, result.dates);
    }

    setApplied(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Smart Document & Ticket Scanner
              </h3>
              <p className="text-xs text-stone-500">
                Extracting travel dates, confirmation codes, and required packing gear
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
          
          {/* Target Document Info Banner */}
          <div className="flex items-center gap-3 p-3 bg-stone-100/70 border border-stone-200 rounded-xl text-xs">
            <FileText className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="font-bold text-stone-800 block truncate">{document.name}</span>
              <span className="text-stone-500 font-mono text-[11px]">{document.fileName}</span>
            </div>
            {!isOnline && (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-semibold shrink-0">
                Offline Mode
              </span>
            )}
          </div>

          {loading && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h4 className="font-bold text-stone-800 text-sm">Analyzing Travel Document...</h4>
                <p className="text-xs text-stone-500 mt-1">Reading itinerary rules, booking codes, and packing requirements</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertCircle className="w-4 h-4" /> Scanning failed
              </div>
              <p>{error}</p>
              <button
                onClick={handleScan}
                className="px-3 py-1.5 bg-rose-800 text-white rounded-lg font-medium hover:bg-rose-900 transition-colors"
              >
                Retry Analysis
              </button>
            </div>
          )}

          {!loading && result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Extracted Details Box */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-700" /> Extracted Travel Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {result.destination && result.destination !== 'Not specified' && (
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/60 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">Destination</span>
                        <span className="font-semibold text-stone-800">{result.destination}</span>
                      </div>
                    </div>
                  )}

                  {result.bookingReference && (
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/60 flex items-start gap-2">
                      <Hash className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">Booking Reference / PNR</span>
                        <span className="font-mono font-bold text-stone-800">{result.bookingReference}</span>
                      </div>
                    </div>
                  )}

                  {result.dates && (
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200/60 flex items-start gap-2 sm:col-span-2">
                      <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">Dates & Schedule</span>
                        <span className="font-medium text-stone-800">{result.dates}</span>
                      </div>
                    </div>
                  )}
                </div>

                {result.summary && (
                  <p className="text-xs text-stone-700 bg-white/70 p-2.5 rounded-lg border border-amber-200/50">
                    {result.summary}
                  </p>
                )}

                {result.keyDetails && result.keyDetails.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-amber-900 block">Key Logistics & Baggage Notes:</span>
                    <ul className="text-xs text-amber-950 space-y-1 list-disc list-inside">
                      {result.keyDetails.map((detail: string, i: number) => (
                        <li key={i} className="text-stone-700">{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommended Items to Pack */}
              {result.suggestedPackingItems && result.suggestedPackingItems.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-amber-600" />
                      Detected Recommended Packing Items ({result.suggestedPackingItems.length})
                    </h4>
                    <button
                      onClick={() => {
                        const allSelected = Object.keys(selectedItems).length === result.suggestedPackingItems.length && Object.values(selectedItems).every(Boolean);
                        const next: Record<string, boolean> = {};
                        result.suggestedPackingItems.forEach((_: any, idx: number) => {
                          next[`item-${idx}`] = !allSelected;
                        });
                        setSelectedItems(next);
                      }}
                      className="text-xs text-amber-700 hover:underline font-medium"
                    >
                      Toggle All
                    </button>
                  </div>

                  <div className="space-y-2 border border-stone-200 rounded-xl p-3 bg-stone-50/50 max-h-[220px] overflow-y-auto">
                    {result.suggestedPackingItems.map((item: any, idx: number) => {
                      const key = `item-${idx}`;
                      const isSelected = selectedItems[key];

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedItems({ ...selectedItems, [key]: !isSelected })}
                          className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected 
                              ? 'bg-amber-50/80 border-amber-300 text-amber-950' 
                              : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold border transition-colors ${
                              isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium text-xs block truncate">{item.name}</span>
                              <span className="text-[11px] text-stone-500 capitalize">
                                {item.category} • {item.luggageType || 'carry-on'} • {item.priority || 'recommended'}
                              </span>
                            </div>
                          </div>

                          {item.notes && (
                            <span className="text-[10px] text-stone-500 max-w-[140px] truncate hidden sm:inline">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {applied ? (
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Added to Packing List!
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={loading || !result}
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Selected Items to Packing List</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
