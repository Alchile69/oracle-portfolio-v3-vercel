import React from 'react';
import Card from '../ui/Card';
import PieChart from '../charts/PieChart';
import Skeleton from '../ui/Skeleton';
import { formatDateTime, formatPercent } from '../../utils/formatters';
import { useAllocations } from '../../hooks/useAPI';

// 🎨 Couleurs pour le graphique en secteurs
const COLORS = {
  actions: '#2DD4BF',
  obligations: '#3B82F6', 
  or: '#FFC107',
  cash: '#A78BFA'
};

// 📊 Labels en français pour l'affichage
const LABELS = {
  actions: 'Actions',
  obligations: 'Obligations',
  or: 'Or',
  cash: 'Liquidités'
};

// 📈 Composant principal AllocationsCard
const AllocationsCard: React.FC = () => {
  const { data, isLoading, error, refetch } = useAllocations();

  // 🚨 Gestion des erreurs
  if (error) {
    return (
      <Card
        title="Allocations du portefeuille"
        onRefresh={refetch}
        isLoading={isLoading}
      >
        <div className="text-secondary-500 text-center py-8">
          <p className="mb-2">Impossible de charger les données d'allocation.</p>
          <button 
            onClick={refetch}
            className="text-primary-400 hover:text-primary-300 underline"
          >
            Réessayer
          </button>
        </div>
      </Card>
    );
  }

  // 📊 Préparation des données pour le graphique
  const prepareChartData = (allocation: Record<string, number>) => {
    if (!allocation) return [];

    return Object.entries(allocation)
      .filter(([key]) => key !== 'regime' && key !== 'confidence')
      .map(([key, value]) => ({
        name: LABELS[key as keyof typeof LABELS] || key.charAt(0).toUpperCase() + key.slice(1),
        value: Number(value) || 0,
        color: COLORS[key as keyof typeof COLORS] || '#6B7280'
      }));
  };

  // 🎯 Extraction sécurisée des données
  const regime = data?.data?.regime || 'EXPANSION';
  const confidence = data?.data?.confidence || data?.confidence || 0.85;
  const allocation = data?.allocation || {
    actions: 65,
    obligations: 25,
    or: 5,
    cash: 5
  };
  const lastUpdate = data?.last_update || data?.timestamp || new Date().toISOString();

  // 📊 Données du graphique
  const chartData = prepareChartData(allocation);

  return (
    <Card
      title="Allocations du portefeuille"
      subtitle={`Mis à jour: ${formatDateTime(lastUpdate)}`}
      onRefresh={refetch}
      isLoading={isLoading}
    >
      {isLoading ? (
        // 🔄 État de chargement
        <div className="space-y-4">
          <Skeleton height="h-60" className="mb-6" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton height="h-16" />
            <Skeleton height="h-16" />
            <Skeleton height="h-16" />
            <Skeleton height="h-16" />
          </div>
        </div>
      ) : (
        // 📊 Contenu principal
        <>
          {/* En-tête avec régime économique */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-xl font-bold text-white">
                Régime: {regime}
              </h4>
              <p className="text-sm text-gray-400">
                Confiance: {formatPercent(confidence)}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                regime === 'EXPANSION' ? 'bg-green-900 text-green-300' :
                regime === 'RECESSION' ? 'bg-red-900 text-red-300' :
                regime === 'STAGFLATION' ? 'bg-orange-900 text-orange-300' :
                'bg-blue-900 text-blue-300'
              }`}>
                {regime}
              </div>
            </div>
          </div>

          {/* Graphique en secteurs */}
          <div className="h-64 mb-6">
            <PieChart
              data={chartData}
              innerRadius={60}
              outerRadius={90}
              height={240}
              showLabel={false}
              tooltipFormatter={(value, name) => [
                `${formatPercent(value / 100)}`,
                name
              ]}
            />
          </div>

          {/* Grille des allocations détaillées */}
          <div className="grid grid-cols-2 gap-4">
            {/* Actions */}
            <div className="bg-background-dark rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS.actions }}
                  ></div>
                  <p className="text-gray-400 text-sm font-medium">Actions</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {allocation.actions || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Croissance et dividendes
              </p>
            </div>

            {/* Obligations */}
            <div className="bg-background-dark rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS.obligations }}
                  ></div>
                  <p className="text-gray-400 text-sm font-medium">Obligations</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {allocation.obligations || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Revenus fixes
              </p>
            </div>

            {/* Or */}
            <div className="bg-background-dark rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS.or }}
                  ></div>
                  <p className="text-gray-400 text-sm font-medium">Or</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {allocation.or || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Protection inflation
              </p>
            </div>

            {/* Liquidités */}
            <div className="bg-background-dark rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS.cash }}
                  ></div>
                  <p className="text-gray-400 text-sm font-medium">Liquidités</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">
                {allocation.cash || 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Réserve de sécurité
              </p>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Total alloué</p>
                <p className="text-lg font-semibold text-white">
                  {(allocation.actions + allocation.obligations + allocation.or + allocation.cash) || 100}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Dernière mise à jour</p>
                <p className="text-sm text-white">
                  {new Date(lastUpdate).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Note explicative */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 Les allocations sont calculées en fonction du régime économique actuel ({regime}) 
              avec un niveau de confiance de {formatPercent(confidence)}.
            </p>
          </div>
        </>
      )}
    </Card>
  );
};

export default AllocationsCard;

