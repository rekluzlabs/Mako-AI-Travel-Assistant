import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Check, 
  Trash2, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  Briefcase, 
  CloudSun, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  BookOpen, 
  Sliders,
  Settings,
  HelpCircle
} from 'lucide-react';
import { AddonModule } from '../types';

interface AddonManagerProps {
  addons: AddonModule[];
  setAddons: React.Dispatch<React.SetStateAction<AddonModule[]>>;
  isOnline: boolean;
}

const ICON_MAP: Record<string, any> = {
  Briefcase,
  CloudSun,
  MapPin,
  ClockAlert: Clock,
  ShieldCheck,
  BookOpen,
  Sparkles,
};

export const AddonManager: React.FC<AddonManagerProps> = ({
  addons,
  setAddons,
  isOnline,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [customOffline, setCustomOffline] = useState(true);

  const toggleAddon = (id: string) => {
    setAddons(prev => prev.map(addon => {
      if (addon.id === id) {
        return { ...addon, enabled: !addon.enabled };
      }
      return addon;
    }));
  };

  const deleteCustomAddon = (id: string) => {
    setAddons(prev => prev.filter(addon => addon.id !== id));
  };

  const handleCreateAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customDescription.trim()) return;

    const newAddon: AddonModule = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      description: customDescription.trim(),
      icon: 'Sparkles',
      enabled: true,
      isCore: false,
      offlineSupported: customOffline,
      badge: customOffline ? 'Custom (Offline Ready)' : 'Custom (Online AI)',
      promptContribution: customPrompt.trim() || customDescription.trim(),
    };

    setAddons(prev => [...prev, newAddon]);
    setCustomName('');
    setCustomDescription('');
    setCustomPrompt('');
    setShowCreateModal(false);
  };

  const activeCount = addons.filter(a => a.enabled).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-stone-900">Extensible Add-ons & Feature System</h2>
            </div>
            <p className="text-xs text-stone-500 mt-1 max-w-xl">
              Enable or disable specialized AI skills, travel modules, and offline tools. You can also build your own custom assistant feature plugins below.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-stone-100 text-stone-800">
              {activeCount} of {addons.length} Active
            </span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Add-on</span>
            </button>
          </div>
        </div>
      </div>

      {/* Addon Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addons.map(addon => {
          const IconComponent = ICON_MAP[addon.icon] || Sparkles;

          return (
            <div
              key={addon.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                addon.enabled
                  ? 'border-amber-300 ring-1 ring-amber-200/50'
                  : 'border-stone-200 opacity-80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      addon.enabled
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-100 text-stone-500'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">{addon.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {addon.offlineSupported ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            <WifiOff className="w-2.5 h-2.5" />
                            Offline Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                            <Wifi className="w-2.5 h-2.5" />
                            Online AI
                          </span>
                        )}
                        {addon.isCore && (
                          <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.2 rounded">
                            Core
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={addon.enabled}
                      onChange={() => toggleAddon(addon.id)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-600 leading-relaxed mb-3">
                  {addon.description}
                </p>

                {/* Prompt Instruction Preview */}
                <div className="bg-stone-50 rounded-lg p-2.5 border border-stone-200/80 text-[11px] text-stone-600 font-mono">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                    AI Instruction:
                  </span>
                  "{addon.promptContribution}"
                </div>
              </div>

              {/* Footer controls for custom addons */}
              {!addon.isCore && (
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">User-defined feature</span>
                  <button
                    onClick={() => deleteCustomAddon(addon.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Add-on</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Custom Addon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-stone-900 text-base">Create Custom AI Feature Add-on</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAddon} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Add-on Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Scuba Diving & Snorkeling Gear Assistant"
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description (What it does)</label>
                <input
                  type="text"
                  required
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="e.g. Tracks scuba certification cards, wetsuit thickness, and underwater camera filters"
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">AI Prompt Instructions</label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Always check if the traveler has their dive log, certification cards, defog spray, and advise on 24-hour no-fly surface intervals after diving."
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="offline-check"
                  checked={customOffline}
                  onChange={(e) => setCustomOffline(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="offline-check" className="text-xs text-stone-700 font-medium">
                  Support local offline fallback processing
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs"
                >
                  Install Add-on
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
