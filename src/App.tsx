import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AllocationChart from './components/AllocationChart';
import SectorTable from './components/SectorTable';
import { useSectorData } from './hooks/useSectorData';
import { SectorData } from './types/sector.types';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'table'>('overview');
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);
  
  const { sectors, loading, error, refetch } = useSectorData({
    refreshInterval: 300000, // 5 minutes
    autoRefresh: true,
    fallbackData: true
  });

  const handleSectorClick = (sector: SectorData) => {
    setSelectedSector(sector);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des secteurs d'activité...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">📊</div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                Oracle Portfolio V3.0
              </h1>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Secteurs
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {sectors.length} secteurs analysés
              </span>
              <button
                onClick={refetch}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Actualiser les données"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: '📋' },
              { id: 'chart', label: 'Graphique', icon: '📊' },
              { id: 'table', label: 'Tableau', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Statistiques globales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    label: 'Secteurs analysés',
                    value: sectors.length,
                    icon: '🏢',
                    color: 'blue'
                  },
                  {
                    label: 'Performance moyenne',
                    value: `${(sectors.reduce((sum, s) => sum + s.metrics.performance, 0) / sectors.length).toFixed(1)}%`,
                    icon: '📈',
                    color: 'green'
                  },
                  {
                    label: 'Allocation totale',
                    value: `${sectors.reduce((sum, s) => sum + s.metrics.allocation, 0).toFixed(1)}%`,
                    icon: '💼',
                    color: 'purple'
                  },
                  {
                    label: 'Risque moyen',
                    value: `${(sectors.reduce((sum, s) => sum + s.metrics.riskScore, 0) / sectors.length).toFixed(0)}/100`,
                    icon: '⚠️',
                    color: 'orange'
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="card p-6"
                  >
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">{stat.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </p>
                        <p className={`text-2xl font-bold text-${stat.color}-600`}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Aperçu des secteurs */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Aperçu des Secteurs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sectors.slice(0, 6).map((sector, index) => (
                    <motion.div
                      key={sector.metadata.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="sector-card"
                      onClick={() => handleSectorClick(sector)}
                    >
                      <div className="sector-icon">{sector.metadata.icon}</div>
                      <h3 className="sector-name">{sector.metadata.name}</h3>
                      <p className="sector-description">{sector.metadata.description}</p>
                      <div className="sector-metrics">
                        <div className="metric-row">
                          <span className="metric-label">Allocation</span>
                          <span className="metric-value">{sector.metrics.allocation.toFixed(1)}%</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">Performance</span>
                          <span className={`metric-value ${
                            sector.metrics.performance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {sector.metrics.performance >= 0 ? '+' : ''}{sector.metrics.performance.toFixed(1)}%
                          </span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">Grade</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium grade-${sector.grade}`}>
                            {sector.grade}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chart' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Allocation par Secteur
              </h2>
              <AllocationChart
                sectors={sectors}
                height={500}
                showLegend={true}
                showTooltip={true}
                onSectorClick={handleSectorClick}
                className="card p-6"
              />
            </div>
          )}

          {activeTab === 'table' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Analyse Détaillée
              </h2>
              <SectorTable
                sectors={sectors}
                showPagination={true}
                itemsPerPage={10}
                onSectorClick={handleSectorClick}
              />
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Oracle Portfolio V3.0 - Secteurs d'Activité
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Évolution progressive V2.5 → V3.0 avec conservation des fonctionnalités
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500 dark:text-gray-500">En ligne</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

