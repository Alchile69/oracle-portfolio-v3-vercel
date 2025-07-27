import { useState, useEffect } from 'react';
import axios from 'axios';
import { SectorAllocation } from '@oracle-portfolio/shared';

interface AllocationData {
  id: string;
  regime: string;
  allocations: SectorAllocation[];
  totalAllocation: number;
  riskScore: number;
  expectedReturn: number;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
}

interface UseAllocationDataReturn {
  data: AllocationData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useAllocationData = (
  regime?: string
): UseAllocationDataReturn => {
  const [data, setData] = useState<AllocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!regime) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(`/api/v1/allocations/${regime}`);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [regime]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}; 