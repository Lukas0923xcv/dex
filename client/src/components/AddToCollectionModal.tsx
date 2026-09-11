import React from 'react';
import { Pokemon, CustomCollection } from '../types';
import { storage } from '../services/storage';
import { X, Bookmark, Check } from 'lucide-react';
import { formatDexNumber } from '../utils/typeColors';

interface AddToCollectionModalProps {
  isOpen: boolean;
  pokemon: Pokemon | null;
  collections: CustomCollection[];
  onClose: () => void;
  onToggleItem: (collectionId: string, pokemonId: string) => void;
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
  if (!isOpen || !pokemon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={pokemon.spriteUrl}
              alt={pokemon.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 object-contain"
            />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {pokemon.name}
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {formatDexNumber(pokemon.dexNr)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collections checklist */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Select Checklists:
          </p>

          {collections.length === 0 ? (
            <div className="text-center py-4 text-slate-400 text-sm">
              No custom collections found.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {collections.map((coll) => {
                const itemIds = storage.getCollectionItemIds(coll.id);
                const isInColl = itemIds.has(pokemon.id);

                return (
                  <div
                    key={coll.id}
                    onClick={() => onToggleItem(coll.id, pokemon.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                      isInColl
                        ? 'bg-blue-950/40 border-blue-500/60 text-white'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 text-slate-300'
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
                          : 'border-slate-600 bg-slate-800 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={() => {
                onClose();
                onOpenCreateCollection();
              }}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Manage Collections
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
