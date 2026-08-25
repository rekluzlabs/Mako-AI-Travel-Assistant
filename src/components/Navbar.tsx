import React from 'react';
import { 
  Compass, 
  Wifi, 
  WifiOff, 
  Briefcase, 
  MessageSquare, 
  Layers, 
  BookOpen, 
  Calendar,
  Sparkles,
  Plane,
  FolderArchive,
  ShieldAlert
} from 'lucide-react';
import { TripInfo } from '../types';

interface NavbarProps {
  activeTab: 'chat' | 'packing' | 'vault' | 'emergency' | 'trip' | 'addons' | 'handbook';
  setActiveTab: (tab: 'chat' | 'packing' | 'vault' | 'emergency' | 'trip' | 'addons' | 'handbook') => void;
  isOnline: boolean;
  setIsOnlineManualOverride: (val: boolean | null) => void;
  manualOfflineOverride: boolean | null;
  tripInfo: TripInfo;
  onOpenTripModal: () => void;
  totalItems: number;
  packedItems: number;
  enabledAddonsCount: number;
  totalDocumentsCount?: number;
  emergencyContactsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  setIsOnlineManualOverride,
  manualOfflineOverride,
  tripInfo,
  onOpenTripModal,
  totalItems,
  packedItems,
  enabledAddonsCount,
  totalDocumentsCount = 0,
  emergencyContactsCount = 0
}) => {
  const percentage = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  // Calculate days remaining to departure
  const daysUntilDeparture = tripInfo.departureDate ? Math.ceil(
    (new Date(tripInfo.departureDate).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  ) : null;

  return (
    <header id="main-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-stone-200 text-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-base sm:text-lg text-stone-900 tracking-tight flex items-center gap-1.5">
                  TravelBot
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full">
                  Offline Ready
                </span>
              </div>
              <p className="text-[12px] text-stone-500 hidden md:block">
                AI Travel Companion & Offline Packing System
              </p>
            </div>
          </div>

          {/* Current Destination & Countdown Badge */}
          <button 
            id="trip-status-badge-button"
            onClick={onOpenTripModal}
            className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-stone-300 transition-all text-left group"
          >
            <div className="w-7 h-7 rounded-md bg-amber-100/80 flex items-center justify-center text-amber-700">
              <Plane className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-medium text-stone-800 group-hover:text-amber-700 transition-colors">
                {tripInfo.destination}
              </div>
              <div className="text-stone-500 text-[11px]">
                {daysUntilDeparture !== null ? (
                  daysUntilDeparture > 0 ? (
                    <span className="text-emerald-700 font-medium">In {daysUntilDeparture} days • {tripInfo.durationDays}d trip</span>
                  ) : daysUntilDeparture === 0 ? (
                    <span className="text-amber-700 font-medium font-semibold">Departing Today!</span>
                  ) : (
                    <span>{tripInfo.durationDays}d trip</span>
                  )
                ) : (
                  <span>{tripInfo.durationDays} days</span>
                )}
              </div>
            </div>
          </button>

          {/* Quick Packing Stats Pill */}
          <button
            id="quick-stats-pill"
            onClick={() => setActiveTab('packing')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 transition-colors text-xs font-medium text-stone-700"
            title="Click to view Packing List"
          >
            <Briefcase className="w-3.5 h-3.5 text-stone-500" />
            <span>{packedItems}/{totalItems}</span>
            <div className="w-12 h-2 bg-stone-200 rounded-full overflow-hidden hidden sm:block">
              <div 
                className={`h-full transition-all duration-500 ${percentage === 100 ? 'bg-emerald-500' : 'bg-amber-600'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[11px] text-stone-500 hidden sm:inline">{percentage}%</span>
          </button>

          {/* Online/Offline Status & Toggle */}
          <div className="flex items-center gap-2">
            <button
              id="network-mode-toggle"
              onClick={() => {
                // Cycle: normal -> force offline -> force online -> normal
                if (manualOfflineOverride === null) {
                  setIsOnlineManualOverride(false);
                } else if (manualOfflineOverride === false) {
                  setIsOnlineManualOverride(true);
                } else {
                  setIsOnlineManualOverride(null);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-amber-100/70 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
              title={`Network mode: ${isOnline ? 'Online (Gemini Cloud Active)' : 'Offline (Local Heuristic Engine Active)'}. Click to toggle test offline mode.`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-600'}`} />
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="font-semibold">Offline Mode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-stone-200/80 pt-1 pb-1.5 overflow-x-auto no-scrollbar">
          <button
            id="nav-tab-chat"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Travel Assistant</span>
          </button>

          <button
            id="nav-tab-packing"
            onClick={() => setActiveTab('packing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'packing'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Packing List</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'packing' ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-700'
            }`}>
              {totalItems - packedItems} left
            </span>
          </button>

          <button
            id="nav-tab-vault"
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'vault'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Documents & Vault</span>
            {totalDocumentsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'vault' ? 'bg-stone-700 text-stone-200' : 'bg-amber-100 text-amber-800'
              }`}>
                {totalDocumentsCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-emergency"
            onClick={() => setActiveTab('emergency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'emergency'
                ? 'bg-rose-900 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50 hover:text-rose-900 font-semibold'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Emergency & ICE</span>
            {emergencyContactsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'emergency' ? 'bg-rose-800 text-rose-100' : 'bg-rose-100 text-rose-800'
              }`}>
                {emergencyContactsCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-trip"
            onClick={() => setActiveTab('trip')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'trip'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Trip & Countdown</span>
          </button>

          <button
            id="nav-tab-addons"
            onClick={() => setActiveTab('addons')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'addons'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Add-ons & Features</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'addons' ? 'bg-stone-700 text-stone-200' : 'bg-amber-100 text-amber-800'
            }`}>
              {enabledAddonsCount}
            </span>
          </button>

          <button
            id="nav-tab-handbook"
            onClick={() => setActiveTab('handbook')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'handbook'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Offline Survival Handbook</span>
          </button>
        </div>
      </div>
    </header>
  );
};
