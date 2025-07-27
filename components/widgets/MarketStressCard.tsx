import React from 'react';
import Card from '../ui/Card-fixed';
import GaugeChart from '../ui/GaugeChart-fixed';
import StatusIndicator from '../ui/StatusIndicator-fixed';
import Skeleton from '../ui/Skeleton-fixed';
import { formatDateTime } from '../../utils/formatters';
import { useMarketStress } from '../../hooks/useAPI';

const MarketStressCard: React.FC = () => {
  const { data, isLoading, error, refetch } = useMarketStress();
  
  if (error) {
    return (
      <Card
        title="Market Stress Indicators"
        onRefresh={refetch}
        isLoading={isLoading}
      >
        <div className="text-red-400 text-center py-8">
          Failed to load market stress data. Please try again.
        </div>
      </Card>
    );
  }
  
  return (
    <Card
      title="Market Stress Indicators"
      subtitle={data ? `Updated: ${formatDateTime(data.last_update)}` : 'Loading...'}
      onRefresh={refetch}
      isLoading={isLoading}
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton height="h-40" className="mb-6" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton height="h-16" />
            <Skeleton height="h-16" />
          </div>
        </div>
      ) : data && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h4 className="font-bold text-lg text-white">
                Niveau de stress: {data.stress_level}
              </h4>
              <StatusIndicator 
                status={data.stress_level} 
                className="ml-3"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <GaugeChart
                value={data.vix}
                min={0}
                max={50}
                label="VIX"
                size="md"
                colorScheme="default"
              />
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-400">Source: FRED</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <GaugeChart
                value={data.high_yield_spread}
                min={0}
                max={10}
                label="High Yield Spread"
                size="md"
                colorScheme="default"
              />
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-400">Source: FRED</p>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default MarketStressCard;