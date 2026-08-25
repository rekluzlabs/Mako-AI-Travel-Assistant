import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CloudSun, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Plane, 
  Luggage, 
  FileEdit, 
  Save, 
  Flame,
  ShieldCheck,
  Compass,
  Trash2,
  RotateCcw,
  X
} from 'lucide-react';
import { TripInfo, PackingItem } from '../types';
import { EMPTY_TRIP } from '../utils/storage';

interface TripPlannerViewProps {
  tripInfo: TripInfo;
  setTripInfo: React.Dispatch<React.SetStateAction<TripInfo>>;
  packingList: PackingItem[];
  onOpenTripModal: () => void;
  onNavigateToPacking: () => void;
  onResetTrip?: () => void;
  isOnline: boolean;
}

export const TripPlannerView: React.FC<TripPlannerViewProps> = ({
  tripInfo,
  setTripInfo,
  packingList,
  onOpenTripModal,
  onNavigateToPacking,
  onResetTrip,
  isOnline,
}) => {
  const [tripNotes, setTripNotes] = useState(tripInfo.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deletedToast, setDeletedToast] = useState(false);

  useEffect(() => {
    setTripNotes(tripInfo.notes || '');
  }, [tripInfo.notes]);

  const confirmDeleteTripDetails = () => {
    if (onResetTrip) {
      onResetTrip();
    } else {
      setTripInfo(EMPTY_TRIP);
    }
    setTripNotes('');
    setShowConfirmDelete(false);
    setDeletedToast(true);
    setTimeout(() => setDeletedToast(false), 3000);
  };

  // Countdown calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let daysRemaining: number | null = null;
  let formattedDeparture = 'Not scheduled';

  if (tripInfo.departureDate) {
    const depDate = new Date(tripInfo.departureDate);
    daysRemaining = Math.ceil((depDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    formattedDeparture = depDate.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Missing high priority items
  const missingEssentials = packingList.filter(i => !i.packed && i.priority === 'essential');
  const packedCount = packingList.filter(i => i.packed).length;
  const percentage = packingList.length > 0 ? Math.round((packedCount / packingList.length) * 100) : 0;

  const handleSaveNotes = () => {
    setTripInfo(prev => ({ ...prev, notes: tripNotes }));
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Hero Trip Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                <Compass className="w-3.5 h-3.5" />
                <span>Active Travel Plan</span>
              </div>
              <button
                type="button"
                id="delete-trip-details-button"
                onClick={() => setShowConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-600/30 text-rose-300 border border-rose-400/30 text-xs font-medium transition-all cursor-pointer"
                title="Delete and clear current trip details"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Trip</span>
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {tripInfo.destination}
            </h2>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-stone-300 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                {formattedDeparture}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                {tripInfo.durationDays} Days Duration
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-amber-400" />
                {tripInfo.climate}
              </span>
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4 sm:p-5 text-center shrink-0 min-w-[160px]">
            {daysRemaining !== null ? (
              daysRemaining > 0 ? (
                <>
                  <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold block">
                    Departure Countdown
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white my-1 font-mono">
                    {daysRemaining}
                  </div>
                  <span className="text-xs text-stone-300">Days Until Departure</span>
                </>
              ) : daysRemaining === 0 ? (
                <>
                  <Flame className="w-6 h-6 text-amber-400 mx-auto mb-1 animate-bounce" />
                  <span className="text-base font-bold text-amber-300 block">Departing Today!</span>
                  <span className="text-xs text-stone-200">Safe travels!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                  <span className="text-base font-bold text-emerald-300 block">Trip in Progress</span>
                  <span className="text-xs text-stone-200">{Math.abs(daysRemaining)} days since departure</span>
                </>
              )
            ) : (
              <span className="text-xs text-stone-300">Set departure date to activate countdown</span>
            )}
            
            <button
              onClick={onOpenTripModal}
              className="mt-3 w-full py-1.5 px-3 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              Modify Dates & Trip
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Trip Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Urgent Missing Essentials Box */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Critical Unpacked Essentials</h3>
                  <p className="text-xs text-stone-500">Items flagged as essential that you have not packed yet</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full">
                {missingEssentials.length} missing
              </span>
            </div>

            {missingEssentials.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center my-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-emerald-900">All essential items are packed!</p>
                <p className="text-[11px] text-emerald-700">Documents, electronics, and health meds are ready.</p>
              </div>
            ) : (
              <div className="space-y-2 my-3 max-h-48 overflow-y-auto pr-1">
                {missingEssentials.map(item => (
                  <div 
                    key={item.id}
                    className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="font-semibold text-stone-800">{item.name}</span>
                      {item.quantity > 1 && <span className="text-[10px] bg-stone-200 px-1 rounded">{item.quantity}x</span>}
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono capitalize">{item.luggageType}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onNavigateToPacking}
            className="w-full mt-3 py-2 px-4 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors text-center"
          >
            Open Full Packing List ({percentage}% Ready)
          </button>
        </div>

        {/* Baggage & Airline Allowances */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <Luggage className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Baggage Limits & Travel Rules</h3>
                <p className="text-xs text-stone-500">Standard allowance targets for this trip</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="text-[11px] font-medium text-stone-500 block">Carry-On Allowance</span>
                <span className="text-base font-bold text-stone-900 font-mono">
                  {tripInfo.baggageAllowance?.carryOnLimitKg || 7} kg / 15 lbs
                </span>
                <span className="text-[10px] text-stone-500 block mt-1">Must fit in overhead bin</span>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="text-[11px] font-medium text-stone-500 block">Checked Bag Allowance</span>
                <span className="text-base font-bold text-stone-900 font-mono">
                  {tripInfo.baggageAllowance?.checkedLimitKg || 23} kg / 50 lbs
                </span>
                <span className="text-[10px] text-stone-500 block mt-1">Standard airline limit</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                Aviation Security Rules:
              </p>
              <p className="text-[11px] text-amber-800">
                • <strong>Power Banks:</strong> MUST go in carry-on bag, forbidden in checked luggage.<br/>
                • <strong>Liquids:</strong> Max 100ml (3.4oz) containers in a 1-quart bag for carry-on.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenTripModal}
            className="w-full mt-3 py-2 px-4 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors text-center"
          >
            Adjust Weight Limits
          </button>
        </div>
      </div>

      {/* Offline Scratchpad & Custom Trip Notes */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileEdit className="w-4 h-4 text-stone-500" />
            <h3 className="font-bold text-stone-900 text-sm">Trip Notes & Itinerary Scratchpad</h3>
          </div>
          <span className="text-[11px] text-stone-500">Saves locally on device</span>
        </div>

        <textarea
          rows={4}
          value={tripNotes}
          onChange={(e) => setTripNotes(e.target.value)}
          placeholder="Jot down hotel addresses, booking confirmation numbers, local metro pass info, restaurant recommendations..."
          className="w-full rounded-lg border border-stone-300 bg-stone-50 p-3 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-none"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            {isSavedNotes ? '✅ Saved to local storage' : 'Unsaved changes auto-persist on save button'}
          </span>
          <button
            onClick={handleSaveNotes}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Notes</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Deleting Trip */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900">Delete & Clear Trip Details?</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  This will reset destination, departure dates, duration, climate, and travel scratchpad notes.
                </p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
              <p><strong>Current Trip:</strong> {tripInfo.destination || 'Untitled'}</p>
              {tripInfo.departureDate && <p><strong>Dates:</strong> {tripInfo.departureDate} ({tripInfo.durationDays} days)</p>}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-trip-btn"
                onClick={confirmDeleteTripDetails}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Trip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {deletedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-stone-700 text-xs font-medium flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Trip details deleted and reset to fresh blank state.</span>
        </div>
      )}

    </div>
  );
};
