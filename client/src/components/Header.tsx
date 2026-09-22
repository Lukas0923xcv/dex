import React, { useState, useRef, useEffect } from 'react';
import { TrackingMode, CustomCollection, Theme, DashboardTabConfig, UserAccount } from '../types';
import { Sparkles, Zap, Layers, Bookmark, Settings, CheckCircle2, Sun, Moon, SlidersHorizontal, Flame, Plus, Trash2, User, ChevronDown, Check, Edit2, X } from 'lucide-react';

interface HeaderProps {
  mode: TrackingMode;
  onSelectMode: (mode: TrackingMode) => void;
  collections: CustomCollection[];
  activeCollectionId: string | null;
  onSelectCollection: (id: string) => void;
  onOpenCollectionsModal: () => void;
  onOpenCollectionEditor?: () => void;
  onOpenDashboardCustomizer?: () => void;
  onOpenSettingsModal: () => void;
  isBackendConnected: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  dashboardTabs?: DashboardTabConfig[];
  onDeleteCollection?: (id: string) => Promise<void> | void;
  accounts?: UserAccount[];
  activeAccountId?: string;
  onSwitchAccount?: (id: string) => void;
  onCreateAccount?: (name: string) => Promise<UserAccount>;
  onRenameAccount?: (id: string, name: string) => Promise<UserAccount>;
  onDeleteAccount?: (id: string) => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onSelectMode,
  collections,
  activeCollectionId,
  onSelectCollection,
  onOpenCollectionsModal,
  onOpenCollectionEditor,
  onOpenDashboardCustomizer,
  onOpenSettingsModal,
  isBackendConnected,
  theme,
  onToggleTheme,
  dashboardTabs = [],
  onDeleteCollection,
  accounts = [],
  activeAccountId = 'default',
  onSwitchAccount,
  onCreateAccount,
  onRenameAccount,
  onDeleteAccount
}) => {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [editingAccId, setEditingAccId] = useState<string | null>(null);
  const [editingAccName, setEditingAccName] = useState('');
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
        setIsCreatingAccount(false);
        setEditingAccId(null);
      }
    };
    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountMenuOpen]);

  const activeAccount = accounts.find(a => a.id === activeAccountId) || { id: 'default', name: 'Haupt-Account' };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim() || !onCreateAccount) return;
    await onCreateAccount(newAccName.trim());
    setNewAccName('');
    setIsCreatingAccount(false);
  };

  const handleRenameSubmit = async (id: string) => {
    if (!editingAccName.trim() || !onRenameAccount) return;
    await onRenameAccount(id, editingAccName.trim());
    setEditingAccId(null);
  };

  const modes = [
    { id: 'standard' as TrackingMode, label: 'Standard Dex', icon: CheckCircle2 },
    { id: 'shiny' as TrackingMode, label: 'Shiny Dex', icon: Sparkles, color: 'text-amber-500 dark:text-amber-400' },
    { id: 'shadow' as TrackingMode, label: 'Shadow Dex', icon: Flame, color: 'text-purple-500 dark:text-purple-400' },
    { id: 'mega' as TrackingMode, label: 'Mega Dex', icon: Zap, color: 'text-rose-500 dark:text-rose-400' },
    { id: 'form' as TrackingMode, label: 'All Forms', icon: Layers, color: 'text-indigo-500 dark:text-indigo-400' },
    { id: 'costume' as TrackingMode, label: 'Costumes', icon: Sparkles, color: 'text-pink-500 dark:text-pink-400' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 mb-6 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top bar: Brand & Actions */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {/* Pokéball Logo */}
            <div className="relative w-9 h-9 shrink-0 flex items-center justify-center drop-shadow-md">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full transform transition-transform hover:scale-105 duration-200 select-none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="headerPokeRed" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ff4d5a" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                  <linearGradient id="headerPokeWhite" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <radialGradient id="headerPokeGlint" cx="32" cy="22" r="28" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Dark Outer Outline */}
                <circle cx="50" cy="50" r="48" fill="#0f172a" />

                {/* Top Red Hemisphere */}
                <path d="M 5 50 A 45 45 0 0 1 95 50 Z" fill="url(#headerPokeRed)" />

                {/* Top Gloss Glint */}
                <ellipse cx="34" cy="24" rx="14" ry="7" fill="#ffffff" fillOpacity="0.38" transform="rotate(-25 34 24)" />

                {/* Bottom White Hemisphere */}
                <path d="M 5 50 A 45 45 0 0 0 95 50 Z" fill="url(#headerPokeWhite)" />

                {/* Center Horizontal Divider Band */}
                <rect x="5" y="46" width="90" height="8" fill="#0f172a" />

                {/* Center Button Ring Outer */}
                <circle cx="50" cy="50" r="16" fill="#0f172a" />

                {/* Center Button Middle Ring */}
                <circle cx="50" cy="50" r="11" fill="#ffffff" />

                {/* Center Button Core */}
                <circle cx="50" cy="50" r="7" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
                <circle cx="48" cy="48" r="2" fill="#ffffff" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  GO Dex Tracker
                </h1>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isBackendConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                    : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30'
                }`}>
                  {isBackendConnected ? '● SQLite Online' : '○ Offline Cache'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Progress tracker for Pokémon GO · Collections & Checklists
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Multi-Account Switcher */}
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all shadow-xs cursor-pointer"
                title="Switch or manage Pokémon GO account"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-500/15 dark:bg-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="max-w-[110px] sm:max-w-[150px] truncate">{activeAccount.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Account Dropdown Modal */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        GO Trainer Account
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Independent progress for each account
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Account List */}
                  <div className="p-1.5 space-y-1 max-h-56 overflow-y-auto">
                    {accounts.map(acc => {
                      const isActive = acc.id === activeAccountId;
                      const isEditing = editingAccId === acc.id;

                      if (isEditing) {
                        return (
                          <div key={acc.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center gap-2">
                            <input
                              type="text"
                              value={editingAccName}
                              onChange={e => setEditingAccName(e.target.value)}
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleRenameSubmit(acc.id);
                                if (e.key === 'Escape') setEditingAccId(null);
                              }}
                              className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRenameSubmit(acc.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAccId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={acc.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold border border-blue-200/80 dark:border-blue-800/60'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (onSwitchAccount) onSwitchAccount(acc.id);
                              setIsAccountMenuOpen(false);
                            }}
                            className="flex items-center gap-2.5 flex-1 text-left cursor-pointer truncate mr-2"
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                              isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {isActive ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <User className="w-3.5 h-3.5" />}
                            </div>
                            <span className="truncate">{acc.name}</span>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAccId(acc.id);
                                setEditingAccName(acc.name);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Rename account"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            {accounts.length > 1 && onDeleteAccount && (
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete account "${acc.name}" and all associated caught Pokémon?`)) {
                                    await onDeleteAccount(acc.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors"
                                title="Delete account"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Create New Account */}
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                    {isCreatingAccount ? (
                      <form onSubmit={handleCreateSubmit} className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. Second Account"
                          value={newAccName}
                          onChange={e => setNewAccName(e.target.value)}
                          autoFocus
                          className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingAccount(false);
                            setNewAccName('');
                          }}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCreatingAccount(true)}
                        className="w-full py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer border border-dashed border-blue-300 dark:border-blue-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ New Account</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenCollectionsModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              title="Create new custom list / collection"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New List</span>
            </button>

            {onOpenDashboardCustomizer && (
              <button
                type="button"
                onClick={onOpenDashboardCustomizer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 dark:border-purple-800 dark:text-purple-300 font-bold text-xs transition-all shadow-xs cursor-pointer"
                title="Dashboard anpassen: Tabs anordnen und eigene Listen anheften"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Dashboard anpassen</span>
              </button>
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
              title={theme === 'dark' ? 'Zu Standard Light Mode wechseln' : 'Zu Dark Mode wechseln'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shadow-xs cursor-pointer"
              title="Database & Backup Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tracking Category Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {(() => {
            const tabsToDisplay = (dashboardTabs && dashboardTabs.length > 0
              ? dashboardTabs
              : modes.map(m => ({ id: m.id, label: m.label, type: 'preset' as const, visible: true }))
            ).filter(t => t.visible && t.id !== 'custom');

            return tabsToDisplay.map((tab) => {
              if (tab.type === 'custom') {
                const coll = collections.find(c => c.id === tab.collectionId);
                const isActive = mode === 'custom' && activeCollectionId === tab.collectionId;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onSelectMode('custom');
                      if (tab.collectionId) {
                        onSelectCollection(tab.collectionId);
                      }
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/50'
                        : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 shadow-xs'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: coll?.color || tab.color || '#3b82f6' }}
                    />
                    <span>{coll ? coll.name : tab.label}</span>
                    {coll && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isActive
                            ? 'bg-blue-700/70 text-blue-100'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {coll.caughtItems}/{coll.totalItems}
                      </span>
                    )}
                  </button>
                );
              }

              // Preset tab
              const preset = modes.find(m => m.id === tab.id);
              const Icon = preset?.icon || CheckCircle2;
              const isActive = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectMode(tab.id as TrackingMode)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/50'
                      : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 shadow-xs'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : preset?.color || 'text-slate-400'}`} />
                  <span>{tab.label || preset?.label}</span>
                </button>
              );
            });
          })()}

          {/* Add New List Button directly on the main dashboard */}
          <button
            type="button"
            onClick={onOpenCollectionsModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:text-blue-300 border border-dashed border-blue-300 dark:border-blue-700/80 transition-all cursor-pointer whitespace-nowrap shadow-xs shrink-0"
            title="Create new custom collection / list"
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>+ New List</span>
          </button>

          {onOpenDashboardCustomizer && (
            <button
              type="button"
              onClick={onOpenDashboardCustomizer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100/70 dark:bg-slate-900/40 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700/80 transition-all cursor-pointer shrink-0 ml-auto"
              title="Customize Dashboard: arrange tabs and pin custom lists"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Customize Tabs</span>
            </button>
          )}
        </div>

        {/* Subheader when in Custom Collections mode */}
        {mode === 'custom' && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
              {collections.map((coll) => (
                <button
                  key={coll.id}
                  onClick={() => onSelectCollection(coll.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCollectionId === coll.id
                      ? 'bg-blue-50 dark:bg-slate-800 text-blue-900 dark:text-white border border-blue-400 dark:border-blue-500/60 shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: coll.color || '#3b82f6' }}
                  />
                  <span>{coll.name}</span>
                  <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-950/60 px-1.5 py-0.2 rounded">
                    {coll.caughtItems}/{coll.totalItems}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenCollectionEditor && activeCollectionId && (
                <button
                  type="button"
                  onClick={onOpenCollectionEditor}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Select which Pokémon should be included in this list"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Select Pokémon</span>
                </button>
              )}
              {onDeleteCollection && activeCollectionId && (
                <button
                  type="button"
                  onClick={() => {
                    const activeColl = collections.find(c => c.id === activeCollectionId);
                    const name = activeColl?.name ? `"${activeColl.name}"` : 'this collection';
                    if (window.confirm(`Are you sure you want to delete collection ${name}?`)) {
                      onDeleteCollection(activeCollectionId);
                    }
                  }}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Delete active collection"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span className="hidden sm:inline">Delete list</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenCollectionsModal}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                + Manage Lists
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
