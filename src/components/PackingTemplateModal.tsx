import React, { useState } from 'react';
import { 
  Package, 
  Sun, 
  Building2, 
  Snowflake, 
  Globe, 
  Check, 
  Plus, 
  Sparkles,
  Luggage,
  Calendar
} from 'lucide-react';
import { PRESET_TEMPLATES } from '../utils/storage';
import { PackingTemplate, PackingItem, TripInfo } from '../types';

interface PackingTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: PackingTemplate, mode: 'merge' | 'replace') => void;
  tripInfo: TripInfo;
}

const TEMPLATE_ICONS: Record<string, any> = {
  Sun,
  Building2,
  Snowflake,
  Globe,
};

export const PackingTemplateModal: React.FC<PackingTemplateModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  tripInfo,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PRESET_TEMPLATES[0].id);
  const [applyMode, setApplyMode] = useState<'merge' | 'replace'>('merge');

  if (!isOpen) return null;

  const selectedTemplate = PRESET_TEMPLATES.find(t => t.id === selectedTemplateId) || PRESET_TEMPLATES[0];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Packing List Templates</h3>
              <p className="text-xs text-stone-500">Quickly populate your list with curated travel gear</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-base font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Templates Selector Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          {PRESET_TEMPLATES.map(template => {
            const Icon = TEMPLATE_ICONS[template.icon] || Package;
            const isSelected = template.id === selectedTemplateId;

            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-stone-900 leading-tight">
                  {template.title}
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  {template.items.length} items • {template.durationDays}d
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Template Details & Items Preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
          <div>
            <h4 className="font-bold text-sm text-stone-900">{selectedTemplate.title}</h4>
            <p className="text-xs text-stone-600 mt-0.5">{selectedTemplate.description}</p>
            <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1">
              <span><strong>Climate:</strong> {selectedTemplate.climate}</span>
              <span>•</span>
              <span><strong>Duration:</strong> {selectedTemplate.durationDays} days</span>
            </div>
          </div>

          <div className="border-t border-stone-200/80 pt-2">
            <span className="text-[11px] font-bold uppercase text-stone-400 block mb-2">
              Items Included ({selectedTemplate.items.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedTemplate.items.map((item, idx) => (
                <div key={idx} className="p-2 bg-white rounded-lg border border-stone-200 text-xs flex items-center justify-between">
                  <span className="font-medium text-stone-800">
                    {item.name} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono capitalize">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application Mode & Footer */}
        <div className="shrink-0 pt-3 border-t border-stone-100 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-stone-700">How to apply:</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="applyMode"
                  value="merge"
                  checked={applyMode === 'merge'}
                  onChange={() => setApplyMode('merge')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>Merge with existing list</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-stone-500">
                <input
                  type="radio"
                  name="applyMode"
                  value="replace"
                  checked={applyMode === 'replace'}
                  onChange={() => setApplyMode('replace')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>Replace entire list</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApplyTemplate(selectedTemplate, applyMode);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply {selectedTemplate.title}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
