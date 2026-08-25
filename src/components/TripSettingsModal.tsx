import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Calendar, 
  Clock, 
  CloudSun, 
  Luggage, 
  Download, 
  Upload, 
  Save, 
  Sparkles, 
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { TripInfo } from '../types';
import { exportDataAsJSON, importDataFromJSON, EMPTY_TRIP } from '../utils/storage';

interface TripSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripInfo: TripInfo;
  setTripInfo: React.Dispatch<React.SetStateAction<TripInfo>>;
  onReloadAllData: () => void;
  onDeleteTrip?: () => void;
}

export const TripSettingsModal: React.FC<TripSettingsModalProps> = ({
  isOpen,
  onClose,
  tripInfo,
  setTripInfo,
  onReloadAllData,
  onDeleteTrip,
}) => {
  const [destination, setDestination] = useState(tripInfo.destination || '');
  const [departureDate, setDepartureDate] = useState(tripInfo.departureDate || '');
  const [returnDate, setReturnDate] = useState(tripInfo.returnDate || '');
  const [durationDays, setDurationDays] = useState(tripInfo.durationDays || 5);
  const [tripType, setTripType] = useState(tripInfo.tripType || 'Vacation');
  const [climate, setClimate] = useState(tripInfo.climate || 'Mild');
  const [carryOnKg, setCarryOnKg] = useState(tripInfo.baggageAllowance?.carryOnLimitKg || 7);
  const [checkedKg, setCheckedKg] = useState(tripInfo.baggageAllowance?.checkedLimitKg || 23);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Sync state whenever modal is opened or tripInfo changes
  useEffect(() => {
    if (isOpen) {
      setDestination(tripInfo.destination || '');
      setDepartureDate(tripInfo.departureDate || '');
      setReturnDate(tripInfo.returnDate || '');
      setDurationDays(tripInfo.durationDays || 5);
      setTripType(tripInfo.tripType || 'Vacation');
      setClimate(tripInfo.climate || 'Mild');
      setCarryOnKg(tripInfo.baggageAllowance?.carryOnLimitKg || 7);
      setCheckedKg(tripInfo.baggageAllowance?.checkedLimitKg || 23);
      setShowConfirmDelete(false);
    }
  }, [isOpen, tripInfo]);

  if (!isOpen) return null;

  const handleDeleteTrip = () => {
    if (onDeleteTrip) {
      onDeleteTrip();
    } else {
      setTripInfo(EMPTY_TRIP);
    }
    setDestination('');
    setDepartureDate('');
    setReturnDate('');
    setDurationDays(1);
    setTripType('Vacation & Leisure');
    setClimate('Mild');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTripInfo(prev => ({
      ...prev,
      destination: destination.trim() || 'My Destination',
      departureDate: departureDate || undefined,
      returnDate: returnDate || undefined,
      durationDays: Number(durationDays) || 5,
      tripType,
      climate,
      baggageAllowance: {
        carryOnLimitKg: Number(carryOnKg),
        checkedLimitKg: Number(checkedKg),
      }
    }));
    onClose();
  };

  const handleExport = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travelbot_${destination.toLowerCase().replace(/[^a-z0-9]/g, '_')}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = importDataFromJSON(content);
      if (success) {
        setImportStatus('✅ Successfully imported travel data!');
        onReloadAllData();
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('❌ Error: Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Edit Trip & Travel Details</h3>
              <p className="text-xs text-stone-500">Configure countdown, climate, and baggage allowances</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-base font-bold cursor-pointer">
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Destination</label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris, France or Tokyo, Japan"
              className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Departure Date</label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Duration (Days)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Trip Style / Purpose</label>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-900 focus:bg-white focus:outline-none"
              >
                <option value="Vacation & Sightseeing">Vacation & Sightseeing</option>
                <option value="Business & Conferences">Business & Conferences</option>
                <option value="Beach & Tropical Resort">Beach & Tropical Resort</option>
                <option value="Winter Sports & Skiing">Winter Sports & Skiing</option>
                <option value="Hiking & Backpacking">Hiking & Backpacking</option>
                <option value="Road Trip & Adventure">Road Trip & Adventure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Expected Climate / Weather</label>
              <input
                type="text"
                value={climate}
                onChange={(e) => setClimate(e.target.value)}
                placeholder="e.g. Mild Spring (18°C), Hot & Humid, Cold Winter"
                className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
            <h4 className="font-bold text-xs text-stone-800 flex items-center gap-1.5">
              <Luggage className="w-3.5 h-3.5 text-stone-500" />
              <span>Airline Baggage Allowances</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Carry-on Bag Max (kg)</label>
                <input
                  type="number"
                  value={carryOnKg}
                  onChange={(e) => setCarryOnKg(Number(e.target.value))}
                  className="w-full rounded border border-stone-300 bg-white p-1.5 text-xs text-stone-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Checked Bag Max (kg)</label>
                <input
                  type="number"
                  value={checkedKg}
                  onChange={(e) => setCheckedKg(Number(e.target.value))}
                  className="w-full rounded border border-stone-300 bg-white p-1.5 text-xs text-stone-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Backup / Export / Import Area */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <h4 className="font-bold text-xs text-stone-700">Backup & Offline Data</h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
            {importStatus && (
              <p className="text-[11px] font-medium text-center text-stone-700">{importStatus}</p>
            )}
          </div>

          {/* Submit & Delete Action Buttons */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
            <button
              type="button"
              id="trip-modal-delete-button"
              onClick={handleDeleteTrip}
              className="px-3 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Delete and reset trip details"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Trip</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="trip-modal-save-button"
                className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
