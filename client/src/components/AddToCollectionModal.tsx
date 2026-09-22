import React, { useEffect, useState } from 'react';
import { Pokemon, CustomCollection } from '../types';
import { storage } from '../services/storage';
import { X, Bookmark, Check } from 'lucide-react';
import { formatDexNumber } from '../utils/typeColors';

interface AddToCollectionModalProps {
  isOpen: boolean;
  pokemon: Pokemon | null;
  collections: CustomCollection[];
  onClose: () => void;
  onToggleItem: (collectionId: string, pokemonId: string) => void | Promise<void>;
  onOpenCreateCollection: () => void;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  isOpen,
  pokemon,
  collections,
  onClose,
  onToggleItem,
  onOpenCreateCollection
}) => {
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !pokemon) return null;

  const handleToggle = async (collId: string, pokemonId: string) => {
    if (pendingToggles.has(collId)) return;
    setPendingToggles(prev => new Set(prev).add(collId));
    try {
      await onToggleItem(collId, pokemonId);
    } finally {
      setPendingToggles(prev => {
        const next = new Set(prev);
        next.delete(collId);
        return next;
      });
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={pokemon.spriteUrl}
              alt={pokemon.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 object-contain"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {pokemon.name}
              </h2>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {formatDexNumber(pokemon.dexNr)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collections checklist */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Add to collections:
          </p>

          {collections.length === 0 ? (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
              No custom lists found.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {collections.map((coll) => {
                const itemIds = storage.getCollectionItemIds(coll.id);
                const isInColl = itemIds.has(pokemon.id);
                const isPending = pendingToggles.has(coll.id);

                return (
                  <div
                    key={coll.id}
                    onClick={() => handleToggle(coll.id, pokemon.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                      isPending ? 'opacity-70 pointer-events-none' : ''
                    } ${
                      isInColl
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500/60 text-blue-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: coll.color || '#3b82f6' }}
                      />
                      <span className="text-sm font-semibold">{coll.name}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isInColl
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <button
              onClick={() => {
                onClose();
                onOpenCreateCollection();
              }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Manage lists
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
