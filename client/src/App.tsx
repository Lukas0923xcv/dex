import React, { useState } from 'react';
import { useDex } from './hooks/useDex';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { FilterBar } from './components/FilterBar';
import { PokemonGrid } from './components/PokemonGrid';
import { CustomCollectionsModal } from './components/CustomCollectionsModal';
import { CollectionEditorModal } from './components/CollectionEditorModal';
import { DashboardCustomizerModal } from './components/DashboardCustomizerModal';
import { AddToCollectionModal } from './components/AddToCollectionModal';
import { SettingsModal } from './components/SettingsModal';
import { Pokemon, CustomCollection, DashboardTabConfig } from './types';
import { storage } from './services/storage';

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
    theme,
    toggleTheme,
    setMode,
    setFilters,
    toggleCaught,
    toggleShiny,
    toggleFeature,
    markBatchCaught,
    markRegionCaught,
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
  const [isDashboardCustomizerOpen, setIsDashboardCustomizerOpen] = useState(false);
  const [targetCollectionForEdit, setTargetCollectionForEdit] = useState<CustomCollection | null>(null);
  const [targetPokemonForAdd, setTargetPokemonForAdd] = useState<Pokemon | null>(null);
  const [dashboardTabs, setDashboardTabs] = useState<DashboardTabConfig[]>(() => storage.getDashboardTabs(collections));

  // Sync dashboard tabs when collections update
  React.useEffect(() => {
    setDashboardTabs(storage.getDashboardTabs(collections));
  }, [collections]);

  const handleSaveDashboardTabs = (newTabs: DashboardTabConfig[]) => {
    storage.saveDashboardTabs(newTabs);
    setDashboardTabs(newTabs);
  };

  const activeCollection = collections.find(c => c.id === filters.activeCollectionId);

  const handleOpenDashboardCustomizer = async () => {
    if (mode === 'custom' && activeCollection) {
      setTargetCollectionForEdit(activeCollection);
      return;
    }

    // On preset modes (standard, shiny, shadow, mega, form, costume):
    // Find or create an editable custom dashboard based on the preset!
    const presetNameMap: Record<string, string> = {
      standard: 'Mein Standard Dex',
      shiny: 'Mein Shiny Dex',
      shadow: 'Mein Crypto Dex',
      mega: 'Mein Mega Dex',
      form: 'Mein Formen Dex',
      costume: 'Mein Kostüme Dex'
    };
    const targetName = presetNameMap[mode] || 'Mein Custom Dashboard';
    const existing = collections.find(c => c.name === targetName);
    if (existing) {
      setMode('custom');
      setFilters(f => ({ ...f, activeCollectionId: existing.id }));
      setTargetCollectionForEdit(existing);
    } else {
      const initialIds = filteredPokemon.map(p => p.id);
      const newColl = await createCollection(
        targetName,
        `Persönliches Dashboard basierend auf ${targetName}`,
        mode === 'shadow' ? '#a855f7' : mode === 'costume' ? '#ec4899' : mode === 'mega' ? '#ef4444' : mode === 'shiny' ? '#f59e0b' : '#3b82f6',
        {
          categoryType: mode === 'shadow' ? 'shadow' : mode === 'costume' ? 'event' : mode === 'mega' ? 'mega' : 'normal',
          variantMode: 'multi',
          trackShiny: mode === 'shiny',
          pokemonIds: initialIds
        }
      );
      if (newColl) {
        setMode('custom');
        setFilters(f => ({ ...f, activeCollectionId: newColl.id }));
        setTargetCollectionForEdit(newColl);
      }
    }
  };

  const getProgressLabel = () => {
    if (mode === 'standard') {
      return filters.generation !== 'all'
        ? (filters.generation === 0 ? 'Unbekannt · Meltan Completion' : `Gen ${filters.generation} Completion`)
        : 'Standard Dex Completion';
    }
    if (mode === 'shiny') {
      return filters.generation !== 'all'
        ? (filters.generation === 0 ? 'Unbekannt · Meltan Shiny Checklist' : `Gen ${filters.generation} Shiny Checklist`)
        : 'Shiny Dex Completion';
    }
    if (mode === 'shadow') return 'Crypto / Shadow Dex Completion';
    if (mode === 'mega') return 'Mega & Primal Dex';
    if (mode === 'form') return 'Regional & Alternate Forms Dex';
    if (mode === 'costume') return 'Event Costumes Dex';
    if (mode === 'custom') return activeCollection ? `${activeCollection.name} Progress` : 'Custom Checklist Progress';
    return 'Dex Progress';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-700 dark:text-slate-300">
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-rose-500 to-rose-600 p-0.5 animate-spin shadow-xl">
          <div className="w-full h-1/2 bg-rose-500 rounded-t-full" />
          <div className="w-full h-1/2 bg-white rounded-b-full" />
        </div>
        <p className="mt-4 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">Loading Pokémon GO Dex...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150">
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
        onOpenCollectionEditor={handleOpenDashboardCustomizer}
        onOpenDashboardCustomizer={() => setIsDashboardCustomizerOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        isBackendConnected={storageStatus.isBackendConnected}
        theme={theme}
        onToggleTheme={toggleTheme}
        dashboardTabs={dashboardTabs}
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
          mode={mode}
          collection={activeCollection}
          onFilterChange={(partial) => setFilters(f => ({ ...f, ...partial }))}
          onClearFilters={() => setFilters(f => ({
            ...f,
            search: '',
            generation: 'all',
            type: 'all',
            status: 'all',
            shinyOnly: false,
            shadowOnly: false
          }))}
          onMarkRegionCaught={markRegionCaught}
        />

        {/* Pokémon Grid */}
        <PokemonGrid
          pokemonList={filteredPokemon}
          mode={mode}
          collection={activeCollection}
          showGenderTracking={Boolean(filters.showGenderTracking)}
          shinyOnly={Boolean(filters.shinyOnly)}
          onToggleCaught={toggleCaught}
          onToggleShiny={toggleShiny}
          onToggleFeature={toggleFeature}
          onOpenAddModal={(p) => setTargetPokemonForAdd(p)}
          onResetFilters={() => setFilters(f => ({
            ...f,
            search: '',
            generation: 'all',
            type: 'all',
            status: 'all',
            shinyOnly: false,
            shadowOnly: false
          }))}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-500">
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
        allPokemon={pokemonList}
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

      <DashboardCustomizerModal
        isOpen={isDashboardCustomizerOpen}
        onClose={() => setIsDashboardCustomizerOpen(false)}
        collections={collections}
        currentTabs={dashboardTabs}
        onSaveTabs={handleSaveDashboardTabs}
      />
    </div>
  );
};
export default App;
