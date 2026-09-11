import React, { useState } from 'react';
import { useDex } from './hooks/useDex';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { FilterBar } from './components/FilterBar';
import { PokemonGrid } from './components/PokemonGrid';
import { CustomCollectionsModal } from './components/CustomCollectionsModal';
import { CollectionEditorModal } from './components/CollectionEditorModal';
import { AddToCollectionModal } from './components/AddToCollectionModal';
import { SettingsModal } from './components/SettingsModal';
import { Pokemon, CustomCollection } from './types';

export const App: React.FC = () => {
  const {
    pokemonList,
    filteredPokemon,
    collections,
    mode,
    filters,
    loading,
    storageStatus,
    currentViewStats,
    setMode,
    setFilters,
    toggleCaught,
    toggleShiny,
    createCollection,
    deleteCollection,
    toggleCollectionItem,
    setCollectionItems,
    exportBackup,
    importBackup,
    resetAllProgress
  } = useDex();

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCollectionsModalOpen, setIsCollectionsModalOpen] = useState(false);
  const [targetCollectionForEdit, setTargetCollectionForEdit] = useState<CustomCollection | null>(null);
  const [targetPokemonForAdd, setTargetPokemonForAdd] = useState<Pokemon | null>(null);

  const activeCollection = collections.find(c => c.id === filters.activeCollectionId);

  const getProgressLabel = () => {
    if (mode === 'standard') {
      return filters.generation !== 'all' ? `Gen ${filters.generation} Completion` : 'Standard Dex Completion';
    }
    if (mode === 'shiny') {
      return filters.generation !== 'all' ? `Gen ${filters.generation} Shiny Checklist` : 'Shiny Dex Completion';
    }
    if (mode === 'mega') return 'Mega & Primal Dex';
    if (mode === 'form') return 'Regional & Alternate Forms Dex';
    if (mode === 'costume') return 'Event Costumes Dex';
    if (mode === 'custom') return activeCollection ? `${activeCollection.name} Progress` : 'Custom Checklist Progress';
    return 'Dex Progress';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-rose-500 to-rose-600 p-0.5 animate-spin shadow-xl">
          <div className="w-full h-1/2 bg-rose-500 rounded-t-full" />
          <div className="w-full h-1/2 bg-white rounded-b-full" />
        </div>
        <p className="mt-4 text-sm font-semibold tracking-wide text-slate-400">Loading Pokémon GO Dex...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header
        mode={mode}
        onSelectMode={(newMode) => {
          setMode(newMode);
          setFilters(f => ({ ...f, generation: 'all', search: '', status: 'all' }));
        }}
        collections={collections}
        activeCollectionId={filters.activeCollectionId}
        onSelectCollection={(id) => setFilters(f => ({ ...f, activeCollectionId: id }))}
        onOpenCollectionsModal={() => setIsCollectionsModalOpen(true)}
        onOpenCollectionEditor={() => setTargetCollectionForEdit(activeCollection || collections[0] || null)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        isBackendConnected={storageStatus.isBackendConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Progress Bar Header */}
        <ProgressBar
          caught={currentViewStats.caught}
          total={currentViewStats.total}
          percentage={currentViewStats.percentage}
          label={getProgressLabel()}
        />

        {/* Filter and Search Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={(partial) => setFilters(f => ({ ...f, ...partial }))}
          onClearFilters={() => setFilters(f => ({
            ...f,
            search: '',
            generation: 'all',
            type: 'all',
            status: 'all'
          }))}
        />

        {/* Pokémon Grid */}
        <PokemonGrid
          pokemonList={filteredPokemon}
          mode={mode}
          onToggleCaught={toggleCaught}
          onToggleShiny={toggleShiny}
          onOpenAddModal={(p) => setTargetPokemonForAdd(p)}
          onResetFilters={() => setFilters(f => ({
            ...f,
            search: '',
            generation: 'all',
            type: 'all',
            status: 'all'
          }))}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>
          Pokémon GO Dex Tracker · Data sourced from Pokémon GO Game Master & PokéAPI · Not affiliated with Nintendo or Niantic.
        </p>
      </footer>

      {/* Modals */}
      <CustomCollectionsModal
        isOpen={isCollectionsModalOpen}
        onClose={() => setIsCollectionsModalOpen(false)}
        collections={collections}
        activeCollectionId={filters.activeCollectionId}
        onSelectCollection={(id) => setFilters(f => ({ ...f, activeCollectionId: id }))}
        onCreateCollection={createCollection}
        onDeleteCollection={deleteCollection}
        onOpenEditor={(coll) => setTargetCollectionForEdit(coll)}
      />

      <CollectionEditorModal
        isOpen={Boolean(targetCollectionForEdit)}
        onClose={() => setTargetCollectionForEdit(null)}
        collection={targetCollectionForEdit}
        allPokemon={pokemonList}
        onSaveItems={setCollectionItems}
      />

      <AddToCollectionModal
        isOpen={Boolean(targetPokemonForAdd)}
        pokemon={targetPokemonForAdd}
        collections={collections}
        onClose={() => setTargetPokemonForAdd(null)}
        onToggleItem={(collId, pokeId) => toggleCollectionItem(collId, pokeId)}
        onOpenCreateCollection={() => {
          setTargetPokemonForAdd(null);
          setIsCollectionsModalOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        storageStatus={storageStatus}
        onExport={exportBackup}
        onImport={importBackup}
        onReset={resetAllProgress}
      />
    </div>
  );
};
export default App;
