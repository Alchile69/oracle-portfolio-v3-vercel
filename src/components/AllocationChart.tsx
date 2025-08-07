/**
 * Composant AllocationChart - Graphique circulaire interactif pour les allocations sectorielles
 * @author Manus AI
 * @version 3.0.0
 * @date 2025-08-07
 */

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SectorData, 
  SectorType, 
  SECTOR_DEFINITIONS, 
  SectorUtils 
} from '../types/sector.types';

interface AllocationChartProps {
  sectors: SectorData[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  animationDuration?: number;
  onSectorClick?: (sector: SectorData) => void;
  className?: string;
}

interface ChartDataPoint {
  name: string;
  value: number;
  color: string;
  icon: string;
  grade: string;
  performance: number;
  risk: number;
  trend: string;
  sector: SectorData;
}

const AllocationChart: React.FC<AllocationChartProps> = ({
  sectors,
  width,
  height = 400,
  showLegend = true,
  showTooltip = true,
  animationDuration = 1000,
  onSectorClick,
  className = ''
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedSector, setSelectedSector] = useState<SectorData | null>(null);

  // Transformation des données pour le graphique
  const chartData = useMemo((): ChartDataPoint[] => {
    return sectors
      .filter(sector => sector.metrics.allocation > 0)
      .map(sector => ({
        name: sector.metadata.name,
        value: sector.metrics.allocation,
        color: sector.metadata.color,
        icon: sector.metadata.icon,
        grade: sector.grade,
        performance: sector.metrics.performance,
        risk: sector.metrics.riskScore,
        trend: SectorUtils.getTrendIcon(sector.metrics.trend),
        sector
      }))
      .sort((a, b) => b.value - a.value); // Tri par allocation décroissante
  }, [sectors]);

  // Calcul des statistiques globales
  const stats = useMemo(() => {
    const totalAllocation = chartData.reduce((sum, item) => sum + item.value, 0);
    const averagePerformance = chartData.reduce((sum, item) => sum + item.performance, 0) / chartData.length;
    const averageRisk = chartData.reduce((sum, item) => sum + item.risk, 0) / chartData.length;
    const topPerformer = chartData.reduce((best, current) => 
      current.performance > best.performance ? current : best, chartData[0]);
    
    return {
      totalAllocation: totalAllocation.toFixed(1),
      averagePerformance: averagePerformance.toFixed(1),
      averageRisk: averageRisk.toFixed(1),
      topPerformer: topPerformer?.name || 'N/A',
      sectorsCount: chartData.length
    };
  }, [chartData]);

  // Gestionnaire de survol
  const handleMouseEnter = (data: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Gestionnaire de clic
  const handleClick = (data: ChartDataPoint) => {
    setSelectedSector(data.sector);
    onSectorClick?.(data.sector);
  };

  // Composant Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as ChartDataPoint;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[250px]"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{data.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {data.name}
            </h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              data.grade === 'A' ? 'bg-green-100 text-green-800' :
              data.grade === 'B' ? 'bg-blue-100 text-blue-800' :
              data.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
              data.grade === 'D' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              Grade {data.grade}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Allocation:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {SectorUtils.formatPercentage(data.value)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Performance:</span>
            <span className={`font-medium ${
              data.performance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.performance >= 0 ? '+' : ''}{SectorUtils.formatPercentage(data.performance)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Risque:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {data.risk.toFixed(0)}/100
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tendance:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {data.trend}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Composant Légende personnalisée
  const CustomLegend = () => (
    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {chartData.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
            activeIndex === index 
              ? 'bg-gray-100 dark:bg-gray-700 scale-105' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          onClick={() => handleClick(item)}
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
            {item.icon} {item.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {SectorUtils.formatPercentage(item.value, 0)}
          </span>
        </motion.div>
      ))}
    </div>
  );

  // Rendu conditionnel si pas de données
  if (!chartData.length) {
    return (
      <div className={`flex items-center justify-center h-${height} ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune allocation sectorielle
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Les données sectorielles seront affichées ici une fois disponibles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* En-tête avec statistiques */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Allocation par Secteur
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{stats.sectorsCount} secteurs</span>
            <span>Total: {stats.totalAllocation}%</span>
          </div>
        </div>
        
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Performance Moyenne
            </div>
            <div className={`text-lg font-semibold ${
              parseFloat(stats.averagePerformance) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {parseFloat(stats.averagePerformance) >= 0 ? '+' : ''}{stats.averagePerformance}%
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Risque Moyen
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.averageRisk}/100
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Meilleur Secteur
            </div>
            <div className="text-lg font-semibold text-blue-600">
              {stats.topPerformer}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Diversification
            </div>
            <div className="text-lg font-semibold text-purple-600">
              {SectorUtils.calculateDiversificationScore(
                chartData.map(item => ({ 
                  sectorId: item.sector.metadata.id, 
                  allocation: item.value 
                }))
              ).toFixed(0)}/100
            </div>
          </div>
        </div>
      </div>

      {/* Graphique principal */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height * 0.35, 120)}
              innerRadius={Math.min(height * 0.2, 60)}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={animationDuration}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={activeIndex === index ? '#374151' : 'transparent'}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  style={{
                    filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleClick(entry)}
                />
              ))}
            </Pie>
            
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
          </PieChart>
        </ResponsiveContainer>

        {/* Centre du graphique avec info principale */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalAllocation}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Alloué
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      {showLegend && <CustomLegend />}

      {/* Modal de détails du secteur sélectionné */}
      <AnimatePresence>
        {selectedSector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSector(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedSector.metadata.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedSector.metadata.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedSector.metadata.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSector(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Allocation
                    </div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {SectorUtils.formatPercentage(selectedSector.metrics.allocation)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Grade
                    </div>
                    <div className={`text-xl font-semibold`} style={{ color: SectorUtils.getGradeColor(selectedSector.grade) }}>
                      {selectedSector.grade}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Performance</span>
                    <span className={`font-medium ${
                      selectedSector.metrics.performance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedSector.metrics.performance >= 0 ? '+' : ''}
                      {SectorUtils.formatPercentage(selectedSector.metrics.performance)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Score de Risque</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedSector.metrics.riskScore.toFixed(0)}/100
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Confiance</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedSector.metrics.confidence.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Tendance</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {SectorUtils.getTrendIcon(selectedSector.metrics.trend)}
                    </span>
                  </div>
                </div>

                {selectedSector.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Recommandations
                    </h4>
                    <ul className="space-y-1">
                      {selectedSector.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllocationChart;

