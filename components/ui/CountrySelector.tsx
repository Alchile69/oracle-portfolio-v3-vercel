import React from 'react';
import { useCountries } from '../../hooks/useCountries';
import { useCountryContext } from '../../hooks/CountryContext';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import StatusIndicator from '../ui/StatusIndicator';
import { formatDateTime } from '../../utils/formatters';

const CountrySelector: React.FC = () => {
  const { data, isLoading, error, refetch } = useCountries();
  const { selectedCountry, setSelectedCountry } = useCountryContext();
  
  if (error) {
    return (
      <Card
        title="Sélection du Pays"
        onRefresh={refetch}
        isLoading={isLoading}
      >
        <div className="text-secondary-500 text-center py-4">
          Impossible de charger la liste des pays. Veuillez réessayer.
        </div>
      </Card>
    );
  }
  
  return (
    <Card
      title="Sélection du Pays"
      subtitle={data ? `Mis à jour: ${formatDateTime(data.timestamp)}` : 'Chargement...'}
      onRefresh={refetch}
      isLoading={isLoading}
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton height="h-10" />
          <Skeleton height="h-24" />
        </div>
      ) : data && (
        <>
          <div className="mb-4">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md bg-background-dark text-white"
            >
              {data.countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          
          {data.countries.find(c => c.code === selectedCountry) && (
            <div className="bg-background-dark rounded-lg p-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold">
                  Régime Économique:
                </h4>
                <div className="flex items-center">
                  <span className="mr-2">
                    {data.countries.find(c => c.code === selectedCountry)?.regime}
                  </span>
                  <StatusIndicator 
                    status={data.countries.find(c => c.code === selectedCountry)?.regime || "UNKNOWN"} 
                  />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-400">
                  Confiance: {data.countries.find(c => c.code === selectedCountry)?.confidence.toFixed(2) || "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Dernière mise à jour: {formatDateTime(data.countries.find(c => c.code === selectedCountry)?.last_update || "")}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default CountrySelector;
