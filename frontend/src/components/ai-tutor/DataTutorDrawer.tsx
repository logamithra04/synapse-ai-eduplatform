import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Send, Sparkles, Bot, User, Code, Copy, Check, BookOpen,
  Key, CheckCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp,
  Cpu, Database, ExternalLink 
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

interface DataTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export const DataTutorDrawer: React.FC<DataTutorDrawerProps> = ({
  isOpen,
  onClose,
  contextData,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Hi! I'm **DataTutor AI**, your specialized technical mentor for the Synapse Data Science Platform.\n\nI can help you build and debug our **7 Industry Capstone Projects**, explore our **Canonical Real Datasets**, write **SQL queries against `learning_database.db`**, and master Data Science and Machine Learning concepts!\n\nAsk me anything or pick a suggested topic below.",
      timestamp: 'Just now',
      source: 'project_rag',
      model: 'synapse-project-rag',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Key & Connection State
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('synapse_gemini_key') || '');
  const [keyInput, setKeyInput] = useState<string>(() => localStorage.getItem('synapse_gemini_key') || '');
  const [isKeyConfigOpen, setIsKeyConfigOpen] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyVerificationStatus, setKeyVerificationStatus] = useState<{ valid: boolean; message: string } | null>(null);
  const [backendStatus, setBackendStatus] = useState<{ backend_has_key: boolean; primary_model: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      fetchAiStatus();
    }
  }, [messages, isOpen]);

  const fetchAiStatus = async () => {
    try {
      const status = await apiRequest<{ backend_has_key: boolean; primary_model: string }>('/ai/status');
      setBackendStatus(status);
    } catch {
      // Backend status optional
    }
  };

  const handleVerifyAndSaveKey = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setApiKey('');
      localStorage.removeItem('synapse_gemini_key');
      setKeyVerificationStatus({ valid: false, message: 'API key removed. Using Project RAG Engine.' });
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
        setApiKey(trimmed);
        localStorage.setItem('synapse_gemini_key', trimmed);
        setTimeout(() => setIsKeyConfigOpen(false), 1600);
      }
    } catch (err: any) {
      setKeyVerificationStatus({ valid: false, message: err?.message || 'Verification failed.' });
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleClearKey = () => {
    setKeyInput('');
    setApiKey('');
    localStorage.removeItem('synapse_gemini_key');
    setKeyVerificationStatus(null);
  };

  // Dynamic suggested prompts grounded in active context
  const getContextPrompts = (): string[] => {
    if (contextData?.project_title) {
      return [
        `How do I approach feature engineering for ${contextData.project_title}?`,
        `What models and hyperparameters work best with ${contextData.dataset || 'this dataset'}?`,
        `Explain how to prevent data leakage in ${contextData.project_title}`,
        `Help me debug the starter pipeline code`,
      ];
    }
    if (contextData?.language === 'sql') {
      return [
        "Show a multi-table JOIN example on learning_database.db",
        "How do window functions work in SQLite?",
        "Find top-spending customers from orders and customers",
        "Explain GROUP BY with HAVING vs WHERE",
      ];
    }
    if (contextData?.course_title) {
      return [
        `Explain the core concepts of ${contextData.course_title}`,
        "Provide a practical Python Scikit-Learn code snippet",
        "What are the most common interview questions on this topic?",
        "Explain the Bias-Variance tradeoff with an example",
      ];
    }
    return [
      "Guide me through the 7 industry capstone projects",
      "How do I handle imbalanced data in creditcard_transactions_imbalanced.csv?",
      "Show how to join customers and orders in learning_database.db",
      "Explain the Bias-Variance tradeoff with an example",
    ];
  };

  const handleSend = async (messageText: string) => {
    const textToSend = messageText.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn context
      const conversationHistory = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await apiRequest<{ response: string; source?: any; model?: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: textToSend,
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
          text: "I encountered an error connecting to the platform AI engine. Please verify the backend service is running.",
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

  // Render markdown with code block styling
  const renderFormattedContent = (content: string, msgId: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim();
        const code = lines.slice(1).join('\n');
        const blockId = `${msgId}-code-${index}`;

        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 font-mono text-xs">
            <div className="flex justify-between items-center px-3 py-1.5 bg-slate-800 text-slate-400 border-b border-slate-700 text-[11px]">
              <span>{lang || 'code'}</span>
              <button
                onClick={() => copyToClipboard(code, blockId)}
                className="hover:text-white transition-colors flex items-center space-x-1"
              >
                {copiedId === blockId ? (
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
            <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      // Format markdown headers, bold, and list items
      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-1.5 leading-relaxed text-xs sm:text-sm">
          {lines.map((line, lIdx) => {
            if (line.startsWith('### ')) {
              return <h4 key={lIdx} className="font-bold text-slate-900 mt-2 mb-1 text-sm">{line.slice(4)}</h4>;
            }
            if (line.startsWith('#### ')) {
              return <h5 key={lIdx} className="font-semibold text-slate-800 mt-1.5 text-xs uppercase tracking-wide">{line.slice(5)}</h5>;
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={lIdx} className="flex items-start space-x-1.5 ml-1">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{line.slice(2)}</span>
                </div>
              );
            }
            if (/^\d+\.\s/.test(line)) {
              return (
                <div key={lIdx} className="ml-1 text-slate-700 font-medium">
                  {line}
                </div>
              );
            }
            if (!line.trim()) {
              return <div key={lIdx} className="h-1" />;
            }
            return <p key={lIdx}>{line}</p>;
          })}
        </div>
      );
    });
  };

  const isLiveApi = Boolean(apiKey || backendStatus?.backend_has_key);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dim backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-fade-in">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-base">DataTutor AI</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border flex items-center ${
                    isLiveApi
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isLiveApi ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
                    {isLiveApi ? 'Gemini 3.8 Live API' : 'Project RAG Engine'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Synapse Data Science & Capstone Assistant</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsKeyConfigOpen(!isKeyConfigOpen)}
                className={`p-2 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ${
                  isKeyConfigOpen || apiKey
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
                title="Configure Gemini API Key"
              >
                <Key className="w-4 h-4" />
                <span className="text-[11px] hidden sm:inline">{apiKey ? 'Key Connected' : 'API Key'}</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* API Key Configuration Panel */}
          {isKeyConfigOpen && (
            <div className="p-4 bg-slate-900 text-slate-200 border-b border-slate-800 space-y-3 text-xs animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100 flex items-center">
                  <Cpu className="w-4 h-4 mr-1.5 text-indigo-400" />
                  Google Gemini API Configuration
                </span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center"
                >
                  Get Free Key <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Connect your Google Gemini API key to activate real-time generative conversational tutoring powered by <strong>Gemini 3.8 Flash</strong>. Keys are stored locally in your browser session.
              </p>

              <div className="space-y-2">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={handleVerifyAndSaveKey}
                    disabled={isVerifyingKey}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center space-x-1.5 text-xs shadow-sm"
                  >
                    {isVerifyingKey ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save & Connect Key</span>
                      </>
                    )}
                  </button>

                  {apiKey && (
                    <button
                      onClick={handleClearKey}
                      className="px-2.5 py-1.5 text-slate-400 hover:text-rose-400 text-xs transition-colors"
                    >
                      Disconnect Key
                    </button>
                  )}
                </div>

                {keyVerificationStatus && (
                  <div className={`p-2 rounded-lg text-[11px] flex items-start space-x-1.5 ${
                    keyVerificationStatus.valid
                      ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
                      : 'bg-rose-950/70 border border-rose-800 text-rose-300'
                  }`}>
                    {keyVerificationStatus.valid ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span>{keyVerificationStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Context Banner */}
          {(contextData?.project_title || contextData?.course_title || contextData?.dataset) && (
            <div className="px-4 py-2.5 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
              <div className="flex items-center space-x-1.5 truncate">
                <Database className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">
                  Active Context: <strong>{contextData.project_title || contextData.course_title}</strong>
                  {contextData.dataset && <span className="font-mono text-indigo-700 ml-1">({contextData.dataset})</span>}
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full shrink-0">
                Grounded
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 shadow-subtle ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/70 rounded-bl-none'
                  }`}
                >
                  {renderFormattedContent(msg.text, msg.id)}
                  
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/50 text-[10px] text-slate-400">
                    <span>
                      {msg.source === 'gemini_api' && (
                        <span className="text-emerald-600 font-semibold flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" /> Gemini 3.8 Flash
                        </span>
                      )}
                      {msg.source === 'project_rag' && (
                        <span className="text-indigo-600 font-medium">Synapse Project RAG</span>
                      )}
                    </span>
                    <span className={msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60 max-w-xs">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
                <span className="ml-2 font-medium text-slate-600">DataTutor is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Context-Grounded Prompts */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
            <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              {contextData?.project_title ? `Recommended for ${contextData.project_title}` : 'Suggested Prompts'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {getContextPrompts().map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="text-left text-xs bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 px-2.5 py-1 rounded-lg transition-colors font-medium shadow-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-3.5 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="flex space-x-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about project formulas, datasets, Pandas, models..."
                disabled={isLoading}
                className="flex-1 text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 transition-all text-slate-900"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
              <span>Synapse Embedded AI • Context-Grounded</span>
              <span>{isLiveApi ? 'API Connected: Active' : 'RAG Engine: Ready'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
