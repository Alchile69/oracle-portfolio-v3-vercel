/**
 * Composant SectorTable - Table complète avec tri automatique pour les secteurs d'activité
 * @author Manus AI
 * @version 3.0.0
 * @date 2025-08-07
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  SectorData, 
  SectorType, 
  TrendDirection,
  SectorGrade,
  SectorUtils 
} from '../types/sector.types';

interface SectorTableProps {
  sectors: SectorData[];
  onSectorClick?: (sector: SectorData) => void;
  className?: string;
  showPagination?: boolean;
  itemsPerPage?: number;
}

type SortField = 'name' | 'allocation' | 'performance' | 'risk' | 'grade' | 'trend';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

const SectorTable: React.FC<SectorTableProps> = ({
  sectors,
  onSectorClick,
  className = '',
  showPagination = false,
  itemsPerPage = 10
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'allocation', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Tri des données
  const sortedSectors = useMemo(() => {
    const sorted = [...sectors].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
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
        case 'risk':
          aValue = a.metrics.riskScore;
          bValue = b.metrics.riskScore;
          break;
        case 'grade':
          // Conversion des grades en valeurs numériques pour le tri
          const gradeValues = { A: 5, B: 4, C: 3, D: 2, F: 1 };
          aValue = gradeValues[a.grade as keyof typeof gradeValues];
          bValue = gradeValues[b.grade as keyof typeof gradeValues];
          break;
        case 'trend':
          // Conversion des tendances en valeurs numériques
          const trendValues = { up: 3, stable: 2, down: 1 };
          aValue = trendValues[a.metrics.trend as keyof typeof trendValues];
          bValue = trendValues[b.metrics.trend as keyof typeof trendValues];
          break;
        default:
          aValue = a.metrics.allocation;
          bValue = b.metrics.allocation;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [sectors, sortConfig]);

  // Pagination
  const paginatedSectors = useMemo(() => {
    if (!showPagination) return sortedSectors;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedSectors.slice(startIndex, endIndex);
  }, [sortedSectors, currentPage, itemsPerPage, showPagination]);

  const totalPages = Math.ceil(sortedSectors.length / itemsPerPage);

  // Gestionnaire de tri
  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Composant d'en-tête de colonne avec tri
  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <div className="flex flex-col">
          <span className={`text-xs ${
            sortConfig.field === field && sortConfig.direction === 'asc' 
              ? 'text-blue-500' 
              : 'text-gray-300'
          }`}>
            ▲
          </span>
          <span className={`text-xs ${
            sortConfig.field === field && sortConfig.direction === 'desc' 
              ? 'text-blue-500' 
              : 'text-gray-300'
          }`}>
            ▼
          </span>
        </div>
      </div>
    </th>
  );

  // Composant d'indicateur de tendance
  const TrendIndicator: React.FC<{ trend: TrendDirection }> = ({ trend }) => {
    const getIcon = () => {
      switch (trend) {
        case TrendDirection.UP:
          return <span className="text-green-500">📈</span>;
        case TrendDirection.DOWN:
          return <span className="text-red-500">📉</span>;
        case TrendDirection.STABLE:
          return <span className="text-gray-500">➡️</span>;
        default:
          return <span className="text-gray-500">➡️</span>;
      }
    };

    return (
      <div className="flex items-center gap-1">
        {getIcon()}
        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
          {trend}
        </span>
      </div>
    );
  };

  // Composant de badge de grade
  const GradeBadge: React.FC<{ grade: SectorGrade }> = ({ grade }) => {
    const getGradeStyle = (grade: SectorGrade) => {
      switch (grade) {
        case SectorGrade.A:
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case SectorGrade.B:
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case SectorGrade.C:
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case SectorGrade.D:
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        case SectorGrade.F:
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeStyle(grade)}`}>
        {grade}
      </span>
    );
  };

  // Composant de barre de progression
  const ProgressBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <motion.div
        className="h-2 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );

  // Calcul des statistiques de résumé
  const summaryStats = useMemo(() => {
    const totalAllocation = sortedSectors.reduce((sum, sector) => sum + sector.metrics.allocation, 0);
    const averagePerformance = sortedSectors.reduce((sum, sector) => sum + sector.metrics.performance, 0) / sortedSectors.length;
    const averageRisk = sortedSectors.reduce((sum, sector) => sum + sector.metrics.riskScore, 0) / sortedSectors.length;
    
    return {
      totalAllocation: totalAllocation.toFixed(1),
      averagePerformance: averagePerformance.toFixed(1),
      averageRisk: averageRisk.toFixed(1),
      sectorsCount: sortedSectors.length
    };
  }, [sortedSectors]);

  if (!sectors.length) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center ${className}`}>
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucune donnée sectorielle
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Les données sectorielles seront affichées ici une fois disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${className}`}>
      {/* En-tête avec statistiques de résumé */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Analyse Sectorielle Détaillée
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {summaryStats.sectorsCount} secteurs
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {summaryStats.totalAllocation}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Allocation Totale
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              parseFloat(summaryStats.averagePerformance) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {parseFloat(summaryStats.averagePerformance) >= 0 ? '+' : ''}{summaryStats.averagePerformance}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Performance Moyenne
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {summaryStats.averageRisk}/100
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Risque Moyen
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <SortableHeader field="name">Secteur</SortableHeader>
              <SortableHeader field="allocation">Allocation</SortableHeader>
              <SortableHeader field="performance">Performance</SortableHeader>
              <SortableHeader field="risk">Risque</SortableHeader>
              <SortableHeader field="grade">Grade</SortableHeader>
              <SortableHeader field="trend">Tendance</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Confiance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedSectors.map((sector, index) => (
              <motion.tr
                key={sector.metadata.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => onSectorClick?.(sector)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{sector.metadata.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {sector.metadata.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {sector.metadata.description}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 mr-3">
                      <ProgressBar 
                        value={sector.metrics.allocation} 
                        max={100} 
                        color={sector.metadata.color} 
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white min-w-[50px]">
                      {SectorUtils.formatPercentage(sector.metrics.allocation)}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    sector.metrics.performance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {sector.metrics.performance >= 0 ? '+' : ''}
                    {SectorUtils.formatPercentage(sector.metrics.performance)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 mr-3">
                      <ProgressBar 
                        value={sector.metrics.riskScore} 
                        max={100} 
                        color={SectorUtils.getRiskColor(sector.metadata.riskLevel)} 
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white min-w-[40px]">
                      {sector.metrics.riskScore.toFixed(0)}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <GradeBadge grade={sector.grade} />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <TrendIndicator trend={sector.metrics.trend} />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 mr-3">
                      <ProgressBar 
                        value={sector.metrics.confidence} 
                        max={100} 
                        color="#3B82F6" 
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white min-w-[40px]">
                      {sector.metrics.confidence.toFixed(0)}%
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Affichage {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, sortedSectors.length)} sur {sortedSectors.length} secteurs
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Précédent
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorTable;

