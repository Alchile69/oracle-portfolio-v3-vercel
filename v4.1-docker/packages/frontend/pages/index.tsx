import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RegimeIndicator } from '../components/RegimeIndicator';
import { AllocationChart } from '../components/AllocationChart';
import { SectorTable } from '../components/SectorTable';
import { RegimeTimeline } from '../components/RegimeTimeline';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useRegimeData } from '../hooks/useRegimeData';
import { useAllocationData } from '../hooks/useAllocationData';

export default function DashboardPage() {
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [timeRange, setTimeRange] = useState(30);

  const { 
    data: currentRegime, 
    isLoading: regimeLoading, 
    error: regimeError 
  } = useRegimeData(selectedCountry);

  const { 
    data: allocations, 
    isLoading: allocationLoading, 
    error: allocationError 
  } = useAllocationData(currentRegime?.data?.regime);

  const { 
    data: history, 
    isLoading: historyLoading 
  } = useRegimeData(selectedCountry, timeRange);

  const isLoading = regimeLoading || allocationLoading || historyLoading;
  const hasError = regimeError || allocationError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Oracle Portfolio
              </h1>
              <p className="text-slate-600 mt-1">
                Allocation sectorielle basée sur les régimes économiques
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="US">États-Unis</option>
                <option value="EU">Europe</option>
                <option value="JP">Japon</option>
                <option value="CN">Chine</option>
              </select>
              
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7 jours</option>
                <option value={30}>30 jours</option>
                <option value={90}>90 jours</option>
                <option value={365}>1 an</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : hasError ? (
          <ErrorMessage 
            message="Erreur lors du chargement des données"
            details={regimeError?.message || allocationError?.message}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Régime actuel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <RegimeIndicator regime={currentRegime?.data} />
            </motion.div>

            {/* Allocations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AllocationChart 
                allocations={allocations?.data} 
                regime={currentRegime?.data?.regime}
              />
            </motion.div>

            {/* Tableau des secteurs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <SectorTable 
                allocations={allocations?.data}
                regime={currentRegime?.data?.regime}
              />
            </motion.div>

            {/* Timeline des régimes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <RegimeTimeline 
                days={timeRange}
                events={history?.data}
              />
            </motion.div>
          </div>
        )}

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Optimisez votre allocation
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Obtenez des recommandations personnalisées basées sur votre profil de risque 
              et vos objectifs d'investissement.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Optimiser mon portefeuille
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
} 