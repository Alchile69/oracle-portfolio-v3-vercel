/**
 * AllocationChart - Graphique circulaire d'allocation sectorielle
 * @author Manus AI
 * @version 3.0.0
 * @date 2025-08-07
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { SectorData } from '../types/sector.types';

interface AllocationChartProps {
  sectors: SectorData[];
}

// Couleurs pour les secteurs
const SECTOR_COLORS = [
  '#3b82f6', // Bleu
  '#10b981', // Vert
  '#f59e0b', // Jaune
  '#ef4444', // Rouge
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#ec4899', // Rose
  '#6b7280', // Gris
  '#14b8a6'  // Teal
];

// Composant Tooltip personnalisé
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e5e7eb'
      }}>
        <p style={{ fontWeight: '600', marginBottom: '4px', color: '#111827' }}>
          {data.name}
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
          {data.description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280', fontSize: '13px' }}>Allocation:</span>
            <span style={{ fontWeight: '600', color: '#111827', fontSize: '13px' }}>
              {data.value.toFixed(1)}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280', fontSize: '13px' }}>Performance:</span>
            <span style={{ 
              fontWeight: '600', 
              fontSize: '13px',
              color: data.performance >= 0 ? '#10b981' : '#ef4444'
            }}>
              {data.performance >= 0 ? '+' : ''}{data.performance.toFixed(1)}%
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280', fontSize: '13px' }}>Grade:</span>
            <span style={{ 
              fontWeight: '600', 
              fontSize: '13px',
              padding: '2px 6px',
              borderRadius: '12px',
              backgroundColor: data.grade === 'A' ? '#dcfce7' : 
                             data.grade === 'B' ? '#dbeafe' : 
                             data.grade === 'C' ? '#fef3c7' : 
                             data.grade === 'D' ? '#fed7aa' : '#fee2e2',
              color: data.grade === 'A' ? '#166534' : 
                     data.grade === 'B' ? '#1e40af' : 
                     data.grade === 'C' ? '#92400e' : 
                     data.grade === 'D' ? '#ea580c' : '#dc2626'
            }}>
              {data.grade}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Composant Légende personnalisée
const CustomLegend: React.FC<any> = ({ payload }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      justifyContent: 'center', 
      gap: '16px',
      marginTop: '20px'
    }}>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '13px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: entry.color,
            borderRadius: '2px'
          }} />
          <span style={{ color: '#374151', fontWeight: '500' }}>
            {entry.value}
          </span>
          <span style={{ color: '#6b7280' }}>
            ({entry.payload.value.toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );
};

export const AllocationChart: React.FC<AllocationChartProps> = ({ sectors }) => {
  // Préparer les données pour le graphique
  const chartData = sectors.map((sector, index) => ({
    name: sector.metadata.name,
    value: sector.metrics.allocation,
    performance: sector.metrics.performance,
    grade: sector.grade,
    description: sector.metadata.description,
    color: SECTOR_COLORS[index % SECTOR_COLORS.length]
  }));

  // Calculs pour le centre du graphique
  const totalAllocation = sectors.reduce((sum, s) => sum + s.metrics.allocation, 0);
  const avgPerformance = sectors.reduce((sum, s) => sum + s.metrics.performance, 0) / sectors.length;

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={160}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={SECTOR_COLORS[index % SECTOR_COLORS.length]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          
          {/* Texte au centre */}
          <text 
            x="50%" 
            y="45%" 
            textAnchor="middle" 
            dominantBaseline="middle"
            style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              fill: '#111827' 
            }}
          >
            {totalAllocation.toFixed(1)}%
          </text>
          <text 
            x="50%" 
            y="55%" 
            textAnchor="middle" 
            dominantBaseline="middle"
            style={{ 
              fontSize: '14px', 
              fill: '#6b7280' 
            }}
          >
            Allocation totale
          </text>
          <text 
            x="50%" 
            y="65%" 
            textAnchor="middle" 
            dominantBaseline="middle"
            style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              fill: avgPerformance >= 0 ? '#10b981' : '#ef4444'
            }}
          >
            {avgPerformance >= 0 ? '+' : ''}{avgPerformance.toFixed(1)}%
          </text>
          <text 
            x="50%" 
            y="72%" 
            textAnchor="middle" 
            dominantBaseline="middle"
            style={{ 
              fontSize: '12px', 
              fill: '#6b7280' 
            }}
          >
            Performance moy.
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

