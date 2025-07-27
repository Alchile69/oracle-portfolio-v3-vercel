import { SectorType } from '../types/sector.types';

export const SECTORS: SectorType[] = [
  'technology',
  'energy', 
  'finance',
  'consumer',
  'healthcare',
  'utilities',
  'materials',
  'industrials'
];

export const SECTOR_NAMES: Record<SectorType, string> = {
  technology: 'Technologie',
  energy: 'Énergie',
  finance: 'Finance',
  consumer: 'Consommation',
  healthcare: 'Santé',
  utilities: 'Services Publics',
  materials: 'Matériaux',
  industrials: 'Industriels'
};

export const SECTOR_COLORS: Record<SectorType, string> = {
  technology: '#3B82F6', // blue-500
  energy: '#F59E0B',     // amber-500
  finance: '#10B981',    // emerald-500
  consumer: '#EF4444',   // red-500
  healthcare: '#8B5CF6', // violet-500
  utilities: '#6B7280',  // gray-500
  materials: '#F97316',  // orange-500
  industrials: '#06B6D4' // cyan-500
};

export const SECTOR_ICONS: Record<SectorType, string> = {
  technology: '💻',
  energy: '⚡',
  finance: '💰',
  consumer: '🛒',
  healthcare: '🏥',
  utilities: '🏭',
  materials: '🏗️',
  industrials: '⚙️'
};

export const SECTOR_DESCRIPTIONS: Record<SectorType, string> = {
  technology: 'Entreprises technologiques, logiciels et services numériques',
  energy: 'Production et distribution d\'énergie, pétrole et gaz',
  finance: 'Banques, assurances et services financiers',
  consumer: 'Biens de consommation, retail et services aux particuliers',
  healthcare: 'Pharmaceutique, biotechnologie et équipements médicaux',
  utilities: 'Services publics, eau, électricité et télécommunications',
  materials: 'Métaux, produits chimiques et matériaux de construction',
  industrials: 'Machines, transports et équipements industriels'
};

export const SECTOR_INDICATORS: Record<SectorType, string[]> = {
  technology: ['nasdaq_performance', 'software_spending', 'cloud_adoption'],
  energy: ['oil_prices', 'energy_demand', 'renewable_investment'],
  finance: ['interest_rates', 'credit_spreads', 'banking_activity'],
  consumer: ['retail_sales', 'consumer_confidence', 'disposable_income'],
  healthcare: ['healthcare_spending', 'drug_approvals', 'aging_population'],
  utilities: ['electricity_demand', 'regulatory_changes', 'weather_impact'],
  materials: ['commodity_prices', 'construction_activity', 'global_trade'],
  industrials: ['manufacturing_pmi', 'capital_expenditure', 'trade_volumes']
}; 