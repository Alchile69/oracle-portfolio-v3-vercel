import { useState, useEffect, useCallback } from 'react';
import {
  MarketStress,
  MarketData,
  Allocation,
} from '../types';

// 🌍 Production uniquement
const API_ROOT = 'https://us-central1-oracle-portfolio-prod.cloudfunctions.net';

// 🎯 URLs Firebase Functions
export const API_URLS = {
  marketStress: `${API_ROOT}/getMarketStress`,
  marketData: `${API_ROOT}/getMarketData`,
  allocations: `${API_ROOT}/getAllocations`,
  regime: `${API_ROOT}/getRegime`,
  countries: `${API_ROOT}/getCountries`,
};

// 🔁 Fonction générique de fetch avec retry + timeout
const fetchWithRetry = async (
  url: string,
  retries = 3,
  timeout = 5000
): Promise<any> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      if (attempt === retries - 1) throw error;
      await new Promise((res) => setTimeout(res, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error('Maximum retries reached');
};

// 🔄 Hook générique avec typage dynamique et refresh optionnel
const useFetch = <T>(url: string, intervalMs: number = 0) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchWithRetry(url);
      setData(result);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(`Fetch failed: ${message}`));
      console.error(`Error fetching ${url}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    if (intervalMs > 0) {
      const interval = setInterval(fetchData, intervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchData, intervalMs]);

  return { data, isLoading, error, refetch: fetchData };
};

//
// 🎯 HOOKS SPÉCIFIQUES
//

export const useMarketStress = () => {
  const [data, setData] = useState<{
    stress_level: string;
    vix: number;
    high_yield_spread: number;
    last_update: string;
    data_sources: {
      vix: string;
      spread: string;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchWithRetry(API_URLS.marketStress);
      
      // Adapter la structure des données pour correspondre à l'interface attendue
      setData({
        stress_level: result.stress_level,
        vix: result.vix,
        high_yield_spread: result.high_yield_spread,
        last_update: result.last_update || result.timestamp,
        data_sources: {
          vix: result.data_sources?.vix || 'FRED',
          spread: result.data_sources?.spread || 'FRED'
        }
      });
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(`Fetch failed: ${message}`));
      console.error(`Error fetching ${API_URLS.marketStress}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

// 🔧 CORRIGÉ: useMarketData pour gérer la nouvelle structure
export const useMarketData = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithRetry(API_URLS.marketData);
      
      // 🔧 CORRECTION: Adapter la structure des données
      if (response.success && response.market_data) {
        setData({
          etfs: {
            SPY: response.market_data.spy_price,
            TLT: response.market_data.tlt_price,
            GLD: response.market_data.gld_price,
            HYG: response.market_data.hyg_price,
          },
          descriptions: {
            SPY: 'SPDR S&P 500 ETF Trust',
            TLT: 'iShares 20+ Year Treasury Bond ETF',
            GLD: 'SPDR Gold Shares',
            HYG: 'iShares iBoxx $ High Yield Corporate Bond ETF',
          },
          last_update: response.timestamp,
        });
      } else {
        // Fallback data
        setData({
          etfs: {
            SPY: 418.74,
            TLT: 95.12,
            GLD: 201.45,
            HYG: 78.23,
          },
          descriptions: {
            SPY: 'SPDR S&P 500 ETF Trust',
            TLT: 'iShares 20+ Year Treasury Bond ETF',
            GLD: 'SPDR Gold Shares',
            HYG: 'iShares iBoxx $ High Yield Corporate Bond ETF',
          },
          last_update: new Date().toISOString(),
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Fallback data en cas d'erreur
      setData({
        etfs: {
          SPY: 418.74,
          TLT: 95.12,
          GLD: 201.45,
          HYG: 78.23,
        },
        descriptions: {
          SPY: 'SPDR S&P 500 ETF Trust',
          TLT: 'iShares 20+ Year Treasury Bond ETF',
          GLD: 'SPDR Gold Shares',
          HYG: 'iShares iBoxx $ High Yield Corporate Bond ETF',
        },
        last_update: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

// 🔧 CORRIGÉ: useAllocations sans market_data
export const useAllocations = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithRetry(`${API_URLS.allocations}?country=FRA`);

      if (response.success) {
        setData({
          data: { 
            regime: response.data?.regime || response.regime || 'EXPANSION' 
          },
          allocation: response.allocation || {
            actions: response.data?.allocations?.stocks || 65,
            obligations: response.data?.allocations?.bonds || 25,
            or: response.data?.allocations?.commodities || 5,
            cash: response.data?.allocations?.cash || 5,
          },
          last_update: response.timestamp || response.last_update,
        });
      } else {
        // Fallback data
        setData({
          data: { regime: 'EXPANSION' },
          allocation: { actions: 65, obligations: 25, or: 5, cash: 5 },
          last_update: new Date().toISOString(),
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Fallback data en cas d'erreur
      setData({
        data: { regime: 'EXPANSION' },
        allocation: { actions: 65, obligations: 25, or: 5, cash: 5 },
        last_update: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

export const useRegime = (country = 'FRA') =>
  useFetch<{
    success: boolean;
    country: string;
    regime: string;
    confidence: number;
    timestamp: string;
  }>(`${API_URLS.regime}?country=${country}`, 5 * 60 * 1000);

//
// 🛠️ Fonctions d'appel manuelles (optionnel)
//

export const useAPI = () => ({
  fetchMarketStress: () => fetchWithRetry(API_URLS.marketStress),
  fetchMarketData: () => fetchWithRetry(API_URLS.marketData),
  fetchAllocations: (country = 'FRA') =>
    fetchWithRetry(`${API_URLS.allocations}?country=${country}`),
});

