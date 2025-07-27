import React, { useState, useEffect, useMemo } from 'react';
import Card from '@/components/ui/Card.tsx';
import Skeleton from '@/components/ui/Skeleton.tsx';
import { useCountryContext } from '@/hooks/CountryContext.tsx'; // CountryContext est bien .tsx
import { useBacktesting } from '@/hooks/useBacktesting.ts'; // CORRIGÉ: .ts
import BacktestingCharts from '@/components/charts/BacktestingCharts.tsx';
import { formatDateTime } from '@/utils/formatters.ts'; // CORRIGÉ: .ts (les fichiers utils sont souvent .ts)
import { RefreshCcw, Settings, AlertTriangle, CheckCircle } from 'lucide-react';

interface BacktestingCardProps {
  className?: string;
}

const BacktestingCard: React.FC<BacktestingCardProps> = ({ className }) => {
  const { selectedCountry } = useCountryContext();
  const [params, setParams] = useState({
    country: 'US', // Valeur par défaut si selectedCountry est undefined
    start_date: '2020-01-01',
    end_date: '2024-12-31',
  });

  const { data, isLoading, error, refetch, health, fetchHealth } = useBacktesting(params);

  useEffect(() => {
    setParams(prev => ({ ...prev, country: selectedCountry || 'US' })); // Assurez-vous d'avoir une valeur par défaut
  }, [selectedCountry]);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const handleRefresh = () => {
    refetch();
    fetchHealth();
  };

  const formattedMetrics = useMemo(() => {
    if (!data?.metrics) return null;
    const metrics = data.metrics.oracle;
    return [
      { label: 'Rendement Total', value: `${(metrics.totalReturn * 100).toFixed(2)}%` },
      { label: 'Rendement Annualisé', value: `${(metrics.annualizedReturn * 100).toFixed(2)}%` },
      { label: 'Volatilité', value: `${(metrics.volatility * 100).toFixed(2)}%` },
      { label: 'Ratio de Sharpe', value: metrics.sharpeRatio.toFixed(2) },
      { label: 'Drawdown Max', value: `${(metrics.maxDrawdown * 100).toFixed(2)}%` },
      { label: 'Win Rate', value: `${(metrics.winRate * 100).toFixed(2)}%` },
    ];
  }, [data]);

  return (
    <Card
      title="Backtesting Engine"
      onRefresh={handleRefresh}
      className={className}
      headerRight={
        <div className="flex items-center space-x-2">
          {health.status === 'healthy' ? (
            <span className="text-green-500 flex items-center text-sm">
              <CheckCircle size={16} className="mr-1" /> API OK
            </span>
          ) : (
            <span className="text-red-500 flex items-center text-sm">
              <AlertTriangle size={16} className="mr-1" /> API ERREUR
            </span>
          )}
          <button className="text-gray-400 hover:text-white">
            <Settings size={20} />
          </button>
        </div>
      }
    >
      {error ? (
        <div className="text-red-500 text-center py-8">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <p className="text-lg">Erreur lors du chargement du backtesting.</p>
          <p className="text-sm">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton height="h-64" className="w-full" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height="h-24" />
            ))}
          </div>
        </div>
      ) : (
        data && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {formattedMetrics?.map((metric) => (
                <div key={metric.label} className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">{metric.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                </div>
              ))}
            </div>

            <BacktestingCharts data={data} />

            <div className="mt-6 text-sm text-gray-400 flex justify-between items-center">
              <p>Période: {data.period}</p>
              <div>
                <p className="text-gray-400">Dernière mise à jour</p>
                <p className="text-white font-medium">
                  {formatDateTime(data.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </Card>
  );
};

export default BacktestingCard;
