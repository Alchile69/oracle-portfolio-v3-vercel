import React from 'react';
import { motion } from 'framer-motion';
import { RegimeType, REGIME_CHARACTERISTICS } from '@oracle-portfolio/shared';

interface RegimeIndicatorProps {
  regime?: {
    regime: RegimeType;
    confidence: number;
    growthScore: number;
    inflationScore: number;
    detectedAt: string;
  };
}

export const RegimeIndicator: React.FC<RegimeIndicatorProps> = ({ regime }) => {
  if (!regime) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const characteristics = REGIME_CHARACTERISTICS[regime.regime];
  const confidenceColor = regime.confidence > 0.8 ? 'text-green-600' : 
                         regime.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600';

  const regimeColors = {
    EXPANSION: 'bg-green-100 text-green-800 border-green-200',
    RECOVERY: 'bg-blue-100 text-blue-800 border-blue-200',
    STAGFLATION: 'bg-orange-100 text-orange-800 border-orange-200',
    RECESSION: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Régime Économique</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${regimeColors[regime.regime]}`}>
          {regime.regime}
        </span>
      </div>

      <div className="space-y-4">
        {/* Description du régime */}
        <div>
          <p className="text-slate-600 text-sm mb-2">
            {characteristics.description}
          </p>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Croissance</div>
            <div className="text-lg font-semibold text-slate-900">
              {regime.growthScore > 0 ? '+' : ''}{regime.growthScore.toFixed(2)}%
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-slate-500 mb-1">Inflation</div>
            <div className="text-lg font-semibold text-slate-900">
              {regime.inflationScore.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Confiance */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Niveau de confiance</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${regime.confidence * 100}%` }}
              ></div>
            </div>
            <span className={`text-sm font-medium ${confidenceColor}`}>
              {Math.round(regime.confidence * 100)}%
            </span>
          </div>
        </div>

        {/* Secteurs favorisés */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">Secteurs favorisés</h4>
          <div className="flex flex-wrap gap-2">
            {characteristics.optimalSectors.map((sector) => (
              <span 
                key={sector}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
              >
                {sector}
              </span>
            ))}
          </div>
        </div>

        {/* Dernière mise à jour */}
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
          Dernière mise à jour: {new Date(regime.detectedAt).toLocaleDateString('fr-FR')}
        </div>
      </div>
    </motion.div>
  );
}; 