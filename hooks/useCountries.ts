import { useState, useEffect, useCallback } from 'react';

export const useCountries = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://us-central1-oracle-portfolio-prod.cloudfunctions.net/getCountries');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};