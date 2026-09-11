import React, { useState } from 'react';
import { CustomCollection } from '../types';
import { X, Plus, Trash2, Bookmark, Check } from 'lucide-react';

interface CustomCollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: CustomCollection[];
  activeCollectionId: string | null;
  onSelectCollection: (id: string) => void;
  onCreateCollection: (name: string, description?: string, color?: string) => Promise<any>;
  onDeleteCollection: (id: string) => Promise<void>;
}

const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#64748b', '#d97706'
];

export const CustomCollectionsModal: React.FC<CustomCollectionsModalProps> = ({
  isOpen,
  onClose,
  collections,
  activeCollectionId,
  onSelectCollection,
  onCreateCollection,
  onDeleteCollection
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const newColl = await onCreateCollection(name, description, color);
      setName('');
      setDescription('');
      onSelectCollection(newColl.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Custom Collections</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Create New Collection Form */}
          <form onSubmit={handleCreate} className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-400" />
              Create New Checklist
            </h3>

            <div>
              <input
                type="text"
                placeholder="Collection Name (e.g. Lucky Trade Wishlist)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Accent Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                      color === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create Collection'}
            </button>
          </form>

          {/* Existing Collections List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Your Collections ({collections.length})
            </h3>

            {collections.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No custom collections yet.</p>
            ) : (
              <div className="space-y-2">
                {collections.map((c) => {
                  const isActive = activeCollectionId === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-slate-800 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                          : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/60'
                      }`}
                    >
                      <div
                        onClick={() => {
                          onSelectCollection(c.id);
                          onClose();
                        }}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: c.color || '#3b82f6' }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{c.name}</h4>
                          {c.description && (
                            <p className="text-xs text-slate-400 truncate">{c.description}</p>
                          )}
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {c.caughtItems} / {c.totalItems} caught
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${c.name}" collection?`)) {
                              onDeleteCollection(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                          title="Delete Collection"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
