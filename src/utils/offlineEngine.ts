import { PackingItem, TripInfo, PackingCategory, LuggageType, ItemPriority, ChatMessage } from '../types';

export interface OfflineParseResult {
  messageText: string;
  itemsAdded?: PackingItem[];
  itemsUpdated?: { id: string; name: string; packed: boolean }[];
  itemsRemoved?: string[];
  suggestedActions?: Array<{ label: string; promptText: string }>;
}

// Heuristic keyword category matcher
export function guessCategory(itemName: string): PackingCategory {
  const lower = itemName.toLowerCase();
  if (/(shirt|pants|socks|underwear|jacket|coat|hoodie|shoes|dress|skirt|shorts|sweater|gloves|beanie|hat|swimsuit|scarf|jeans|suit|sport coat|blazer|tie|suspenders|belt|pajama|robe|slippers)/i.test(lower)) {
    return 'clothing';
  }
  if (/(toothbrush|toothpaste|shampoo|soap|deodorant|lotion|sunscreen|floss|shaver|razor|perfume|cologne|cleanser|lip balm|nail clipper|mouthwash|q-tip|cotton|washcloth|comb|brush)/i.test(lower)) {
    return 'toiletries';
  }
  if (/(charger|cable|adapter|laptop|phone|camera|power bank|battery|headphones|earbuds|tablet|kindle|sd card|smartwatch|flash drive|bluetooth)/i.test(lower)) {
    return 'electronics';
  }
  if (/(passport|visa|id|ticket|boarding pass|insurance|license|cash|credit card|hotel booking|wallet|money belt|itinerary|agenda|documents|travel guide|map|change for cab)/i.test(lower)) {
    return 'documents';
  }
  if (/(meds|medicine|pills|advil|tylenol|aspirin|inhaler|bandaid|bandages|vitamins|prescriptions|first aid|imodium|roboxacet|sanitizer|wipes|allergy|pain medication)/i.test(lower)) {
    return 'health_meds';
  }
  if (/(umbrella|raincoat|poncho|hand warmer|sunglasses|thermal|gloves)/i.test(lower)) {
    return 'weather_gear';
  }
  return 'misc';
}

// Guess luggage type based on airport security rules
export function guessLuggageType(itemName: string, category: PackingCategory): LuggageType {
  const lower = itemName.toLowerCase();
  if (category === 'documents' || lower.includes('passport') || lower.includes('wallet') || lower.includes('ticket') || lower.includes('money') || lower.includes('phone') || lower.includes('keys')) {
    return 'personal';
  }
  if (lower.includes('knife') || lower.includes('scissors') || lower.includes('swiss army')) {
    return 'checked'; // Prohibited in carry-on by TSA
  }
  if (lower.includes('power bank') || lower.includes('battery') || lower.includes('laptop') || lower.includes('camera') || lower.includes('prescription')) {
    return 'carry-on'; // TSA rule: lithium batteries prohibited in checked baggage
  }
  if (lower.includes('liquid') || lower.includes('shampoo') || lower.includes('full size') || lower.includes('sunscreen')) {
    return 'carry-on';
  }
  return 'carry-on';
}

// Offline NLP Processor
export function processOfflineMessage(
  input: string,
  currentPackingList: PackingItem[],
  tripInfo: TripInfo
): OfflineParseResult {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  // 1. Check if user is asking for missing items / status summary
  if (
    lower.includes('what do i still need') ||
    lower.includes('what is missing') ||
    lower.includes("what's missing") ||
    lower.includes('remind me') ||
    lower.includes('packing status') ||
    lower.includes('unpacked') ||
    lower.includes('items left') ||
    lower.includes('show list')
  ) {
    const unpacked = currentPackingList.filter(item => !item.packed);
    const packedCount = currentPackingList.length - unpacked.length;
    const percentage = currentPackingList.length > 0 ? Math.round((packedCount / currentPackingList.length) * 100) : 0;

    if (unpacked.length === 0) {
      return {
        messageText: `🎉 **Awesome news!** You have packed 100% of your items (${currentPackingList.length}/${currentPackingList.length})! You are completely ready for your trip to **${tripInfo.destination}**.`,
        suggestedActions: [
          { label: 'Check TSA Luggage Rules', promptText: 'What are the TSA carry-on rules?' },
          { label: 'Audit Packing Security', promptText: 'Are there any dangerous items in checked bags?' }
        ]
      };
    }

    const essentials = unpacked.filter(i => i.priority === 'essential');
    const recommended = unpacked.filter(i => i.priority !== 'essential');

    let response = `📋 **Offline Packing Status: ${packedCount}/${currentPackingList.length} items packed (${percentage}%)**\n\n`;
    
    if (essentials.length > 0) {
      response += `🚨 **Critical Missing Essentials (${essentials.length}):**\n`;
      essentials.forEach(item => {
        response += `• **${item.name}** (${item.quantity > 1 ? `${item.quantity}x, ` : ''}${item.category} → *${item.luggageType}*)\n`;
      });
      response += `\n`;
    }

    if (recommended.length > 0) {
      response += `📦 **Other Items Still To Pack (${recommended.length}):**\n`;
      recommended.slice(0, 8).forEach(item => {
        response += `• ${item.name} (${item.category})\n`;
      });
      if (recommended.length > 8) {
        response += `• ...and ${recommended.length - 8} more items.\n`;
      }
    }

    return {
      messageText: response,
      suggestedActions: [
        { label: 'Mark All Essentials Packed', promptText: 'Pack all essential items' },
        { label: 'View TSA Liquid Rules', promptText: 'Tell me the liquids rule' }
      ]
    };
  }

  // 2. Mark item(s) as packed / check off
  const packMatch = lower.match(/(?:mark|check|packed|pack|done with)\s+(.+)/i);
  if (packMatch && !lower.startsWith('add ') && !lower.startsWith('how ') && !lower.startsWith('what ')) {
    const rawTarget = packMatch[1].replace(/as packed|off|done/gi, '').trim();
    const matches = currentPackingList.filter(item => 
      item.name.toLowerCase().includes(rawTarget) || rawTarget.includes(item.name.toLowerCase())
    );

    if (matches.length > 0) {
      const updated = matches.map(m => ({ id: m.id, name: m.name, packed: true }));
      return {
        messageText: `✅ **Packed!** Marked **${matches.map(m => m.name).join(', ')}** as packed in your offline list.`,
        itemsUpdated: updated,
        suggestedActions: [
          { label: "What's still missing?", promptText: "What do I still need to pack?" }
        ]
      };
    }
  }

  // 3. Unpack / Mark as unpacked
  const unpackMatch = lower.match(/(?:unpack|uncheck|remove from packed)\s+(.+)/i);
  if (unpackMatch) {
    const rawTarget = unpackMatch[1].trim();
    const matches = currentPackingList.filter(item => 
      item.name.toLowerCase().includes(rawTarget) || rawTarget.includes(item.name.toLowerCase())
    );
    if (matches.length > 0) {
      const updated = matches.map(m => ({ id: m.id, name: m.name, packed: false }));
      return {
        messageText: `🔄 Marked **${matches.map(m => m.name).join(', ')}** as unpacked.`,
        itemsUpdated: updated
      };
    }
  }

  // 4. Add new item(s) (e.g., "add 3 socks", "pack passport", "add sunscreen to toiletries")
  if (lower.startsWith('add ') || lower.startsWith('pack ') || lower.includes('need to bring ') || lower.includes('include ')) {
    const cleanStr = lower
      .replace(/^add\s+/i, '')
      .replace(/^pack\s+/i, '')
      .replace(/^need to bring\s+/i, '')
      .replace(/^include\s+/i, '');

    // Extract quantity if present: "3 shirts", "2x cables"
    const qtyMatch = cleanStr.match(/^(\d+)(?:x|\s+)(.+)/i);
    const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
    const itemName = qtyMatch ? qtyMatch[2].trim() : cleanStr.trim();

    if (itemName.length > 1) {
      const category = guessCategory(itemName);
      const luggageType = guessLuggageType(itemName, category);
      const priority: ItemPriority = /passport|meds|prescription|adapter|phone|ticket|id|wallet/i.test(itemName) ? 'essential' : 'recommended';

      // Capitalize first letter of item
      const formattedName = itemName.charAt(0).toUpperCase() + itemName.slice(1);

      const newItem: PackingItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: formattedName,
        category,
        quantity,
        packed: false,
        luggageType,
        priority,
        notes: `Added offline for ${tripInfo.destination}`,
        createdAt: Date.now(),
      };

      return {
        messageText: `➕ **Added to Packing List (Offline)!**\n• **${formattedName}** (Qty: ${quantity}, Category: *${category}*, Luggage: *${luggageType}*, Priority: *${priority}*)\n\nI've automatically categorized it and placed it in your offline tracker.`,
        itemsAdded: [newItem],
        suggestedActions: [
          { label: 'Mark as Packed', promptText: `Pack ${formattedName}` },
          { label: 'What do I still need?', promptText: "What do I still need to pack?" }
        ]
      };
    }
  }

  // 5. Offline Knowledge & Travel Rules
  if (lower.includes('tsa') || lower.includes('liquid') || lower.includes('3-1-1') || lower.includes('100ml')) {
    return {
      messageText: `🧴 **Offline TSA & Airport Liquids Rule (3-1-1 Guide):**\n\n` +
        `• **3.4 Ounces (100ml) or less:** All liquids, gels, creams, and aerosols in carry-on bags must be in containers of 100ml (3.4 oz) or less.\n` +
        `• **1 Quart Clear Bag:** All liquid containers must comfortably fit inside a single, transparent, resealable 1-quart (1-liter) zip bag.\n` +
        `• **1 Bag Per Passenger:** Only one liquids bag is permitted per traveler at airport security.\n\n` +
        `⚠️ *Exceptions:* Medically necessary liquids, prescription medications, and baby formula/breast milk are exempt from the 100ml limit (declare them to security officers).`,
      suggestedActions: [
        { label: 'Battery Rules for Flights', promptText: 'Where do power banks go on planes?' },
        { label: 'Missing Packing Items', promptText: 'What is missing from my list?' }
      ]
    };
  }

  if (lower.includes('power bank') || lower.includes('battery') || lower.includes('lithium') || lower.includes('vape')) {
    return {
      messageText: `🔋 **Offline Aviation Safety Alert: Lithium Batteries & Electronics**\n\n` +
        `• **CARRY-ON ONLY:** Spare lithium-ion batteries, portable power banks, e-cigarettes/vapes, and loose camera batteries **MUST** be placed in your carry-on luggage or personal bag.\n` +
        `• **PROHIBITED IN CHECKED BAGGAGE:** Due to fire hazard risks, airlines strictly prohibit spare power banks in checked bags.\n` +
        `• **Capacity Limit:** Power banks up to 100Wh (~27,000mAh) are universally permitted without special airline approval.`,
      suggestedActions: [
        { label: 'Check my Electronics', promptText: 'Review my electronics packing' }
      ]
    };
  }

  // 6. Generic Offline Assistant Response
  return {
    messageText: `⚡ **Offline Mode Active:** You're currently disconnected or using offline mode, but your **Packing List & Travel Tracker** are 100% active!\n\n` +
      `Here is what you can do offline right now:\n` +
      `• **Add items:** Type *"Add 3 shirts"* or *"Pack umbrella"*\n` +
      `• **Mark items packed:** Type *"Check off passport"* or *"Packed toothbrush"*\n` +
      `• **Check missing items:** Type *"What do I still need to pack?"*\n` +
      `• **Ask airport regulations:** Type *"What are the TSA liquid rules?"* or *"Can I pack power banks?"*\n\n` +
      `*When you are back online, full AI web search and dynamic destination forecasts will automatically resume.*`,
    suggestedActions: [
      { label: 'Check Missing Items', promptText: "What do I still need to pack?" },
      { label: 'TSA Carry-on Rules', promptText: "What are the liquids rules for flying?" },
      { label: 'Emergency Offline Guide', promptText: "What are universal emergency numbers?" }
    ]
  };
}

// Built-in Offline Emergency Handbook Data
export const OFFLINE_EMERGENCY_DATA = {
  emergencyNumbers: [
    { country: 'United States & Canada', police: '911', ambulance: '911', fire: '911' },
    { country: 'European Union & UK', police: '112 / 999', ambulance: '112 / 999', fire: '112' },
    { country: 'Japan', police: '110', ambulance: '119', fire: '119' },
    { country: 'Australia', police: '000', ambulance: '000', fire: '000' },
    { country: 'New Zealand', police: '111', ambulance: '111', fire: '111' },
    { country: 'Thailand', police: '191 (Tourist Police: 1155)', ambulance: '1669', fire: '199' },
    { country: 'Mexico', police: '911', ambulance: '911', fire: '911' },
  ],
  packingHacks: [
    { title: 'The Ranger Roll Technique', tip: 'Roll t-shirts and pants into tight cylinders instead of folding to prevent creases and maximize bag space by up to 30%.' },
    { title: 'Heavy Items Near Wheels', tip: 'Place shoes and heavy toiletry bags at the bottom of rolling luggage (near the wheels) for better weight balance and smoother rolling.' },
    { title: 'Shoe Packing Efficiency', tip: 'Stuff socks, charging cables, and small fragile items inside your packed shoes to preserve shoe shape and save space.' },
    { title: 'Spill Prevention for Toiletries', tip: 'Unscrew bottle caps, place a small piece of plastic wrap over the bottle opening, then screw the cap tightly back on to prevent pressure leaks in flight.' },
    { title: 'Emergency Document Copies', tip: 'Take clear photos of your passport info page, entry visas, and credit cards; store them in an encrypted offline notes app or password manager.' }
  ],
  commonPhrases: [
    { phrase: 'Where is the hospital / pharmacy?', spanish: '¿Dónde está el hospital / la farmacia?', french: 'Où est l\'hôpital / la pharmacie?', japanese: 'Byōin / yakkyoku wa doko desu ka? (病院 / 薬局はどこですか)', german: 'Wo ist das Krankenhaus / die Apotheke?' },
    { phrase: 'I need help / Emergency', spanish: '¡Necesito ayuda! / ¡Emergencia!', french: 'J\'ai besoin d\'aide / Urgence', japanese: 'Tasukete kudasai! (助けてください)', german: 'Ich brauche Hilfe / Notfall' },
    { phrase: 'Where is the restroom / toilet?', spanish: '¿Dónde está el baño?', french: 'Où sont les toilettes ?', japanese: 'Toire wa doko desu ka? (トイレはどこですか)', german: 'Wo ist die Toilette?' },
    { phrase: 'Do you speak English?', spanish: '¿Habla inglés?', french: 'Parlez-vous anglais ?', japanese: 'Eigo o hanasemasu ka? (英語を話せますか)', german: 'Sprechen Sie Englisch?' }
  ]
};
