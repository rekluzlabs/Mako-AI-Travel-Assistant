import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  WifiOff, 
  CheckCircle2, 
  PlusCircle, 
  Trash2, 
  RefreshCw, 
  Bot, 
  User, 
  ArrowRight,
  CloudSun,
  MapPin,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  Paperclip,
  FileText,
  X
} from 'lucide-react';
import { ChatMessage, PackingItem, TripInfo, AddonModule, SuggestedAction, TravelDocument, DocumentCategory } from '../types';
import { processOfflineMessage } from '../utils/offlineEngine';
import { readFileAsDataURL, formatFileSize } from '../utils/fileVault';

interface ChatViewProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isOnline: boolean;
  packingList: PackingItem[];
  tripInfo: TripInfo;
  addons: AddonModule[];
  onAddPackingItems: (items: any[]) => void;
  onUpdatePackingStatus: (itemNames: string[], packed: boolean) => void;
  onRemovePackingItems: (itemNames: string[]) => void;
  onTriggerAudit: () => void;
  onOpenTemplateModal: () => void;
  onSaveDocumentFromChat?: (doc: TravelDocument) => void;
  onOpenVaultTab?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  setMessages,
  isOnline,
  packingList,
  tripInfo,
  addons,
  onAddPackingItems,
  onUpdatePackingStatus,
  onRemovePackingItems,
  onTriggerAudit,
  onOpenTemplateModal,
  onSaveDocumentFromChat,
  onOpenVaultTab,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFileData, setAttachedFileData] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileSelect = async (file: File) => {
    setAttachedFile(file);
    try {
      const data = await readFileAsDataURL(file);
      setAttachedFileData(data);
    } catch (e) {
      console.warn('Could not read file preview', e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if ((!query && !attachedFile) || isLoading) return;

    let displayContent = query;
    if (attachedFile) {
      const fileHeader = `📎 **Attached Document:** \`${attachedFile.name}\` (${formatFileSize(attachedFile.size)})`;
      displayContent = query 
        ? `${query}\n\n${fileHeader}`
        : `${fileHeader}\n\nPlease review this document and suggest packing items or travel reminders.`;
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: displayContent,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    const currentFile = attachedFile;
    const currentFileData = attachedFileData;
    setAttachedFile(null);
    setAttachedFileData(null);
    setIsLoading(true);

    // If a document was attached, also save it to the Document Vault!
    if (currentFile && currentFileData && onSaveDocumentFromChat) {
      const cat: DocumentCategory = /flight|ticket|boarding|airline/i.test(currentFile.name)
        ? 'tickets'
        : /hotel|airbnb|booking|reservation|hostel/i.test(currentFile.name)
        ? 'hotel'
        : /passport|visa|id|insurance/i.test(currentFile.name)
        ? 'passport_id'
        : 'general';

      const newDoc: TravelDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: currentFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
        category: cat,
        fileName: currentFile.name,
        fileType: currentFile.type || 'application/octet-stream',
        fileSize: currentFile.size,
        fileData: currentFileData,
        uploadDate: Date.now(),
        linkedDestination: tripInfo.destination,
        notes: 'Attached via Chat conversation',
      };
      onSaveDocumentFromChat(newDoc);
    }

    // If OFFLINE, handle locally with offline heuristics
    if (!isOnline) {
      setTimeout(() => {
        const offlineResult = processOfflineMessage(query, packingList, tripInfo);
        
        // Apply actions if any were returned
        const actionsApplied: any[] = [];
        if (offlineResult.itemsAdded && offlineResult.itemsAdded.length > 0) {
          onAddPackingItems(offlineResult.itemsAdded);
          actionsApplied.push({
            action: 'add',
            summary: `Added ${offlineResult.itemsAdded.length} item(s) to packing list`,
            itemsCount: offlineResult.itemsAdded.length,
            timestamp: Date.now(),
          });
        }
        if (offlineResult.itemsUpdated && offlineResult.itemsUpdated.length > 0) {
          const names = offlineResult.itemsUpdated.map(i => i.name);
          onUpdatePackingStatus(names, offlineResult.itemsUpdated[0].packed);
          actionsApplied.push({
            action: 'update',
            summary: `Updated status for: ${names.join(', ')}`,
            itemsCount: names.length,
            timestamp: Date.now(),
          });
        }

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: offlineResult.messageText,
          timestamp: Date.now(),
          suggestedActions: offlineResult.suggestedActions?.map(a => ({
            label: a.label,
            promptText: a.promptText,
          })),
          packingActionsApplied: actionsApplied.length > 0 ? actionsApplied : undefined,
          isOfflineGenerated: true,
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 400);
      return;
    }

    // ONLINE Flow: Send to Gemini API on server
    try {
      const activeAddons = addons.filter(a => a.enabled);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          currentPackingList: packingList,
          tripInfo,
          enabledAddons: activeAddons,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const actionsApplied: any[] = [];

      // Process function calls if returned by Gemini
      if (Array.isArray(data.functionCalls) && data.functionCalls.length > 0) {
        for (const call of data.functionCalls) {
          if (call.name === 'addPackingItems' && call.args?.items) {
            onAddPackingItems(call.args.items);
            actionsApplied.push({
              action: 'add',
              summary: `Added ${call.args.items.length} item(s) to packing list: ${call.args.items.map((i: any) => i.name).slice(0, 3).join(', ')}${call.args.items.length > 3 ? '...' : ''}`,
              itemsCount: call.args.items.length,
              timestamp: Date.now(),
            });
          } else if (call.name === 'updatePackingStatus' && call.args?.itemNames) {
            onUpdatePackingStatus(call.args.itemNames, Boolean(call.args.packed));
            actionsApplied.push({
              action: 'update',
              summary: `Marked as ${call.args.packed ? 'packed' : 'unpacked'}: ${call.args.itemNames.join(', ')}`,
              itemsCount: call.args.itemNames.length,
              timestamp: Date.now(),
            });
          } else if (call.name === 'removePackingItems' && call.args?.itemNames) {
            onRemovePackingItems(call.args.itemNames);
            actionsApplied.push({
              action: 'remove',
              summary: `Removed: ${call.args.itemNames.join(', ')}`,
              itemsCount: call.args.itemNames.length,
              timestamp: Date.now(),
            });
          }
        }
      }

      // Generate context-aware suggestions
      const defaultSuggestions: SuggestedAction[] = [
        { label: 'Check Missing Items', promptText: "What critical items am I still missing?" },
        { label: 'Weather Forecast & Clothes', promptText: `What is the expected weather in ${tripInfo.destination} and what clothes should I pack?` },
        { label: 'TSA Liquid Rules', promptText: "What are the rules for liquids and toiletries on flights?" },
      ];

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.text || "I've updated your travel details and packing list!",
        timestamp: Date.now(),
        suggestedActions: defaultSuggestions,
        packingActionsApplied: actionsApplied.length > 0 ? actionsApplied : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.warn('Network request failed, falling back to offline assistant:', err);
      // Seamless offline fallback on error
      const offlineResult = processOfflineMessage(query, packingList, tripInfo);
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: `*(Switched to Offline Mode)*\n\n` + offlineResult.messageText,
        timestamp: Date.now(),
        suggestedActions: offlineResult.suggestedActions?.map(a => ({
          label: a.label,
          promptText: a.promptText,
        })),
        isOfflineGenerated: true,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I'm **TravelBot**, your AI travel companion and packing assistant.\n\nI can help you:\n• 🗺️ **Plan itineraries and activities** for ${tripInfo.destination}\n• 🌦️ **Recommend clothing & weather gear** based on climate\n• 🧳 **Track your packing list in real-time** (try typing *"Pack passport"* or *"Add sunscreen"*)\n• ✈️ **Check airport TSA security rules** (liquids, power banks, baggage)\n• 💡 **Answer general knowledge questions**\n\n*Everything you add to your packing list is safely stored on your device and works seamlessly offline!*`,
      timestamp: Date.now(),
      suggestedActions: [
        { label: `Plan trip to ${tripInfo.destination}`, promptText: `Help me plan a 5-day itinerary for ${tripInfo.destination}` },
        { label: "What's missing from my list?", promptText: "What critical items do I still need to pack?" },
        { label: "Pack 2x T-shirts & adapter", promptText: "Add 2 breathable t-shirts and universal power adapter to my packing list" },
        { label: "TSA Liquid & Battery Rules", promptText: "Can I bring power banks and liquids on the airplane?" }
      ]
    };
    setMessages([welcomeMsg]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
      
      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 font-medium">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Offline Mode Active:</strong> You can add items, check off packing items, search offline travel rules, and manage your trip without internet.
            </span>
          </div>
          <span className="text-[11px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-mono">
            Local Storage
          </span>
        </div>
      )}

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-xs ${
                msg.role === 'user'
                  ? 'bg-stone-800'
                  : msg.isOfflineGenerated
                  ? 'bg-amber-700'
                  : 'bg-gradient-to-tr from-amber-600 to-amber-500'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed transition-all ${
                msg.role === 'user'
                  ? 'bg-stone-900 text-stone-100 rounded-tr-xs'
                  : 'bg-stone-100/90 text-stone-800 border border-stone-200/80 rounded-tl-xs'
              }`}
            >
              {/* Applied Packing Action Notification Pill */}
              {msg.packingActionsApplied && msg.packingActionsApplied.map((action, idx) => (
                <div 
                  key={idx} 
                  className="mb-3 flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{action.summary}</span>
                </div>
              ))}

              {/* Offline badge inside message */}
              {msg.isOfflineGenerated && (
                <div className="mb-2 inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                  <WifiOff className="w-3 h-3" />
                  <span>Offline Local Response</span>
                </div>
              )}

              {/* Message Markdown Content */}
              <div className="prose prose-stone prose-sm max-w-none break-words dark:prose-invert">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="mb-0.5">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
                    h3: ({ children }) => <h3 className="font-semibold text-base mt-3 mb-1 text-stone-900">{children}</h3>,
                    h4: ({ children }) => <h4 className="font-semibold text-sm mt-2 mb-1 text-stone-900">{children}</h4>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>

              {/* Suggested Action Chips */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-200/60 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(action.promptText)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 transition-colors font-medium cursor-pointer text-left"
                    >
                      <span>{action.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white text-xs shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-stone-100 border border-stone-200/80 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-stone-600 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]" />
              <span className="font-medium text-stone-700 ml-1">
                {isOnline ? 'TravelBot is thinking & updating packing list...' : 'Processing with offline packing engine...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Bar */}
      <div className="bg-stone-50 border-t border-stone-200/80 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-medium text-stone-500 shrink-0">Quick Tools:</span>
        <button
          onClick={() => handleSendMessage("What do I still need to pack? Remind me what is missing.")}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50 text-stone-700 transition-colors"
        >
          <Briefcase className="w-3.5 h-3.5 text-amber-700" />
          <span>Check Missing Items</span>
        </button>
        <button
          onClick={() => handleSendMessage(`What is the typical weather in ${tripInfo.destination} and what clothes should I bring?`)}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50 text-stone-700 transition-colors"
        >
          <CloudSun className="w-3.5 h-3.5 text-amber-700" />
          <span>Weather & Clothes Advice</span>
        </button>
        <button
          onClick={() => handleSendMessage("What are the airport TSA regulations for liquids, power banks, and carry-on baggage?")}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50 text-stone-700 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Baggage Safety Rules</span>
        </button>
        <button
          onClick={onTriggerAudit}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50 text-stone-700 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>AI Packing Audit</span>
        </button>
        <button
          onClick={onOpenTemplateModal}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-white border border-stone-200 hover:border-amber-300 hover:bg-amber-50 text-stone-700 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-700" />
          <span>Apply Trip Template</span>
        </button>
        <button
          onClick={handleResetChat}
          className="shrink-0 ml-auto inline-flex items-center gap-1 text-xs px-2 py-1 rounded text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors"
          title="Reset Chat History"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Input Composer */}
      <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
        {/* Attached file badge preview */}
        {attachedFile && (
          <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-xs font-semibold text-stone-900 truncate">
                {attachedFile.name}
              </span>
              <span className="text-[11px] text-stone-500 shrink-0">
                ({formatFileSize(attachedFile.size)})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedFile(null);
                setAttachedFileData(null);
              }}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-amber-100/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          {/* File attachment hidden input and button */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.txt,.csv,.json"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-11 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Attach travel document, flight ticket, or packing file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              id="chat-input-textarea"
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isOnline
                  ? `Ask travel questions, weather advice, or attach documents/tickets...`
                  : `Offline Mode: Type "Pack passport", "Add 3 socks", "What is missing?", "TSA rules"...`
              }
              className="w-full resize-none rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all max-h-32 min-h-[44px]"
            />
          </div>

          <button
            id="chat-send-button"
            type="submit"
            disabled={(!inputValue.trim() && !attachedFile) || isLoading}
            className="h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600 text-white font-medium text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 text-[11px] text-stone-600 flex items-center justify-between">
          <span>Press <strong>Enter</strong> to send • Attach PDF/images/tickets</span>
          {onOpenVaultTab && (
            <button 
              type="button" 
              onClick={onOpenVaultTab}
              className="text-amber-800 font-medium hover:underline flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              <span>Open Document Vault</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
