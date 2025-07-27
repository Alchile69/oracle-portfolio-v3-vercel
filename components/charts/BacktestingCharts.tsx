import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { BacktestingData, PerformanceData, BacktestingMetrics } from '../../hooks/useBacktesting';

interface BacktestingChartsProps {
  data: BacktestingData;
  height?: number;
  showLegend?: boolean;
  theme?: 'light' | 'dark';
}

const BacktestingCharts: React.FC<BacktestingChartsProps> = ({
  data,
  height = 400,
  showLegend = true,
  theme = 'dark'
}) => {
  // Configuration des couleurs selon le thème
  const colors = useMemo(() => ({
    oracle: theme === 'dark' ? '#10B981' : '#059669', // Vert
    benchmark: theme === 'dark' ? '#6B7280' : '#4B5563', // Gris
    outperformance: theme === 'dark' ? '#3B82F6' : '#2563EB', // Bleu
    positive: '#10B981',
    negative: '#EF4444',
    grid: theme === 'dark' ? '#374151' : '#E5E7EB',
    text: theme === 'dark' ? '#F3F4F6' : '#1F2937',
    background: theme === 'dark' ? '#1F2937' : '#FFFFFF'
  }), [theme]);

  // Formatage des données de performance pour les graphiques
  const performanceData = useMemo(() => {
    if (!data.performance || data.performance.length === 0) return [];
    
    return data.performance.map((item: PerformanceData) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('fr-FR', { 
        month: 'short', 
        year: '2-digit' 
      }),
      oraclePercent: ((item.oracle - 100) * 100) / 100,
      benchmarkPercent: ((item.benchmark - 100) * 100) / 100,
      outperformancePercent: item.outperformance
    }));
  }, [data.performance]);

  // Données pour le graphique des métriques
  const metricsData = useMemo(() => {
    if (!data.metrics) return [];
    
    return [
      {
        metric: 'Rendement Total',
        oracle: data.metrics.oracle.totalReturn * 100,
        benchmark: data.metrics.benchmark.totalReturn * 100
      },
      {
        metric: 'Rendement Annualisé',
        oracle: data.metrics.oracle.annualizedReturn * 100,
        benchmark: data.metrics.benchmark.annualizedReturn * 100
      },
      {
        metric: 'Volatilité',
        oracle: data.metrics.oracle.volatility * 100,
        benchmark: data.metrics.benchmark.volatility * 100
      },
      {
        metric: 'Ratio de Sharpe',
        oracle: data.metrics.oracle.sharpeRatio,
        benchmark: data.metrics.benchmark.sharpeRatio
      },
      {
        metric: 'Drawdown Max',
        oracle: Math.abs(data.metrics.oracle.maxDrawdown * 100),
        benchmark: Math.abs(data.metrics.benchmark.maxDrawdown * 100)
      }
    ];
  }, [data.metrics]);

  // Données pour le graphique en secteurs des allocations (si disponible)
  const allocationData = useMemo(() => {
    if (!data.allocations_history || data.allocations_history.length === 0) return [];
    
    const latestAllocation = data.allocations_history[data.allocations_history.length - 1];
    if (!latestAllocation) return [];
    
    return [
      { name: 'Actions', value: latestAllocation.allocations.stocks, color: colors.oracle },
      { name: 'Obligations', value: latestAllocation.allocations.bonds, color: colors.benchmark },
      { name: 'Matières Premières', value: latestAllocation.allocations.commodities, color: colors.outperformance },
      { name: 'Liquidités', value: latestAllocation.allocations.cash, color: colors.text }
    ];
  }, [data.allocations_history, colors]);

  // Formatage personnalisé pour les tooltips
  const formatTooltip = (value: any, name: string) => {
    if (name.includes('Percent') || name.includes('outperformance')) {
      return [`${value.toFixed(2)}%`, name.replace('Percent', '').replace('outperformance', 'Surperformance')];
    }
    if (name === 'oracle') return [`${value.toFixed(2)}%`, 'Oracle Portfolio'];
    if (name === 'benchmark') return [`${value.toFixed(2)}%`, 'Benchmark 60/40'];
    return [value.toFixed(2), name];
  };

  const formatXAxisLabel = (tickItem: string) => tickItem;

  const formatYAxisLabel = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Graphique de Performance Cumulative */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Cumulative</h3>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis 
              dataKey="date" 
              stroke={colors.text}
              fontSize={12}
              tickFormatter={formatXAxisLabel}
            />
            <YAxis 
              stroke={colors.text}
              fontSize={12}
              tickFormatter={formatYAxisLabel}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelStyle={{ color: colors.text }}
              contentStyle={{ 
                backgroundColor: colors.background, 
                border: `1px solid ${colors.grid}`,
                borderRadius: '6px'
              }}
            />
            {showLegend && (
              <Legend 
                wrapperStyle={{ color: colors.text }}
              />
            )}
            <Area
              type="monotone"
              dataKey="oraclePercent"
              stackId="1"
              stroke={colors.oracle}
              fill={colors.oracle}
              fillOpacity={0.3}
              name="Oracle Portfolio"
            />
            <Area
              type="monotone"
              dataKey="benchmarkPercent"
              stackId="2"
              stroke={colors.benchmark}
              fill={colors.benchmark}
              fillOpacity={0.3}
              name="Benchmark 60/40"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique de Surperformance */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Surperformance vs Benchmark</h3>
        <ResponsiveContainer width="100%" height={height * 0.7}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis 
              dataKey="date" 
              stroke={colors.text}
              fontSize={12}
            />
            <YAxis 
              stroke={colors.text}
              fontSize={12}
              tickFormatter={formatYAxisLabel}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelStyle={{ color: colors.text }}
              contentStyle={{ 
                backgroundColor: colors.background, 
                border: `1px solid ${colors.grid}`,
                borderRadius: '6px'
              }}
            />
            <Line
              type="monotone"
              dataKey="outperformancePercent"
              stroke={colors.outperformance}
              strokeWidth={2}
              dot={false}
              name="Surperformance"
            />
            {/* Ligne de référence à 0% */}
            <Line
              type="monotone"
              dataKey={() => 0}
              stroke={colors.grid}
              strokeDasharray="2 2"
              dot={false}
              name="Référence"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique de Comparaison des Métriques */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Comparaison des Métriques</h3>
        <ResponsiveContainer width="100%" height={height * 0.8}>
          <BarChart data={metricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
            <XAxis 
              dataKey="metric" 
              stroke={colors.text}
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke={colors.text}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toFixed(2)}${name.includes('Ratio') ? '' : '%'}`,
                name === 'oracle' ? 'Oracle Portfolio' : 'Benchmark 60/40'
              ]}
              labelStyle={{ color: colors.text }}
              contentStyle={{ 
                backgroundColor: colors.background, 
                border: `1px solid ${colors.grid}`,
                borderRadius: '6px'
              }}
            />
            {showLegend && (
              <Legend 
                wrapperStyle={{ color: colors.text }}
              />
            )}
            <Bar 
              dataKey="oracle" 
              fill={colors.oracle} 
              name="Oracle Portfolio"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="benchmark" 
              fill={colors.benchmark} 
              name="Benchmark 60/40"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique des Allocations (si disponible) */}
      {allocationData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Allocation Actuelle du Portefeuille</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Allocation']}
                labelStyle={{ color: colors.text }}
                contentStyle={{ 
                  backgroundColor: colors.background, 
                  border: `1px solid ${colors.grid}`,
                  borderRadius: '6px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default BacktestingCharts;
