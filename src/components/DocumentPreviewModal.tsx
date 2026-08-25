import React from 'react';
import { 
  X, 
  Download, 
  FileText, 
  Calendar, 
  Hash, 
  Sparkles, 
  File, 
  ExternalLink,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Copy,
  Plus
} from 'lucide-react';
import { TravelDocument, PackingItem } from '../types';
import { formatFileSize, downloadFile } from '../utils/fileVault';

interface DocumentPreviewModalProps {
  document: TravelDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onScanDocument: (doc: TravelDocument) => void;
  onAddDetectedItems?: (items: any[]) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onScanDocument,
  onAddDetectedItems,
}) => {
  const [copiedRef, setCopiedRef] = React.useState(false);

  if (!isOpen || !document) return null;

  const isPDF = document.fileType?.includes('pdf') || document.fileName.toLowerCase().endsWith('.pdf');
  const isImage = Boolean(document.photoUrl) || document.fileType?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(document.fileName);
  const isText = document.fileType?.startsWith('text/') || /\.(txt|json|csv|md)$/i.test(document.fileName);

  const handleCopyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleDownload = () => {
    downloadFile(document.fileData, document.fileName);
  };

  // Decode text content if it's text data uri
  let textContent = '';
  if (isText && document.fileData) {
    try {
      if (document.fileData.startsWith('data:text')) {
        const commaIdx = document.fileData.indexOf(',');
        textContent = decodeURIComponent(document.fileData.substring(commaIdx + 1));
      } else {
        textContent = document.fileData;
      }
    } catch (e) {
      textContent = 'Unable to decode text preview.';
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              {isPDF ? <FileText className="w-5 h-5" /> : isImage ? <File className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                {document.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5 flex-wrap">
                <span className="font-mono text-[11px] truncate max-w-[200px]">{document.fileName}</span>
                <span>•</span>
                <span>{formatFileSize(document.fileSize)}</span>
                <span>•</span>
                <span className="capitalize">{document.category.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download File"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Body / Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Metadata Badges Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
            {document.referenceCode ? (
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-stone-200">
                <span className="text-stone-500 font-medium flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-amber-600" /> Ref:
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-stone-800">{document.referenceCode}</span>
                  <button
                    onClick={() => handleCopyRef(document.referenceCode!)}
                    className="text-stone-400 hover:text-stone-700 p-0.5"
                    title="Copy reference code"
                  >
                    {copiedRef ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-500 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> No reference code
              </div>
            )}

            <div className="p-2 bg-white rounded-lg border border-stone-200 flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" /> Uploaded:
              </span>
              <span className="font-medium text-stone-800">
                {new Date(document.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="p-2 bg-white rounded-lg border border-stone-200 flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" /> Linked Trip:
              </span>
              <span className="font-medium text-stone-800 truncate">
                {document.linkedDestination || 'General Travel'}
              </span>
            </div>
          </div>

          {/* Notes area if any */}
          {document.notes && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
              <span className="font-bold block uppercase text-[10px] text-amber-700">Document Notes & Booking Details:</span>
              <p className="whitespace-pre-wrap">{document.notes}</p>
            </div>
          )}

          {/* Render Actual File Preview */}
          <div className="border border-stone-200 rounded-xl bg-stone-900/5 p-2 sm:p-4 min-h-[260px] flex items-center justify-center">
            {isImage ? (
              <div className="text-center space-y-2 max-h-[450px] overflow-hidden flex flex-col items-center">
                <img 
                  src={document.photoUrl || document.fileData} 
                  alt={document.name} 
                  referrerPolicy="no-referrer"
                  className="max-h-[400px] max-w-full rounded-lg object-contain shadow-xs border border-stone-200"
                />
                <span className="text-[11px] text-stone-500">Image / Photo Preview • {formatFileSize(document.fileSize)}</span>
              </div>
            ) : isPDF ? (
              <div className="w-full space-y-3">
                <iframe
                  src={document.fileData}
                  title={document.name}
                  className="w-full h-[380px] rounded-lg border border-stone-300 bg-white"
                />
                <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                  <span>PDF Document Viewer</span>
                  <button
                    onClick={handleDownload}
                    className="text-amber-700 hover:underline flex items-center gap-1 font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open in full window
                  </button>
                </div>
              </div>
            ) : isText ? (
              <div className="w-full">
                <div className="bg-stone-900 text-stone-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[350px] whitespace-pre-wrap leading-relaxed">
                  {textContent}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <File className="w-12 h-12 text-stone-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-stone-800 text-sm">{document.fileName}</h4>
                  <p className="text-xs text-stone-500">Binary file format ({document.fileType || 'Unknown'}).</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download File to Device
                </button>
              </div>
            )}
          </div>

          {/* AI Extraction & Detected Items Card */}
          {document.parsedInfo && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <h4 className="font-bold text-emerald-950 text-xs">Extracted Travel Details & Detected Gear</h4>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                  Scanned
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900">
                {document.parsedInfo.destination && (
                  <div><strong>Destination:</strong> {document.parsedInfo.destination}</div>
                )}
                {document.parsedInfo.dates && (
                  <div><strong>Schedule:</strong> {document.parsedInfo.dates}</div>
                )}
              </div>

              {document.parsedInfo.detectedItems && document.parsedInfo.detectedItems.length > 0 && (
                <div className="pt-2 border-t border-emerald-200/70">
                  <span className="text-[11px] font-bold text-emerald-800 block mb-1.5">
                    Recommended Packing Items for this Document:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {document.parsedInfo.detectedItems.map((item, idx) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-emerald-900 text-[11px] font-medium"
                      >
                        • {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between shrink-0">
          <button
            onClick={() => onScanDocument(document)}
            className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Smart Scan Document</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
