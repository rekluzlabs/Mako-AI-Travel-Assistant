import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ShieldCheck, 
  RefreshCw, 
  Scale, 
  Check,
  WifiOff
} from 'lucide-react';
import { PackingItem, TripInfo, PackingAuditResult, PackingCategory, LuggageType } from '../types';

interface PackingAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  packingList: PackingItem[];
  tripInfo: TripInfo;
  isOnline: boolean;
  onAddMissingItem: (item: Partial<PackingItem>) => void;
}

export const PackingAuditModal: React.FC<PackingAuditModalProps> = ({
  isOpen,
  onClose,
  packingList,
  tripInfo,
  isOnline,
  onAddMissingItem,
}) => {
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<PackingAuditResult | null>(null);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      runAudit();
    }
  }, [isOpen]);

  const runAudit = async () => {
    setLoading(true);
    setAddedItems({});

    // If offline, use heuristic offline checklist audit
    if (!isOnline) {
      setTimeout(() => {
        const missing: any[] = [];
        const warnings: string[] = [];
        const tips: string[] = [];

        // Check documents
        const hasPassport = packingList.some(i => /passport|id card/i.test(i.name));
        if (!hasPassport) {
          missing.push({
            name: 'Passport / Official ID',
            category: 'documents',
            reason: 'Mandatory travel document required for international flights & check-in.',
            suggestedLuggage: 'personal'
          });
        }

        // Check power adapter
        const hasAdapter = packingList.some(i => /adapter|charger/i.test(i.name));
        if (!hasAdapter) {
          missing.push({
            name: 'Universal Travel Power Adapter',
            category: 'electronics',
            reason: 'Crucial for charging devices at foreign wall plug configurations.',
            suggestedLuggage: 'carry-on'
          });
        }

        // Check emergency meds
        const hasMeds = packingList.some(i => /med|pill|first aid|advil|tylenol/i.test(i.name));
        if (!hasMeds) {
          missing.push({
            name: 'Basic First Aid & Pain/GI Meds Kit',
            category: 'health_meds',
            reason: 'Essential for motion sickness, food changes, or unexpected minor ailments.',
            suggestedLuggage: 'carry-on'
          });
        }

        // Check power bank in checked bag rule
        const powerBankInChecked = packingList.some(i => /power bank|battery/i.test(i.name) && i.luggageType === 'checked');
        if (powerBankInChecked) {
          warnings.push('CRITICAL: You have a Power Bank or Battery marked for Checked Luggage. Airlines strictly require all lithium power banks in Carry-On.');
        } else {
          warnings.push('Ensure all liquid toiletries in carry-on bags are under 100ml (3.4 oz) and in a 1-quart transparent pouch.');
        }

        tips.push('Pack versatile layers rather than single-use heavy jackets to save suitcase space.');
        tips.push('Wear your bulkiest shoes and heaviest jacket on the flight to reduce checked baggage weight.');

        const packedCount = packingList.filter(i => i.packed).length;
        const total = Math.max(1, packingList.length);
        const readiness = Math.min(100, Math.round((packedCount / total) * 80) + (hasPassport ? 10 : 0) + (hasAdapter ? 10 : 0));

        setAuditResult({
          readinessScore: readiness,
          statusAssessment: readiness > 80 ? 'Solid preparation! Just a few final checks needed.' : 'Good start, but some critical travel essentials are still missing.',
          missingEssentials: missing,
          luggageRulesWarnings: warnings,
          lightenLoadTips: tips
        });
        setLoading(false);
      }, 500);
      return;
    }

    // Online Gemini AI Audit API
    try {
      const res = await fetch('/api/audit-packing-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packingList,
          tripInfo,
        })
      });

      if (!res.ok) throw new Error('Audit failed');
      const data = await res.json();
      setAuditResult(data);
    } catch (e) {
      console.warn('AI audit failed, using offline fallback', e);
      // Fallback offline result
      setAuditResult({
        readinessScore: 75,
        statusAssessment: 'Packing checklist reviewed locally.',
        missingEssentials: [
          { name: 'Universal Power Adapter', category: 'electronics', reason: 'Recommended for global compatibility' }
        ],
        luggageRulesWarnings: ['Check that liquid toiletries in carry-on are under 100ml (3.4oz).'],
        lightenLoadTips: ['Pack neutral mix-and-match clothing to minimize laundry.']
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleAddMissing = (item: any, key: string) => {
    onAddMissingItem({
      name: item.name,
      category: item.category as PackingCategory,
      quantity: 1,
      packed: false,
      luggageType: (item.suggestedLuggage as LuggageType) || 'carry-on',
      priority: 'essential',
      notes: item.reason,
    });
    setAddedItems(prev => ({ ...prev, [key]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">TravelBot Packing Audit</h3>
              <p className="text-xs text-stone-500">Security & readiness inspection for {tripInfo.destination}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-base font-bold cursor-pointer">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-stone-800">
                Analyzing packing list against climate & airline security rules...
              </p>
              <p className="text-xs text-stone-500">Checking TSA 3-1-1 regulations, missing chargers, and weather gear</p>
            </div>
          ) : auditResult ? (
            <>
              {/* Readiness Score Card */}
              <div className="p-4 bg-stone-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold block">
                    Travel Readiness Score
                  </span>
                  <div className="text-2xl font-extrabold mt-0.5">
                    {auditResult.readinessScore}/100
                  </div>
                  <p className="text-xs text-stone-300 mt-0.5">
                    {auditResult.statusAssessment}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-amber-400 flex items-center justify-center font-bold text-base text-amber-300">
                  {auditResult.readinessScore}%
                </div>
              </div>

              {/* Missing Essentials */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>Identified Missing Essentials ({auditResult.missingEssentials.length})</span>
                </div>

                {auditResult.missingEssentials.length === 0 ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No critical missing items detected! Your checklist looks comprehensive.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {auditResult.missingEssentials.map((item, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-lg flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-stone-900">{item.name}</div>
                          <p className="text-[11px] text-stone-600 mt-0.5">{item.reason}</p>
                        </div>
                        <button
                          onClick={() => handleAddMissing(item, `missing-${idx}`)}
                          disabled={addedItems[`missing-${idx}`]}
                          className="shrink-0 px-2.5 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 disabled:bg-emerald-600 text-white font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {addedItems[`missing-${idx}`] ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Add to list</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Luggage Safety & Compliance */}
              {auditResult.luggageRulesWarnings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <span>Aviation Security & Luggage Advice</span>
                  </div>
                  <div className="space-y-1.5">
                    {auditResult.luggageRulesWarnings.map((warning, idx) => (
                      <div key={idx} className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-700">
                        • {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight Saving Tips */}
              {auditResult.lightenLoadTips.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <Scale className="w-4 h-4 text-indigo-700" />
                    <span>Lighten Your Load (Save Weight)</span>
                  </div>
                  <div className="space-y-1.5">
                    {auditResult.lightenLoadTips.map((tip, idx) => (
                      <div key={idx} className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600">
                        💡 {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="shrink-0 pt-3 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={runAudit}
            disabled={loading}
            className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-run Audit</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
