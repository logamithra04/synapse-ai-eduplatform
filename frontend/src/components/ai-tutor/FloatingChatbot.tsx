import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Bot, X, Send, Minus, Maximize2, Minimize2,
  Copy, Check, Key, CheckCircle, AlertCircle, RefreshCw,
  BookOpen, Code, Database, ChevronDown, ChevronUp, Cpu
} from 'lucide-react';
import { apiRequest } from '../../api/client';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'gemini_api' | 'project_rag' | 'project_rag_fallback';
  model?: string;
}

interface FloatingChatbotProps {
  contextData?: {
    course_title?: string;
    lesson_title?: string;
    topic?: string;
    code?: string;
    project_title?: string;
    project_slug?: string;
    dataset?: string;
    active_dataset?: string;
    domain?: string;
    language?: string;
    user_role?: string;
    course_id?: number;
  };
  onOpenFullDrawer?: () => void;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  contextData,
  onOpenFullDrawer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hi! I'm **DataTutor AI**, your floating mentor.\n\nI can help you understand **lecture videos**, debug **coding exercises**, explore **canonical datasets**, and solve **capstone projects**!\n\nAsk me anything or choose a suggested topic below.",
      timestamp: 'Just now',
      source: 'gemini_api',
      model: 'gemini-3.5-flash-lite',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('synapse_gemini_key') || '');
  const [keyInput, setKeyInput] = useState<string>(() => localStorage.getItem('synapse_gemini_key') || '');
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyVerificationStatus, setKeyVerificationStatus] = useState<{ valid: boolean; message: string } | null>(null);
  const [backendStatus, setBackendStatus] = useState<{ backend_has_key: boolean; primary_model: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      fetchStatus();
    }
  }, [isOpen, messages]);

  const fetchStatus = async () => {
    try {
      const res = await apiRequest<{ backend_has_key: boolean; primary_model: string }>('/ai/status');
      setBackendStatus(res);
    } catch {
      // optional
    }
  };

  const handleVerifyAndSaveKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      localStorage.removeItem('synapse_gemini_key');
      setApiKey('');
      setKeyVerificationStatus({ valid: true, message: 'Custom key removed. Using server configuration.' });
      return;
    }

    setIsVerifyingKey(true);
    setKeyVerificationStatus(null);
    try {
      const res = await apiRequest<{ valid: boolean; message: string }>('/ai/verify-key', {
        method: 'POST',
        body: JSON.stringify({ api_key: trimmed }),
      });
      setKeyVerificationStatus(res);
      if (res.valid) {
        localStorage.setItem('synapse_gemini_key', trimmed);
        setApiKey(trimmed);
        setTimeout(() => setShowKeyConfig(false), 1500);
      }
    } catch {
      setKeyVerificationStatus({ valid: false, message: 'Verification endpoint error.' });
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const getSuggestedPrompts = () => {
    if (contextData?.topic === 'Student Cohort Mentorship' || contextData?.user_role === 'mentor') {
      return [
        "How can I help at-risk students catch up?",
        "What evaluation rubric should I apply to capstone grading?",
        "Write a constructive 1-on-1 feedback note",
      ];
    }
    if (contextData?.project_title) {
      return [
        `What models should I use for ${contextData.project_title}?`,
        `How to avoid data leakage in ${contextData.project_title}?`,
        `Explain the starter code pipeline`,
      ];
    }
    if (contextData?.lesson_title) {
      return [
        `Explain the key concepts of ${contextData.lesson_title}`,
        `Show a clean Python code snippet for this`,
        `What are common interview questions on this topic?`,
      ];
    }
    if (contextData?.language === 'sql') {
      return [
        "Show a multi-table JOIN example on learning_database.db",
        "How do window functions work in SQLite?",
      ];
    }
    return [
      "Explain the Bias-Variance tradeoff with an example",
      "How to evaluate models with severe class imbalance?",
      "Show how to join customers and orders in learning_database.db",
    ];
  };

  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await apiRequest<{ response: string; source?: any; model?: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          context: contextData || {},
          api_key: apiKey || undefined,
          history: conversationHistory,
        }),
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
        model: res.model,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: "I encountered a network issue communicating with the Synapse AI Engine. Please check your connection or backend status.",
          timestamp: 'Just now',
          source: 'project_rag',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderMessageContent = (text: string, msgId: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim();
        const code = lines.slice(1).join('\n');
        const codeBlockId = `${msgId}-code-${index}`;

        return (
          <div key={index} className="my-2.5 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 text-slate-100 font-mono text-[11px] shadow-sm">
            <div className="px-3 py-1.5 bg-slate-800/90 border-b border-slate-700/80 text-slate-400 text-[10px] flex justify-between items-center">
              <span>{lang || 'python'}</span>
              <button
                onClick={() => copyToClipboard(code, codeBlockId)}
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                {copiedId === codeBlockId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const paragraphs = part.split('\n\n');
      return (
        <div key={index} className="space-y-2">
          {paragraphs.map((p, pIdx) => {
            if (p.startsWith('### ')) {
              return <h4 key={pIdx} className="font-bold text-xs text-slate-900 mt-2 mb-1">{p.slice(4)}</h4>;
            }
            if (p.startsWith('#### ')) {
              return <h5 key={pIdx} className="font-semibold text-xs text-slate-800 mt-1 mb-0.5">{p.slice(5)}</h5>;
            }
            if (p.startsWith('- ') || p.startsWith('* ')) {
              return (
                <ul key={pIdx} className="list-disc list-inside space-y-0.5 text-xs text-slate-700 pl-1">
                  <li>{p.slice(2)}</li>
                </ul>
              );
            }
            return (
              <p key={pIdx} className="text-xs text-slate-700 leading-relaxed font-normal">
                {p}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const isGeminiLive = Boolean(apiKey || backendStatus?.backend_has_key);

  return (
    <>
      {/* Floating Action Launcher Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-indigo-100"
            title="Chat with DataTutor AI"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
            
            {/* Online Status Beacon */}
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>

            {/* Hover Tooltip Pill */}
            <span className="absolute right-16 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Ask DataTutor AI 💡
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Card */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 w-[95vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-indigo-300 border border-white/10">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-xs text-white">DataTutor AI</h3>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                    isGeminiLive 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {isGeminiLive ? 'Gemini Flash Live' : 'Project RAG'}
                  </span>
                </div>
                <p className="text-[10px] text-indigo-200">Embedded Technical Mentor</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-indigo-200">
              <button
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                title="API Key Settings"
              >
                <Key className="w-3.5 h-3.5" />
              </button>
              {onOpenFullDrawer && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullDrawer();
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  title="Expand to Full Drawer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                title="Minimize Chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Key Configuration Drawer Accordion */}
          {showKeyConfig && (
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs space-y-2 animate-fade-in shrink-0">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-800 text-[11px]">Gemini API Key Configuration</span>
                <span className="text-[10px] text-slate-500">Stored safely in browser</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <button
                  onClick={handleVerifyAndSaveKey}
                  disabled={isVerifyingKey}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors shrink-0 disabled:opacity-50"
                >
                  {isVerifyingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                </button>
              </div>
              {keyVerificationStatus && (
                <p className={`text-[10px] ${keyVerificationStatus.valid ? 'text-emerald-700 font-medium' : 'text-rose-600'}`}>
                  {keyVerificationStatus.message}
                </p>
              )}
            </div>
          )}

          {/* Active Context Banner */}
          {contextData && (contextData.project_title || contextData.course_title || contextData.lesson_title) && (
            <div className="px-4 py-2 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-[11px] shrink-0 text-indigo-900">
              <div className="flex items-center space-x-1.5 truncate">
                <Sparkles className="w-3 h-3 text-indigo-600 shrink-0" />
                <span className="font-medium text-slate-500">Context:</span>
                <span className="font-semibold truncate">
                  {contextData.project_title || contextData.lesson_title || contextData.course_title}
                </span>
              </div>
              {contextData.dataset && (
                <span className="font-mono text-[10px] text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200 shrink-0">
                  {contextData.dataset}
                </span>
              )}
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-subtle text-xs ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    renderMessageContent(msg.text, msg.id)
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-1 px-1">
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  {msg.model && (
                    <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                      {msg.model}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs p-2 bg-white rounded-xl border border-slate-200 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>DataTutor is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto shrink-0 no-scrollbar">
            {getSuggestedPrompts().map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[11px] rounded-full whitespace-nowrap transition-colors shrink-0 border border-slate-200/70"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask DataTutor about code, datasets, or theory..."
                disabled={isLoading}
                className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
