import React, { useState } from 'react';
import { 
  BookOpen, 
  PhoneCall, 
  ShieldAlert, 
  Sparkles, 
  Languages, 
  Check, 
  Copy, 
  BatteryMedium, 
  Droplet, 
  Search,
  WifiOff
} from 'lucide-react';
import { OFFLINE_EMERGENCY_DATA } from '../utils/offlineEngine';

export const OfflineHandbook: React.FC = () => {
  const [searchPhrase, setSearchPhrase] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'spanish' | 'french' | 'japanese' | 'german'>('japanese');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const filteredPhrases = OFFLINE_EMERGENCY_DATA.commonPhrases.filter(p => 
    p.phrase.toLowerCase().includes(searchPhrase.toLowerCase()) ||
    p[selectedLanguage].toLowerCase().includes(searchPhrase.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-stone-900">Offline Survival & Travel Handbook</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <WifiOff className="w-3 h-3" />
                100% Offline Access
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Essential airline security regulations, worldwide emergency phone numbers, and survival phrases stored directly in your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: TSA Regulations & Battery Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Liquids 3-1-1 Rule */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">TSA & International Liquids Rule (3-1-1)</h3>
              <p className="text-[11px] text-stone-500">Carry-on baggage liquid restrictions</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <strong>3.4 Ounces (100ml) or Less:</strong> All liquid, gel, paste, or aerosol containers must be 100ml or smaller.
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <strong>1 Clear Quart-Sized Bag:</strong> All containers must fit comfortably in a single clear, zip-top plastic bag.
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <strong>1 Bag Per Traveler:</strong> Handed separately for X-ray inspection at security checkpoints.
            </div>
          </div>
          <p className="text-[11px] text-teal-800 bg-teal-50/70 p-2 rounded-lg border border-teal-200/80">
            ℹ️ <em>Exemptions:</em> Prescribed medications, insulin, and baby food/milk are permitted in reasonable quantities exceeding 100ml (declare to officers).
          </p>
        </div>

        {/* Battery & Power Bank Rules */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <BatteryMedium className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Lithium Batteries & Power Banks</h3>
              <p className="text-[11px] text-stone-500">Aviation fire safety rules (ICAO / FAA)</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
            <div className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-200 text-rose-900">
              <strong>🚨 CARRY-ON ONLY:</strong> Portable power banks, spare camera batteries, and vapes are strictly <em>FORBIDDEN</em> in checked luggage.
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <strong>100Wh (~27,000mAh) Standard Limit:</strong> Power banks under 100 watt-hours require no airline pre-approval.
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <strong>Short-Circuit Protection:</strong> Keep spare batteries in original packaging, taped terminals, or individual protective pouches.
            </div>
          </div>
          <p className="text-[11px] text-stone-500">
            ⚠️ Laptops in checked luggage must be fully turned off (not in sleep mode).
          </p>
        </div>
      </div>

      {/* Worldwide Emergency Numbers */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-rose-600" />
          <h3 className="font-bold text-stone-900 text-sm">International Emergency Hotlines</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-600 border-y border-stone-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Country / Region</th>
                <th className="py-2.5 px-3">Police</th>
                <th className="py-2.5 px-3">Ambulance</th>
                <th className="py-2.5 px-3">Fire</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {OFFLINE_EMERGENCY_DATA.emergencyNumbers.map((item, idx) => (
                <tr key={idx} className="hover:bg-stone-50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-stone-800">{item.country}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{item.police}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{item.ambulance}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{item.fire}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => handleCopy(`${item.country} Emergency: Police ${item.police}, Ambulance ${item.ambulance}`, `num-${idx}`)}
                      className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-600 font-medium text-[11px]"
                    >
                      {copiedItem === `num-${idx}` ? 'Copied' : 'Copy'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multilingual Emergency Phrases */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-stone-900 text-sm">Emergency Travel Phrasebook</h3>
          </div>

          <div className="flex items-center gap-1">
            {(['japanese', 'spanish', 'french', 'german'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchPhrase}
            onChange={(e) => setSearchPhrase(e.target.value)}
            placeholder="Search phrase in English or translation..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredPhrases.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col justify-between space-y-2 hover:bg-amber-50/50 transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-stone-900 block">{item.phrase}</span>
                <p className="text-xs font-medium text-amber-900 mt-1">
                  {item[selectedLanguage]}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-stone-400">{selectedLanguage}</span>
                <button
                  onClick={() => handleCopy(item[selectedLanguage], `phrase-${idx}`)}
                  className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium cursor-pointer"
                >
                  {copiedItem === `phrase-${idx}` ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Copy className="w-3 h-3" /> Copy
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Packing Hacks Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-stone-900 text-sm">Offline Space-Saving Packing Hacks</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OFFLINE_EMERGENCY_DATA.packingHacks.map((hack, idx) => (
            <div key={idx} className="p-3 bg-stone-50 rounded-lg border border-stone-200">
              <h4 className="font-semibold text-xs text-stone-900 mb-0.5">
                💡 {hack.title}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {hack.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
