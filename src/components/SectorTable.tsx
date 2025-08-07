/**
 * SectorTable - Tableau détaillé des secteurs
 * @author Manus AI
 * @version 3.0.0
 * @date 2025-08-07
 */

import React, { useState, useMemo } from 'react';
import { SectorData } from '../types/sector.types';

interface SectorTableProps {
  sectors: SectorData[];
}

type SortField = 'name' | 'allocation' | 'performance' | 'confidence' | 'riskScore' | 'grade';
type SortDirection = 'asc' | 'desc';

// Icônes simples
const Icons = {
  sortUp: '↑',
  sortDown: '↓',
  sort: '↕️'
};

export const SectorTable: React.FC<SectorTableProps> = ({ sectors }) => {
  const [sortField, setSortField] = useState<SortField>('allocation');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Fonction de tri
  const sortedSectors = useMemo(() => {
    return [...sectors].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.metadata.name;
          bValue = b.metadata.name;
          break;
        case 'allocation':
          aValue = a.metrics.allocation;
          bValue = b.metrics.allocation;
          break;
        case 'performance':
          aValue = a.metrics.performance;
          bValue = b.metrics.performance;
          break;
        case 'confidence':
          aValue = a.metrics.confidence;
          bValue = b.metrics.confidence;
          break;
        case 'riskScore':
          aValue = a.metrics.riskScore;
          bValue = b.metrics.riskScore;
          break;
        case 'grade':
          // Convertir les grades en valeurs numériques pour le tri
          const gradeValues = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 };
          aValue = gradeValues[a.grade as keyof typeof gradeValues];
          bValue = gradeValues[b.grade as keyof typeof gradeValues];
          break;
        default:
          aValue = a.metrics.allocation;
          bValue = b.metrics.allocation;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [sectors, sortField, sortDirection]);

  // Fonction pour gérer le clic sur les en-têtes
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Composant en-tête de colonne
  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      onClick={() => handleSort(field)}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative'
      }}
      className="table-header-sortable"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {children}
        <span style={{ fontSize: '10px', opacity: 0.7 }}>
          {sortField === field ? (sortDirection === 'asc' ? Icons.sortUp : Icons.sortDown) : Icons.sort}
        </span>
      </div>
    </th>
  );

  // Fonction pour formater les tendances
  const formatTrend = (trend: string) => {
    switch (trend) {
      case 'UP': return { icon: '↗️', color: '#10b981', text: 'Hausse' };
      case 'DOWN': return { icon: '↘️', color: '#ef4444', text: 'Baisse' };
      case 'STABLE': return { icon: '➡️', color: '#6b7280', text: 'Stable' };
      default: return { icon: '➡️', color: '#6b7280', text: 'Stable' };
    }
  };

  // Fonction pour formater les grades
  const formatGrade = (grade: string) => {
    const gradeStyles = {
      'A': { bg: '#dcfce7', color: '#166534' },
      'B': { bg: '#dbeafe', color: '#1e40af' },
      'C': { bg: '#fef3c7', color: '#92400e' },
      'D': { bg: '#fed7aa', color: '#ea580c' },
      'F': { bg: '#fee2e2', color: '#dc2626' }
    };
    
    const style = gradeStyles[grade as keyof typeof gradeStyles] || gradeStyles['C'];
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color,
        minWidth: '24px',
        textAlign: 'center',
        display: 'inline-block'
      }}>
        {grade}
      </span>
    );
  };

  return (
    <div className="table-container">
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <SortableHeader field="name">Secteur</SortableHeader>
              <SortableHeader field="allocation">Allocation</SortableHeader>
              <SortableHeader field="performance">Performance</SortableHeader>
              <SortableHeader field="confidence">Confiance</SortableHeader>
              <SortableHeader field="riskScore">Risque</SortableHeader>
              <SortableHeader field="grade">Grade</SortableHeader>
              <th>Tendance</th>
            </tr>
          </thead>
          <tbody>
            {sortedSectors.map((sector, index) => {
              const trend = formatTrend(sector.metrics.trend);
              
              return (
                <tr key={index}>
                  <td>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                        {sector.metadata.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {sector.metadata.description}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '600' }}>
                        {sector.metrics.allocation.toFixed(1)}%
                      </span>
                      <div style={{
                        width: '60px',
                        height: '6px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(sector.metrics.allocation * 4, 100)}%`,
                          height: '100%',
                          backgroundColor: '#3b82f6',
                          borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: '600',
                      color: sector.metrics.performance >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {sector.metrics.performance >= 0 ? '+' : ''}{sector.metrics.performance.toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{sector.metrics.confidence}/100</span>
                      <div style={{
                        width: '40px',
                        height: '4px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${sector.metrics.confidence}%`,
                          height: '100%',
                          backgroundColor: sector.metrics.confidence >= 80 ? '#10b981' : 
                                         sector.metrics.confidence >= 60 ? '#f59e0b' : '#ef4444',
                          borderRadius: '2px'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{sector.metrics.riskScore}/100</span>
                      <div style={{
                        width: '40px',
                        height: '4px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${sector.metrics.riskScore}%`,
                          height: '100%',
                          backgroundColor: sector.metrics.riskScore >= 80 ? '#ef4444' : 
                                         sector.metrics.riskScore >= 60 ? '#f59e0b' : '#10b981',
                          borderRadius: '2px'
                        }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    {formatGrade(sector.grade)}
                  </td>
                  <td>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      color: trend.color,
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      <span>{trend.icon}</span>
                      <span>{trend.text}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Résumé en bas */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <span>
          {sectors.length} secteur{sectors.length > 1 ? 's' : ''} analysé{sectors.length > 1 ? 's' : ''}
        </span>
        <span>
          Trié par {sortField === 'name' ? 'nom' : 
                   sortField === 'allocation' ? 'allocation' :
                   sortField === 'performance' ? 'performance' :
                   sortField === 'confidence' ? 'confiance' :
                   sortField === 'riskScore' ? 'risque' : 'grade'} 
          ({sortDirection === 'asc' ? 'croissant' : 'décroissant'})
        </span>
      </div>
    </div>
  );
};

