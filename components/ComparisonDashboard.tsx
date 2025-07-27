import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface CountryData {
  code: string;
  name: string;
  regime: string;
  confidence: number;
  allocations: {
    stocks: number;
    bonds: number;
    commodities: number;
    cash: number;
  };
  indicators: {
    growth: number;
    inflation: number;
    unemployment: number;
  };
  last_update: string;
}

interface ComparisonData {
  countries: CountryData[];
  comparison_metrics: {
    [countryCode: string]: {
      total_return: number;
      volatility: number;
      sharpe_ratio: number;
      max_drawdown: number;
    };
  };
  correlation_matrix: {
    [countryCode: string]: {
      [countryCode: string]: number;
    };
  };
}

interface ComparisonDashboardProps {
  onNavigateToMain?: () => void;
}

const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ onNavigateToMain }) => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['FRA', 'USA', 'DEU']);
  const [countriesData, setCountriesData] = useState<CountryData[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch countries data
  const fetchCountriesData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://us-central1-oracle-portfolio-prod.cloudfunctions.net/getCountries');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.countries)) {
        setCountriesData(data.countries);
      } else {
        throw new Error('Invalid countries data structure');
      }
    } catch (error) {
      console.error('Error fetching countries data:', error);
      setError('Failed to load countries data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch comparison data
  const fetchComparisonData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://us-central1-oracle-portfolio-prod.cloudfunctions.net/getMultiRegime?countries=${selectedCountries.join(',')}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setComparisonData(data);
      } else {
        throw new Error('Invalid comparison data structure');
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      setError('Failed to load comparison data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountriesData();
  }, []);

  useEffect(() => {
    if (selectedCountries.length > 0) {
      fetchComparisonData();
    }
  }, [selectedCountries]);

  const handleCountryToggle = (countryCode: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryCode)
        ? prev.filter(c => c !== countryCode)
        : [...prev, countryCode]
    );
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  const formatNumber = (value: number): string => {
    return value.toFixed(2);
  };

  const getRegimeColor = (regime: string): string => {
    switch (regime?.toUpperCase()) {
      case 'EXPANSION': return '#10B981';
      case 'STABLE': return '#3B82F6';
      case 'CONTRACTION': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Prepare data for charts
  const prepareRegimeComparisonData = () => {
    if (!comparisonData?.countries) return [];
    
    return comparisonData.countries
      .filter(country => selectedCountries.includes(country.code))
      .map(country => ({
        name: country.name,
        regime: country.regime,
        confidence: country.confidence * 100,
        growth: country.indicators.growth * 100,
        inflation: country.indicators.inflation * 100,
        unemployment: country.indicators.unemployment * 100,
        stocks: country.allocations.stocks,
        bonds: country.allocations.bonds,
        commodities: country.allocations.commodities,
        cash: country.allocations.cash,
      }));
  };

  const preparePerformanceComparisonData = () => {
    if (!comparisonData?.comparison_metrics) return [];
    
    return selectedCountries.map(countryCode => {
      const metrics = comparisonData.comparison_metrics[countryCode];
      const country = countriesData.find(c => c.code === countryCode);
      
      return {
        name: country?.name || countryCode,
        totalReturn: metrics?.total_return || 0,
        volatility: metrics?.volatility || 0,
        sharpeRatio: metrics?.sharpe_ratio || 0,
        maxDrawdown: metrics?.max_drawdown || 0,
      };
    });
  };

  const chartData = prepareRegimeComparisonData();
  const performanceData = preparePerformanceComparisonData();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-teal-400">🔮 Oracle Portfolio - Vue Comparative</h1>
                <div className="text-xs text-gray-500">Comparaison Multi-Pays</div>
              </div>
            </div>
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <button 
                  onClick={onNavigateToMain}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  📊 Dashboard Principal
                </button>
                <a href="#" className="text-teal-400 px-3 py-2 rounded-md text-sm font-medium">
                  🔍 Vue Comparative
                </a>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Vue Comparative Multi-Pays</h1>
            <p className="text-gray-400">Analyse comparative des régimes économiques et performances par pays</p>
          </div>

          {/* Country Selection */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Sélection des Pays</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {countriesData.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountryToggle(country.code)}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedCountries.includes(country.code)
                      ? 'bg-teal-600 border-teal-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-sm font-medium">{country.name}</div>
                  <div className="text-xs opacity-75">{country.code}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-8">
              <div className="text-red-400 text-lg font-medium mb-2">⚠️ Erreur</div>
              <div className="text-gray-300">{error}</div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-400">Chargement des données de comparaison...</div>
            </div>
          ) : (
            <>
              {/* Régime Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Régimes Économiques</h3>
                  <div className="space-y-4">
                    {chartData.map((country) => (
                      <div key={country.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div>
                          <div className="font-medium text-white">{country.name}</div>
                          <div className="text-sm text-gray-400">
                            Confiance: {formatPercentage(country.confidence)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div 
                            className="text-lg font-bold"
                            style={{ color: getRegimeColor(country.regime) }}
                          >
                            {country.regime}
                          </div>
                          <div className="text-xs text-gray-400">
                            {country.regime}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Indicateurs Économiques</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#374151', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="growth" fill="#10B981" name="Croissance (%)" />
                      <Bar dataKey="inflation" fill="#F59E0B" name="Inflation (%)" />
                      <Bar dataKey="unemployment" fill="#EF4444" name="Chômage (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Comparison */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Comparaison des Performances</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#374151', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="totalReturn" fill="#2DD4BF" name="Rendement Total (%)" />
                    <Bar dataKey="volatility" fill="#3B82F6" name="Volatilité (%)" />
                    <Bar dataKey="sharpeRatio" fill="#A78BFA" name="Sharpe Ratio" />
                    <Bar dataKey="maxDrawdown" fill="#EF4444" name="Max Drawdown (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Allocations Comparison */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Comparaison des Allocations</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#374151', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="stocks" fill="#2DD4BF" name="Actions (%)" />
                    <Bar dataKey="bonds" fill="#3B82F6" name="Obligations (%)" />
                    <Bar dataKey="commodities" fill="#F59E0B" name="Commodités (%)" />
                    <Bar dataKey="cash" fill="#A78BFA" name="Cash (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Table */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Résumé Comparatif</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Pays
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Régime
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Confiance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Croissance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Inflation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Chômage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {chartData.map((country) => (
                        <tr key={country.name}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                            {country.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: getRegimeColor(country.regime) + '20',
                                color: getRegimeColor(country.regime)
                              }}
                            >
                              {country.regime}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatPercentage(country.confidence)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatPercentage(country.growth)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatPercentage(country.inflation)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatPercentage(country.unemployment)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ComparisonDashboard; 