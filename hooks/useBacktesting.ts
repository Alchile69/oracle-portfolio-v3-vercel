import { useState, useEffect, useCallback } from 'react';

// Types pour le backtesting
export interface BacktestingParams {
  country?: string;
  start_date?: string;
  end_date?: string;
}

export interface BacktestingMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  calmarRatio?: number;
  sortinoRatio?: number;
}

export interface PerformanceData {
  date: string;
  oracle: number;
  benchmark: number;
  outperformance: number;
}

export interface BacktestingData {
  success: boolean;
  period: string;
  strategy: string;
  benchmark: string;
  country: string;
  metrics: {
    oracle: BacktestingMetrics;
    benchmark: BacktestingMetrics;
    outperformance: BacktestingMetrics;
  };
  performance: PerformanceData[];
  allocations_history?: Array<{
    date: string;
    regime: string;
    allocations: {
      stocks: number;
      bonds: number;
      commodities: number;
      cash: number;
    };
  }>;
  data_source: string;
  timestamp: string;
}

export interface BacktestingHealth {
  success: boolean;
  status: string;
  version: string;
  endpoints_status: {
    getBacktesting: string;
    apis_connectivity: string;
  };
  timestamp: string;
}

export const useBacktesting = (params: BacktestingParams = {}) => {
  const [data, setData] = useState<BacktestingData | null>(null);
  const [health, setHealth] = useState<BacktestingHealth | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastParams, setLastParams] = useState<BacktestingParams>({});

  // URLs des APIs backtesting
  const BACKTESTING_API_URL = 'https://getbacktesting-yrvjzoj3aa-uc.a.run.app';
  const BACKTESTING_HEALTH_URL = 'https://getbacktestinghealth-yrvjzoj3aa-uc.a.run.app';

  // Fonction pour construire l'URL avec les paramètres
  const buildApiUrl = useCallback((baseUrl: string, params: BacktestingParams ) => {
    const url = new URL(baseUrl);
    
    // Paramètres par défaut
    const defaultParams = {
      country: 'FRA',
      start_date: '2020-01-01',
      end_date: '2024-12-31'
    };

    // Fusion des paramètres par défaut avec les paramètres fournis
    const finalParams = { ...defaultParams, ...params };

    // Ajout des paramètres à l'URL
    Object.entries(finalParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });

    return url.toString();
  }, []);

  // Fonction pour récupérer les données de backtesting
  const fetchBacktesting = useCallback(async (fetchParams: BacktestingParams = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const finalParams = { ...params, ...fetchParams };
      const apiUrl = buildApiUrl(BACKTESTING_API_URL, finalParams);
      
      console.log('Fetching backtesting data from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      
      if (!jsonData.success) {
        throw new Error(jsonData.error || 'Backtesting API returned error');
      }

      setData(jsonData);
      setLastParams(finalParams);
      console.log('Backtesting data loaded successfully:', jsonData);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('Error fetching backtesting data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params, buildApiUrl, BACKTESTING_API_URL]);

  // Fonction pour vérifier la santé de l'API
  const fetchHealth = useCallback(async () => {
    try {
      console.log('Checking backtesting API health...');
      
      const response = await fetch(BACKTESTING_HEALTH_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Health check failed! status: ${response.status}`);
      }

      const healthData = await response.json();
      setHealth(healthData);
      console.log('Backtesting API health:', healthData);

    } catch (err) {
      console.error('Error checking backtesting API health:', err);
      setHealth({
        success: false,
        status: 'unhealthy',
        version: 'unknown',
        endpoints_status: {
          getBacktesting: 'error',
          apis_connectivity: 'error'
        },
        timestamp: new Date().toISOString()
      });
    }
  }, [BACKTESTING_HEALTH_URL]);

  // Fonction pour refetch avec les mêmes paramètres
  const refetch = useCallback(() => {
    return fetchBacktesting(lastParams);
  }, [fetchBacktesting, lastParams]);

  // Fonction pour mettre à jour les paramètres et refetch
  const updateParams = useCallback((newParams: BacktestingParams) => {
    return fetchBacktesting(newParams);
  }, [fetchBacktesting]);

  // Effet pour charger les données initiales
  useEffect(() => {
    fetchBacktesting();
    fetchHealth();
  }, []); // Charge une seule fois au montage

  // Effet pour recharger quand les paramètres changent
  useEffect(() => {
    if (Object.keys(params).length > 0) {
      fetchBacktesting(params);
    }
  }, [params, fetchBacktesting]);

  // Fonctions utilitaires pour extraire des métriques spécifiques
  const getOracleMetrics = useCallback(() => {
    return data?.metrics?.oracle || null;
  }, [data]);

  const getBenchmarkMetrics = useCallback(() => {
    return data?.metrics?.benchmark || null;
  }, [data]);

  const getOutperformanceMetrics = useCallback(() => {
    return data?.metrics?.outperformance || null;
  }, [data]);

  const getPerformanceData = useCallback(() => {
    return data?.performance || [];
  }, [data]);

  const getAllocationsHistory = useCallback(() => {
    return data?.allocations_history || [];
  }, [data]);

  // Fonction pour formater les métriques pour l'affichage
  const formatMetric = useCallback((value: number | undefined, type: 'percentage' | 'ratio' | 'number' = 'number', decimals: number = 2) => {
    if (value === undefined || value === null) return 'N/A';
    
    switch (type) {
      case 'percentage':
        return `${(value * 100).toFixed(decimals)}%`;
      case 'ratio':
        return value.toFixed(decimals);
      case 'number':
      default:
        return value.toFixed(decimals);
    }
  }, []);

  return {
    // Données
    data,
    health,
    isLoading,
    error,
    lastParams,

    // Actions
    refetch,
    updateParams,
    fetchHealth,

    // Utilitaires d'extraction
    getOracleMetrics,
    getBenchmarkMetrics,
    getOutperformanceMetrics,
    getPerformanceData,
    getAllocationsHistory,
    formatMetric,

    // États dérivés
    isHealthy: health?.success && health?.status === 'healthy',
    hasData: !!data && data.success,
    isEmpty: !isLoading && !data,
    hasError: !!error
  };
};
