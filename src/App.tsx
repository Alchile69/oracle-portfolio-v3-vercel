/**
 * Oracle Portfolio V3.0 - Application principale
 * @author Manus AI
 * @version 3.0.0
 * @date 2025-08-07
 */

import React, { useState } from 'react';
import { SectorData } from './types/sector.types';
import { useSectorData } from './hooks/useSectorData';
import { AllocationChart } from './components/AllocationChart';
import { SectorTable } from './components/SectorTable';
import './index.css';

// Icônes simples en Unicode
const Icons = {
  overview: '📊',
  chart: '📈',
  table: '📋',
  sectors: '🏢',
  performance: '📈',
  allocation: '💼',
  risk: '⚠️',
  trend: {
    up: '↗️',
    down: '↘️',
    stable: '➡️'
  }
};

// Composant KPI Card
const KPICard: React.FC<{
  icon: string;
  value: string;
  label: string;
  color?: string;
}> = ({ icon, value, label, color = 'blue' }) => (
  <div className="kpi-card">
    <div className="kpi-icon" style={{ backgroundColor: `var(--${color}-50)`, color: `var(--${color}-600)` }}>
      {icon}
    </div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-label">{label}</div>
  </div>
);

// Composant Secteur Card
const SectorCard: React.FC<{ sector: SectorData }> = ({ sector }) => (
  <div className="sector-card">
    <div className="sector-header">
      <div>
        <div className="sector-title">{sector.metadata.name}</div>
        <div className="sector-description">{sector.metadata.description}</div>
      </div>
      <div className={`grade grade-${sector.grade}`}>
        {sector.grade}
      </div>
    </div>
    
    <div className="sector-metrics">
      <div className="metric-row">
        <span className="metric-label">Allocation</span>
        <span className="metric-value">{sector.metrics.allocation.toFixed(1)}%</span>
      </div>
      <div className="metric-row">
        <span className="metric-label">Performance</span>
        <span className={`metric-value ${sector.metrics.performance >= 0 ? 'trend-up' : 'trend-down'}`}>
          {sector.metrics.performance >= 0 ? '+' : ''}{sector.metrics.performance.toFixed(1)}%
        </span>
      </div>
      <div className="metric-row">
        <span className="metric-label">Grade</span>
        <span className={`grade grade-${sector.grade}`}>{sector.grade}</span>
      </div>
    </div>
  </div>
);

// Composant Vue d'ensemble
const OverviewTab: React.FC<{ sectors: SectorData[] }> = ({ sectors }) => {
  // Calculs des KPI
  const totalSectors = sectors.length;
  const avgPerformance = sectors.reduce((sum, s) => sum + s.metrics.performance, 0) / sectors.length;
  const totalAllocation = sectors.reduce((sum, s) => sum + s.metrics.allocation, 0);
  const avgRisk = sectors.reduce((sum, s) => sum + s.metrics.riskScore, 0) / sectors.length;

  // Top 6 secteurs par allocation
  const topSectors = [...sectors]
    .sort((a, b) => b.metrics.allocation - a.metrics.allocation)
    .slice(0, 6);

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md-grid-cols-4 mb-8">
        <KPICard
          icon={Icons.sectors}
          value={totalSectors.toString()}
          label="Secteurs analysés"
          color="blue"
        />
        <KPICard
          icon={Icons.performance}
          value={`${avgPerformance >= 0 ? '+' : ''}${avgPerformance.toFixed(1)}%`}
          label="Performance moyenne"
          color={avgPerformance >= 0 ? 'green' : 'red'}
        />
        <KPICard
          icon={Icons.allocation}
          value={`${totalAllocation.toFixed(1)}%`}
          label="Allocation totale"
          color="purple"
        />
        <KPICard
          icon={Icons.risk}
          value={`${avgRisk.toFixed(0)}/100`}
          label="Risque moyen"
          color="orange"
        />
      </div>

      {/* Aperçu des Secteurs */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Aperçu des Secteurs</h2>
          <p className="card-description">
            Top 6 secteurs par allocation avec métriques principales
          </p>
        </div>
        
        <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3">
          {topSectors.map((sector, index) => (
            <SectorCard key={index} sector={sector} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant principal App
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'table'>('overview');
  const { sectors, loading, error } = useSectorData();

  if (loading) {
    return (
      <div className="main-content">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Chargement des données sectorielles...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="container">
          <div className="card">
            <div className="text-center">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>Oracle Portfolio V3.0</h1>
          <p className="header-subtitle">
            Secteurs • {sectors.length} secteurs analysés
          </p>
        </div>

        {/* Navigation par onglets */}
        <div className="tabs-container">
          <div className="tabs-list">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span>{Icons.overview}</span>
              Vue d'ensemble
            </button>
            <button
              className={`tab-button ${activeTab === 'chart' ? 'active' : ''}`}
              onClick={() => setActiveTab('chart')}
            >
              <span>{Icons.chart}</span>
              Graphique
            </button>
            <button
              className={`tab-button ${activeTab === 'table' ? 'active' : ''}`}
              onClick={() => setActiveTab('table')}
            >
              <span>{Icons.table}</span>
              Tableau
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'overview' && <OverviewTab sectors={sectors} />}
        
        {activeTab === 'chart' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Allocation par Secteur</h2>
              <p className="card-description">
                Répartition graphique des allocations sectorielles
              </p>
            </div>
            <AllocationChart sectors={sectors} />
          </div>
        )}
        
        {activeTab === 'table' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Analyse Détaillée</h2>
              <p className="card-description">
                Tableau complet avec toutes les métriques sectorielles
              </p>
            </div>
            <SectorTable sectors={sectors} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

