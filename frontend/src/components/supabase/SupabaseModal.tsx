import React, { useState, useEffect } from 'react';
import { 
  X, Database, CheckCircle2, AlertCircle, Copy, Check, 
  ExternalLink, RefreshCw, Zap, Shield, HardDrive, Radio,
  Server, Key, Globe, Eye, EyeOff
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveStoredSupabaseConfig, 
  clearStoredSupabaseConfig, 
  testSupabaseClientDirect, 
  fetchBackendSupabaseStatus,
  updateBackendSupabaseConfig,
  fetchSupabaseSchemaSql,
  testDatabaseConnection,
  SupabaseBackendStatus 
} from '../../api/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'connection' | 'schema' | 'services'>('connection');
  
  // Form states
  const [url, setUrl] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [dbUrl, setDbUrl] = useState<string>('');
  const [dbPassword, setDbPassword] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [showDbPassword, setShowDbPassword] = useState<boolean>(false);

  // Status states
  const [backendStatus, setBackendStatus] = useState<SupabaseBackendStatus | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  // Database Direct PostgreSQL states
  const [isTestingDb, setIsTestingDb] = useState<boolean>(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string; latency_ms?: number } | null>(null);
  const [isCopiedConnStr, setIsCopiedConnStr] = useState<boolean>(false);
  
  // Schema states
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [loadingSchema, setLoadingSchema] = useState<boolean>(false);

  // Load existing credentials & status on open
  useEffect(() => {
    if (isOpen) {
      const stored = getStoredSupabaseConfig();
      setUrl(stored.url || '');
      setKey(stored.key || '');
      refreshStatus();
    }
  }, [isOpen]);

  const refreshStatus = async () => {
    try {
      const status = await fetchBackendSupabaseStatus();
      setBackendStatus(status);
      if (status.supabase_url && !url) {
        setUrl(status.supabase_url);
      }
    } catch (err) {
      console.warn('[SupabaseModal] Status fetch error:', err);
    }
  };

  const handleTestConnection = async () => {
    if (!url.trim() || !key.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter both Supabase Project URL and API Key.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testSupabaseClientDirect(url, key);
      setTestResult({
        success: res.success,
        message: res.message,
        latency: res.latencyMs
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed.'
      });
    } finally {
    setIsTesting(false);
    }
  };

  const computedDbUrl = dbUrl.trim() || (
    dbPassword.trim()
      ? `postgresql://postgres.gawaupyzdclgbhqxcedi:${encodeURIComponent(dbPassword.trim())}@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
      : 'postgresql://postgres.gawaupyzdclgbhqxcedi:[YOUR-PASSWORD]@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
  );

  const handleTestDbConnection = async () => {
    const targetUrl = dbUrl.trim() || (
      dbPassword.trim()
        ? `postgresql://postgres.gawaupyzdclgbhqxcedi:${encodeURIComponent(dbPassword.trim())}@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
        : ''
    );

    if (!targetUrl || targetUrl.includes('[YOUR-PASSWORD]')) {
      setDbTestResult({
        success: false,
        message: 'Please enter your database password before testing direct PostgreSQL connectivity.'
      });
      return;
    }

    setIsTestingDb(true);
    setDbTestResult(null);
    try {
      const res = await testDatabaseConnection(targetUrl);
      setDbTestResult({
        success: res.success,
        message: res.message || res.error || (res.success ? 'Connected successfully to PostgreSQL!' : 'Failed to connect.'),
        latency_ms: res.latency_ms
      });
    } catch (err: any) {
      setDbTestResult({
        success: false,
        message: err.message || 'Database connection test failed.'
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleCopyConnStr = () => {
    navigator.clipboard.writeText(computedDbUrl);
    setIsCopiedConnStr(true);
    setTimeout(() => setIsCopiedConnStr(false), 2000);
  };

  const handleSaveAndSync = async () => {
    if (!url.trim() || !key.trim()) {
      setTestResult({
        success: false,
        message: 'Both Supabase Project URL and API Key are required to connect.'
      });
      return;
    }

    const finalDbUrl = dbUrl.trim() || (
      dbPassword.trim()
        ? `postgresql://postgres.gawaupyzdclgbhqxcedi:${encodeURIComponent(dbPassword.trim())}@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
        : undefined
    );

    setIsSaving(true);
    try {
      // 1. Save locally for client-side queries
      saveStoredSupabaseConfig(url, key);

      // 2. Persist to backend and reload runtime config
      await updateBackendSupabaseConfig(url, key, finalDbUrl);

      await refreshStatus();
      setTestResult({
        success: true,
        message: 'Supabase credentials saved and synchronized across client and backend!'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Failed to save configuration: ${err.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToLocal = async () => {
    clearStoredSupabaseConfig();
    setUrl('');
    setKey('');
    setDbUrl('');
    setDbPassword('');
    setTestResult(null);
    setDbTestResult(null);
    try {
      await updateBackendSupabaseConfig('', '');
      await refreshStatus();
    } catch (e) {
      console.warn(e);
    }
  };

  const loadSchema = async () => {
    if (schemaSql) return;
    setLoadingSchema(true);
    try {
      const sql = await fetchSupabaseSchemaSql();
      setSchemaSql(sql);
    } catch (err) {
      console.error('[SupabaseModal] Failed to load schema:', err);
    } finally {
      setLoadingSchema(false);
    }
  };

  const handleCopySchema = () => {
    if (!schemaSql) return;
    navigator.clipboard.writeText(schemaSql);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!isOpen) return null;

  const isConnected = backendStatus?.connected || (testResult?.success && !backendStatus?.error);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#1c1c1c] via-[#24292e] to-[#121d1b] text-white flex items-center justify-between border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3ECF8E]/20 border border-[#3ECF8E]/40 flex items-center justify-center text-[#3ECF8E] shadow-sm">
              <Zap className="w-5 h-5 fill-[#3ECF8E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white tracking-tight">Supabase Cloud Database</h3>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wider ${
                  isConnected 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isConnected ? 'Connected' : 'Local Fallback'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                PostgreSQL Cloud Persistence, Realtime Synchronization & Auth Integration
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-6 gap-2">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'connection'
                ? 'border-[#3ECF8E] text-[#1c865a] bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            Connection & Credentials
          </button>
          <button
            onClick={() => {
              setActiveTab('schema');
              loadSchema();
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'schema'
                ? 'border-[#3ECF8E] text-[#1c865a] bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            SQL Schema Migration
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'services'
                ? 'border-[#3ECF8E] text-[#1c865a] bg-emerald-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-4 h-4" />
            Cloud Services & RLS
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CONNECTION */}
          {activeTab === 'connection' && (
            <div className="space-y-5">
              {/* Live Status Card */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                isConnected
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}>
                {isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">
                      {isConnected ? 'Supabase Cloud Active' : 'Operating in Local SQLite Mode'}
                    </span>
                    <button
                      onClick={refreshStatus}
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                      title="Refresh status"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {backendStatus?.message || 
                     'Connect your Supabase project to persist courses, lesson progress, certificates, and student capstone submissions directly to the cloud.'}
                  </p>
                  {backendStatus?.latency_ms && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100/80 text-emerald-800 rounded font-semibold text-[11px]">
                      <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                      Latency: {backendStatus.latency_ms}ms
                    </div>
                  )}
                </div>
              </div>

              {/* Form inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] font-mono text-slate-800 transition-all placeholder:text-slate-400"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Found in your Supabase Dashboard under <strong>Project Settings → API → Project URL</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-500" />
                    Supabase Anon / Public API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] font-mono text-slate-800 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your public anonymous key safe for client-side queries (or Service Role key for backend sync).
                  </p>
                </div>

                {/* PostgreSQL Direct Database Connection Details */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-600" />
                      PostgreSQL Direct Database Connection
                    </label>
                    <span className="text-[11px] font-semibold text-slate-500">
                      SQLAlchemy / PostgreSQL 15
                    </span>
                  </div>

                  {/* Connection parameters badge grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-400 block font-medium">Host (IPv4):</span>
                      <span className="font-mono text-slate-700 truncate block font-semibold" title="aws-0-eu-north-1.pooler.supabase.com">
                        aws-0-eu-north-1.pooler.supabase.com
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Port:</span>
                      <span className="font-mono text-slate-700 font-semibold" title="6543 (Transaction) / 5432 (Session)">6543 / 5432</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Database:</span>
                      <span className="font-mono text-slate-700 font-semibold">postgres</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">User:</span>
                      <span className="font-mono text-slate-700 truncate block font-semibold" title="postgres.gawaupyzdclgbhqxcedi">
                        postgres.gawaupyzdclgbhqxcedi
                      </span>
                    </div>
                  </div>

                  {/* Password input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Database Password
                    </label>
                    <div className="relative">
                      <input
                        type={showDbPassword ? 'text' : 'password'}
                        value={dbPassword}
                        onChange={(e) => setDbPassword(e.target.value)}
                        placeholder="Enter your Supabase database password"
                        className="w-full pl-3 pr-10 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#3ECF8E] font-mono text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDbPassword(!showDbPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        {showDbPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Special characters (like @, #, $, %) are automatically percent-encoded in the connection string.
                    </p>
                  </div>

                  {/* Generated Connection String & Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                        Generated Connection String
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyConnStr}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                        >
                          {isCopiedConnStr ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {isCopiedConnStr ? 'Copied URI!' : 'Copy URI'}
                        </button>
                        <button
                          type="button"
                          onClick={handleTestDbConnection}
                          disabled={isTestingDb || !dbPassword}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-all disabled:opacity-50 flex items-center gap-1"
                        >
                          {isTestingDb && <RefreshCw className="w-3 h-3 animate-spin" />}
                          Test DB
                        </button>
                      </div>
                    </div>
                    <div className="p-2 bg-slate-900 text-slate-200 rounded-lg text-[11px] font-mono break-all border border-slate-800">
                      {computedDbUrl.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1••••••••$3')}
                    </div>
                  </div>

                  {/* DB Test Result Banner */}
                  {dbTestResult && (
                    <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                      dbTestResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {dbTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="font-semibold">{dbTestResult.message}</p>
                        {dbTestResult.latency_ms && <p className="text-[10px] opacity-90 mt-0.5">Latency: {dbTestResult.latency_ms}ms</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Test response banner */}
              {testResult && (
                <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{testResult.message}</p>
                    {testResult.latency && (
                      <p className="text-[11px] mt-0.5 opacity-90">Latency: {testResult.latency}ms</p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetToLocal}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200"
                >
                  Reset to Local SQLite
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting || !url || !key}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Test Connection
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAndSync}
                    disabled={isSaving || !url || !key}
                    className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#1c865a] to-[#3ECF8E] hover:from-[#166c49] hover:to-[#34b27b] rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        Save & Connect Cloud
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMA MIGRATION */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  3-Step Supabase Cloud Database Provisioning:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Log in to your <strong>Supabase Dashboard</strong> and open your project.</li>
                  <li>Click on the <strong>SQL Editor</strong> tab on the left sidebar and click <strong>"New Query"</strong>.</li>
                  <li>Click the green <strong>"Copy Full Schema SQL"</strong> button below, paste it into the editor, and click <strong>"Run"</strong>.</li>
                </ol>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  PostgreSQL DDL & Seed Script (25 Tables)
                </span>
                <button
                  onClick={handleCopySchema}
                  className="px-3 py-1.5 text-xs font-bold text-[#1c865a] bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Full Schema SQL
                    </>
                  )}
                </button>
              </div>

              {loadingSchema ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  Loading PostgreSQL migration schema...
                </div>
              ) : (
                <div className="relative">
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[320px] overflow-y-auto leading-relaxed border border-slate-800">
                    {schemaSql || '-- Click "Copy Full Schema SQL" to load script.'}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SERVICES & REALTIME */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Synapse connects with multiple Supabase BaaS subsystems for an enterprise-ready learning experience:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center gap-2 mb-1.5 text-slate-900 font-bold text-xs">
                    <Database className="w-4 h-4 text-emerald-600" />
                    PostgreSQL 15+ Engine
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Tables for courses, lessons, users, capstone submissions, analytics, and JSONB diagnostic parameters.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center gap-2 mb-1.5 text-slate-900 font-bold text-xs">
                    <Radio className="w-4 h-4 text-sky-600" />
                    Realtime Subscriptions
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Live broadcast of mentor feedback notes, student code submissions, and study streak alerts over WebSockets.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center gap-2 mb-1.5 text-slate-900 font-bold text-xs">
                    <Shield className="w-4 h-4 text-purple-600" />
                    Row-Level Security (RLS)
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Granular data protection: public curriculum catalog view with role-isolated student records and grades.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center gap-2 mb-1.5 text-slate-900 font-bold text-xs">
                    <HardDrive className="w-4 h-4 text-amber-600" />
                    Cloud Storage Buckets
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Host course video transcripts, certificate PDF artifacts, and capstone project dataset CSVs.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Need a free Supabase project?</h4>
                  <p className="text-[11px] text-slate-500">Create a database in under 60 seconds with 500MB free tier storage.</p>
                </div>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  Visit Supabase <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {isConnected ? 'Sync Status: Cloud Active' : 'Sync Status: Local SQLite Mode'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
