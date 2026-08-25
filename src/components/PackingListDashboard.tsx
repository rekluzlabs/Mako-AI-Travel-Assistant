import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Check, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Sparkles, 
  Download, 
  Upload, 
  Copy, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Briefcase, 
  Luggage, 
  Backpack, 
  Shirt, 
  Bath, 
  Laptop, 
  FileText, 
  HeartPulse, 
  CloudSun, 
  Package, 
  ChevronDown, 
  ChevronRight, 
  RotateCcw,
  Scale,
  FolderArchive,
  UploadCloud,
  ListOrdered
} from 'lucide-react';
import { PackingItem, PackingCategory, LuggageType, ItemPriority, TripInfo, SavedPackingList } from '../types';
import { exportPackingListToCSV, downloadFile } from '../utils/fileVault';

interface PackingListDashboardProps {
  items: PackingItem[];
  setItems: React.Dispatch<React.SetStateAction<PackingItem[]>>;
  tripInfo: TripInfo;
  isOnline: boolean;
  onOpenAuditModal: () => void;
  onOpenTemplateModal: () => void;
  onOpenTripModal: () => void;
  savedLists?: SavedPackingList[];
  onSwitchPackingList?: (list: SavedPackingList) => void;
  onSaveCurrentAsNewRecord?: () => void;
  onImportListFileClick?: () => void;
  onOpenVaultTab?: () => void;
}

const CATEGORY_META: Record<PackingCategory, { label: string; icon: any; color: string; bg: string }> = {
  clothing: { label: 'Clothing & Footwear', icon: Shirt, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  toiletries: { label: 'Toiletries & Grooming', icon: Bath, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  electronics: { label: 'Electronics & Gadgets', icon: Laptop, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  documents: { label: 'Documents & Money', icon: FileText, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  health_meds: { label: 'Health & Medications', icon: HeartPulse, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  weather_gear: { label: 'Weather & Climate Gear', icon: CloudSun, color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  misc: { label: 'Miscellaneous & Other', icon: Package, color: 'text-stone-700', bg: 'bg-stone-50 border-stone-200' },
};

export const PackingListDashboard: React.FC<PackingListDashboardProps> = ({
  items,
  setItems,
  tripInfo,
  isOnline,
  onOpenAuditModal,
  onOpenTemplateModal,
  onOpenTripModal,
  savedLists = [],
  onSwitchPackingList,
  onSaveCurrentAsNewRecord,
  onImportListFileClick,
  onOpenVaultTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unpacked' | 'packed' | 'essential' | 'carry-on' | 'checked' | 'personal'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [showSavedListDropdown, setShowSavedListDropdown] = useState(false);
  
  // Quick Add Item state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<PackingCategory>('clothing');
  const [newQuantity, setNewQuantity] = useState(1);
  const [newLuggage, setNewLuggage] = useState<LuggageType>('carry-on');
  const [newPriority, setNewPriority] = useState<ItemPriority>('essential');
  const [newNotes, setNewNotes] = useState('');
  const [showAdvancedAdd, setShowAdvancedAdd] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Stats calculations
  const totalCount = items.length;
  const packedCount = items.filter(i => i.packed).length;
  const unpackedCount = totalCount - packedCount;
  const percentage = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  // Luggage breakdown
  const carryOnCount = items.filter(i => i.luggageType === 'carry-on').length;
  const checkedCount = items.filter(i => i.luggageType === 'checked').length;
  const personalCount = items.filter(i => i.luggageType === 'personal').length;

  // Weight estimation (approximate grams)
  const totalWeightKg = (items.reduce((sum, i) => sum + (i.weightGrams || 150) * i.quantity, 0) / 1000).toFixed(1);

  // Toggle item packed status
  const togglePacked = (id: string) => {
    setItems(prev => {
      const next = prev.map(item => {
        if (item.id === id) {
          const nextPacked = !item.packed;
          // Check if this action triggers 100% completion
          if (nextPacked && prev.filter(i => i.packed).length + 1 === prev.length) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          }
          return { ...item, packed: nextPacked };
        }
        return item;
      });
      return next;
    });
  };

  // Select all / toggle packed for a specific category
  const toggleCategorySelectAll = (category: PackingCategory, targetPacked?: boolean) => {
    setItems(prev => {
      const catItems = prev.filter(i => i.category === category);
      if (catItems.length === 0) return prev;
      
      const allCurrentlyPacked = catItems.every(i => i.packed);
      const shouldPack = targetPacked !== undefined ? targetPacked : !allCurrentlyPacked;

      const next = prev.map(item => {
        if (item.category === category) {
          return { ...item, packed: shouldPack };
        }
        return item;
      });

      if (shouldPack && next.every(i => i.packed)) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      return next;
    });
  };

  // Delete / clear all items in a specific category
  const deleteCategoryItems = (category: PackingCategory) => {
    const label = CATEGORY_META[category]?.label || category;
    if (window.confirm(`Delete all items in "${label}"?`)) {
      setItems(prev => prev.filter(i => i.category !== category));
    }
  };

  // Adjust item quantity
  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: nextQty };
      }
      return item;
    }));
  };

  // Update item luggage type
  const updateLuggageType = (id: string, luggageType: LuggageType) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, luggageType } : item));
  };

  // Delete item
  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Add new item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: PackingItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newName.trim(),
      category: newCategory,
      quantity: newQuantity,
      packed: false,
      luggageType: newLuggage,
      priority: newPriority,
      notes: newNotes.trim() || undefined,
      weightGrams: newCategory === 'clothing' ? 200 : newCategory === 'electronics' ? 250 : 100,
      createdAt: Date.now(),
    };

    setItems(prev => [newItem, ...prev]);
    setNewName('');
    setNewNotes('');
    setNewQuantity(1);
  };

  // Bulk actions
  const markAllPacked = () => {
    setItems(prev => prev.map(i => ({ ...i, packed: true })));
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  const markAllUnpacked = () => {
    setItems(prev => prev.map(i => ({ ...i, packed: false })));
  };

  const clearPackedItems = () => {
    if (window.confirm('Remove all packed items from the list?')) {
      setItems(prev => prev.filter(i => !i.packed));
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        if (!matchName && !matchNotes && !matchCategory) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Status / Luggage filter
      if (selectedFilter === 'unpacked' && item.packed) return false;
      if (selectedFilter === 'packed' && !item.packed) return false;
      if (selectedFilter === 'essential' && item.priority !== 'essential') return false;
      if (selectedFilter === 'carry-on' && item.luggageType !== 'carry-on') return false;
      if (selectedFilter === 'checked' && item.luggageType !== 'checked') return false;
      if (selectedFilter === 'personal' && item.luggageType !== 'personal') return false;

      return true;
    });
  }, [items, searchQuery, selectedFilter, selectedCategory]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<PackingCategory, PackingItem[]> = {
      clothing: [],
      toiletries: [],
      electronics: [],
      documents: [],
      health_meds: [],
      weather_gear: [],
      misc: [],
    };

    filteredItems.forEach(item => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      } else {
        groups.misc.push(item);
      }
    });

    return groups;
  }, [filteredItems]);

  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Export as text summary
  const copyChecklistText = () => {
    let summary = `🎒 PACKING LIST FOR ${tripInfo.destination.toUpperCase()}\n`;
    summary += `Duration: ${tripInfo.durationDays} Days | Departure: ${tripInfo.departureDate || 'TBD'}\n`;
    summary += `Status: ${packedCount}/${totalCount} Packed (${percentage}%)\n\n`;

    (Object.keys(CATEGORY_META) as PackingCategory[]).forEach(cat => {
      const catItems = items.filter(i => i.category === cat);
      if (catItems.length > 0) {
        summary += `[${CATEGORY_META[cat].label.toUpperCase()}]\n`;
        catItems.forEach(item => {
          summary += ` ${item.packed ? '[X]' : '[ ]'} ${item.name} (Qty: ${item.quantity}) - ${item.luggageType}${item.notes ? ` - ${item.notes}` : ''}\n`;
        });
        summary += '\n';
      }
    });

    navigator.clipboard.writeText(summary);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      
      {/* Top Header Card with Stats & Controls */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Trip Summary & Progress Ring */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-stone-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={percentage === 100 ? 'text-emerald-500 transition-all duration-700' : 'text-amber-600 transition-all duration-700'}
                  strokeDasharray={`${percentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-bold text-stone-900">{percentage}%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900">{tripInfo.destination}</h2>
                <button
                  onClick={onOpenTripModal}
                  className="text-xs text-amber-700 hover:text-amber-800 font-medium underline cursor-pointer"
                >
                  Edit Trip
                </button>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {packedCount} of {totalCount} items packed • {unpackedCount} remaining
              </p>
              <div className="flex items-center gap-3 text-xs text-stone-600 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Luggage className="w-3.5 h-3.5 text-stone-400" />
                  Checked: <strong>{checkedCount}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                  Carry-on: <strong>{carryOnCount}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Backpack className="w-3.5 h-3.5 text-stone-400" />
                  Personal: <strong>{personalCount}</strong>
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px] bg-stone-100 px-1.5 py-0.5 rounded">
                  <Scale className="w-3 h-3 text-stone-400" />
                  ~{totalWeightKg} kg
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Saved Packing Lists Dropdown Selector */}
            {savedLists.length > 0 && onSwitchPackingList && (
              <div className="relative">
                <button
                  id="saved-lists-dropdown-toggle"
                  onClick={() => setShowSavedListDropdown(!showSavedListDropdown)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer border border-stone-200"
                  title="Switch between your saved packing lists"
                >
                  <ListOrdered className="w-3.5 h-3.5 text-amber-700" />
                  <span>Saved Lists ({savedLists.length})</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {showSavedListDropdown && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl border border-stone-200 shadow-xl z-40 p-2 space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-stone-500 uppercase border-b border-stone-100">
                      <span>Switch Active Trip List</span>
                      {onOpenVaultTab && (
                        <button 
                          onClick={() => {
                            setShowSavedListDropdown(false);
                            onOpenVaultTab();
                          }}
                          className="text-amber-700 hover:underline capitalize"
                        >
                          Manage all
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {savedLists.map((list) => {
                        const isCurrent = list.destination === tripInfo.destination && list.title === tripInfo.notes;
                        return (
                          <button
                            key={list.id}
                            onClick={() => {
                              onSwitchPackingList(list);
                              setShowSavedListDropdown(false);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                              isCurrent ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200' : 'hover:bg-stone-50 text-stone-700'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <span className="block truncate font-medium">{list.title}</span>
                              <span className="text-[10px] text-stone-400 block truncate">{list.destination} • {list.items.length} items</span>
                            </div>
                            {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {onSaveCurrentAsNewRecord && (
                      <button
                        onClick={() => {
                          setShowSavedListDropdown(false);
                          onSaveCurrentAsNewRecord();
                        }}
                        className="w-full text-center py-1.5 px-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save Current List as Record</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Import List File Button */}
            {onImportListFileClick && (
              <button
                onClick={onImportListFileClick}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer border border-stone-200/80"
                title="Import external .CSV, .JSON, or .TXT checklist"
              >
                <UploadCloud className="w-3.5 h-3.5 text-stone-600" />
                <span>Import File</span>
              </button>
            )}

            {/* Export CSV File Button */}
            <button
              onClick={() => {
                const csv = exportPackingListToCSV(items, tripInfo);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                downloadFile(blob, `packing_list_${tripInfo.destination.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer border border-stone-200/80"
              title="Export packing list as CSV file"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>Export CSV</span>
            </button>

            <button
              id="ai-audit-trigger-button"
              onClick={onOpenAuditModal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Audit Missing Items</span>
            </button>

            <button
              id="open-templates-button"
              onClick={onOpenTemplateModal}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-stone-500" />
              <span>Presets & Templates</span>
            </button>

            <button
              onClick={copyChecklistText}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
              title="Copy checklist as plain text"
            >
              <Copy className="w-3.5 h-3.5 text-stone-500" />
              <span>{copiedToast ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Item Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
        <form onSubmit={handleAddItem} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="new-item-name-input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Add item (e.g. '3x T-shirts', 'Toothbrush', 'Passport', 'Power bank')..."
              className="flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-amber-500 focus:outline-none"
            />
            
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as PackingCategory)}
              className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 focus:bg-white focus:outline-none"
            >
              <option value="clothing">👕 Clothing</option>
              <option value="toiletries">🧴 Toiletries</option>
              <option value="electronics">💻 Electronics</option>
              <option value="documents">📄 Documents</option>
              <option value="health_meds">💊 Health & Meds</option>
              <option value="weather_gear">🌦️ Weather Gear</option>
              <option value="misc">📦 Misc</option>
            </select>

            <select
              value={newLuggage}
              onChange={(e) => setNewLuggage(e.target.value as LuggageType)}
              className="rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 text-xs font-medium text-stone-700 focus:bg-white focus:outline-none"
            >
              <option value="carry-on">Carry-On Bag</option>
              <option value="checked">Checked Suitcase</option>
              <option value="personal">Personal Item (Backpack)</option>
            </select>

            <button
              id="add-item-submit-button"
              type="submit"
              disabled={!newName.trim()}
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>

          {/* Collapsible Advanced Options (Qty, Priority, Notes) */}
          <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
            <button
              type="button"
              onClick={() => setShowAdvancedAdd(!showAdvancedAdd)}
              className="text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>{showAdvancedAdd ? 'Hide' : 'More'} options (Quantity, Priority, Notes)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvancedAdd ? 'rotate-180' : ''}`} />
            </button>

            <span className="text-[11px] text-amber-800 font-medium">
              💡 Tip: You can also just tell TravelBot in chat: "Pack 2x jackets"
            </span>
          </div>

          {showAdvancedAdd && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Quantity</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setNewQuantity(Math.max(1, newQuantity - 1))}
                    className="w-7 h-7 rounded border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold">{newQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setNewQuantity(newQuantity + 1)}
                    className="w-7 h-7 rounded border border-stone-300 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as ItemPriority)}
                  className="w-full rounded border border-stone-300 bg-stone-50 px-2 py-1 text-xs text-stone-700 focus:outline-none"
                >
                  <option value="essential">🚨 Essential (Must Not Forget)</option>
                  <option value="recommended">⭐ Recommended</option>
                  <option value="optional">🔹 Optional / Nice to have</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Notes / Reminders</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Travel size <100ml, keep in jacket"
                  className="w-full rounded border border-stone-300 bg-stone-50 px-2.5 py-1 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          
          {/* Search Field */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              id="search-packing-items"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, notes, categories..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Quick Bulk Operations */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              onClick={markAllPacked}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-medium transition-colors"
            >
              Pack All
            </button>
            <button
              onClick={markAllUnpacked}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium transition-colors"
            >
              Unpack All
            </button>
            {packedCount > 0 && (
              <button
                onClick={clearPackedItems}
                className="text-xs px-2 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 font-medium transition-colors"
                title="Remove packed items from list"
              >
                Clear Packed
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Items ({totalCount})
          </button>
          <button
            onClick={() => setSelectedFilter('unpacked')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedFilter === 'unpacked' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            To Pack ({unpackedCount})
          </button>
          <button
            onClick={() => setSelectedFilter('packed')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedFilter === 'packed' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Packed ({packedCount})
          </button>
          <button
            onClick={() => setSelectedFilter('essential')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedFilter === 'essential' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            🚨 Essentials Only
          </button>
          <button
            onClick={() => setSelectedFilter('carry-on')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedFilter === 'carry-on' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Carry-on ({carryOnCount})
          </button>
          <button
            onClick={() => setSelectedFilter('checked')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedFilter === 'checked' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Checked ({checkedCount})
          </button>
          <button
            onClick={() => setSelectedFilter('personal')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedFilter === 'personal' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Personal ({personalCount})
          </button>
        </div>
      </div>

      {/* Grouped Category Packing List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-semibold text-stone-800 text-base">No items found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery ? `No items matched "${searchQuery}" in this filter.` : 'Your packing list is empty. Add items above or apply a pre-made trip template!'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={onOpenTemplateModal}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
              >
                Load Trip Template
              </button>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          (Object.keys(CATEGORY_META) as PackingCategory[]).map(catKey => {
            const catItems = groupedItems[catKey];
            if (catItems.length === 0) return null;

            const meta = CATEGORY_META[catKey];
            const Icon = meta.icon;
            const catPacked = catItems.filter(i => i.packed).length;
            const isCollapsed = collapsedCategories[catKey];

            return (
              <div key={catKey} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
                
                {/* Category Header */}
                <div 
                  className="px-4 py-3 bg-stone-50/80 hover:bg-stone-100/80 border-b border-stone-200 flex items-center justify-between transition-colors"
                >
                  {/* Left: Category Icon, Title, Counts & Select All */}
                  <div className="flex items-center gap-3 min-w-0 flex-wrap">
                    {/* Category Collapse Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleCategoryCollapse(catKey)}
                      className="flex items-center gap-2 text-left cursor-pointer group"
                      title={isCollapsed ? "Expand category" : "Collapse category"}
                    >
                      <div className={`w-7 h-7 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                      </div>
                      <span className="font-semibold text-stone-800 text-sm group-hover:text-stone-900">{meta.label}</span>
                      <span className="text-xs text-stone-500 font-medium">
                        ({catPacked}/{catItems.length})
                      </span>
                    </button>

                    {/* Category Select All Button */}
                    <button
                      type="button"
                      id={`select-all-${catKey}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategorySelectAll(catKey);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer border ${
                        catPacked === catItems.length
                          ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                          : catPacked > 0
                          ? 'bg-amber-100/80 text-amber-900 border-amber-300 hover:bg-amber-200'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50 hover:border-stone-400 shadow-2xs'
                      }`}
                      title={catPacked === catItems.length ? `Unselect all in ${meta.label}` : `Select all in ${meta.label}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                        catPacked === catItems.length
                          ? 'bg-emerald-600 text-white'
                          : catPacked > 0
                          ? 'bg-amber-600 text-white font-bold'
                          : 'border border-stone-400 bg-white'
                      }`}>
                        {catPacked === catItems.length && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        {catPacked > 0 && catPacked < catItems.length && <span>-</span>}
                      </div>
                      <span>{catPacked === catItems.length ? 'Unselect All' : 'Select All'}</span>
                    </button>
                  </div>

                  {/* Right: Progress bar, Category Delete Button & Collapse Arrow */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden hidden sm:block">
                      <div 
                        className={`h-full ${catPacked === catItems.length ? 'bg-emerald-500' : 'bg-amber-600'}`}
                        style={{ width: `${(catPacked / catItems.length) * 100}%` }}
                      />
                    </div>

                    {/* Delete Category Items */}
                    <button
                      type="button"
                      id={`delete-category-${catKey}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCategoryItems(catKey);
                      }}
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title={`Delete all items in ${meta.label}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCategoryCollapse(catKey)}
                      className="p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors cursor-pointer"
                      title={isCollapsed ? "Expand category" : "Collapse category"}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Items in Category */}
                {!isCollapsed && (
                  <div className="divide-y divide-stone-100">
                    {catItems.map(item => (
                      <div
                        key={item.id}
                        className={`px-4 py-3 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors ${
                          item.packed ? 'bg-stone-50/40 text-stone-400' : 'text-stone-800'
                        }`}
                      >
                        {/* Checkbox & Name */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => togglePacked(item.id)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                              item.packed
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'border-2 border-stone-300 hover:border-amber-600 bg-white'
                            }`}
                            title={item.packed ? 'Mark as unpacked' : 'Mark as packed'}
                          >
                            {item.packed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-medium ${item.packed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                                {item.name}
                              </span>

                              {item.quantity > 1 && (
                                <span className="text-[11px] font-bold px-1.5 py-0.2 bg-stone-100 text-stone-700 rounded-md border border-stone-200">
                                  {item.quantity}x
                                </span>
                              )}

                              {item.priority === 'essential' && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                                  Essential
                                </span>
                              )}

                              <select
                                value={item.luggageType}
                                onChange={(e) => updateLuggageType(item.id, e.target.value as LuggageType)}
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-stone-200 bg-white text-stone-600 focus:outline-none cursor-pointer"
                              >
                                <option value="carry-on">Carry-On</option>
                                <option value="checked">Checked</option>
                                <option value="personal">Personal Bag</option>
                              </select>
                            </div>

                            {item.notes && (
                              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                                💬 {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity Counter & Delete Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden text-xs">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-2 py-1 hover:bg-stone-200 text-stone-600 font-bold"
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-1.5 font-bold text-stone-700 min-w-[20px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-2 py-1 hover:bg-stone-200 text-stone-600 font-bold"
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => deleteItem(item.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
