/**
 * Utilitaire de génération de données sectorielles pour Oracle Portfolio V3.0
 * @author Manus AI
 * @version 3.0.0
 * @date 2025-08-07
 */

import { 
  SectorData, 
  SectorType, 
  SectorMetrics,
  TrendDirection,
  SectorGrade,
  SECTOR_DEFINITIONS,
  SectorUtils,
  HistoricalDataPoint
} from '../types/sector.types';

/**
 * Générateur de données sectorielles réalistes pour les tests et le développement
 */
export class SectorDataGenerator {
  private static readonly MARKET_CONDITIONS = {
    BULL: { performanceMultiplier: 1.2, riskMultiplier: 0.8 },
    BEAR: { performanceMultiplier: 0.6, riskMultiplier: 1.3 },
    NEUTRAL: { performanceMultiplier: 1.0, riskMultiplier: 1.0 }
  };

  private static readonly SECTOR_CORRELATIONS = {
    [SectorType.TECHNOLOGY]: [SectorType.COMMUNICATION, SectorType.CONSUMER],
    [SectorType.FINANCE]: [SectorType.REAL_ESTATE, SectorType.INDUSTRIALS],
    [SectorType.HEALTHCARE]: [SectorType.UTILITIES],
    [SectorType.ENERGY]: [SectorType.MATERIALS, SectorType.INDUSTRIALS],
    [SectorType.INDUSTRIALS]: [SectorType.MATERIALS, SectorType.ENERGY],
    [SectorType.CONSUMER]: [SectorType.TECHNOLOGY, SectorType.COMMUNICATION],
    [SectorType.COMMUNICATION]: [SectorType.TECHNOLOGY, SectorType.CONSUMER],
    [SectorType.MATERIALS]: [SectorType.ENERGY, SectorType.INDUSTRIALS],
    [SectorType.SERVICES]: [SectorType.CONSUMER, SectorType.INDUSTRIALS],
    [SectorType.REAL_ESTATE]: [SectorType.FINANCE, SectorType.UTILITIES],
    [SectorType.UTILITIES]: [SectorType.HEALTHCARE, SectorType.REAL_ESTATE]
  };

  /**
   * Génère des données sectorielles réalistes
   */
  static generateSectorData(
    sectorType: SectorType,
    marketCondition: keyof typeof SectorDataGenerator.MARKET_CONDITIONS = 'NEUTRAL',
    customAllocation?: number
  ): SectorData {
    const metadata = SECTOR_DEFINITIONS[sectorType];
    const condition = this.MARKET_CONDITIONS[marketCondition];
    
    // Génération des métriques basées sur le type de secteur et les conditions de marché
    const baseMetrics = this.generateBaseMetrics(sectorType, condition);
    const allocation = customAllocation ?? this.generateAllocation(sectorType);
    
    const metrics: SectorMetrics = {
      ...baseMetrics,
      allocation,
      lastUpdated: new Date()
    };

    const grade = SectorUtils.calculateGrade(metrics.performance);
    const recommendations = this.generateRecommendations(sectorType, metrics, grade);
    const historicalData = this.generateHistoricalData(sectorType, 12); // 12 mois

    return {
      metadata,
      metrics,
      grade,
      recommendations,
      historicalData
    };
  }

  /**
   * Génère un portfolio complet avec allocations équilibrées
   */
  static generatePortfolio(
    marketCondition: keyof typeof SectorDataGenerator.MARKET_CONDITIONS = 'NEUTRAL',
    totalAllocation: number = 100
  ): SectorData[] {
    const sectors = Object.values(SectorType);
    const allocations = this.generateBalancedAllocations(sectors, totalAllocation);
    
    return sectors.map((sectorType, index) => 
      this.generateSectorData(sectorType, marketCondition, allocations[index])
    );
  }

  /**
   * Génère des métriques de base pour un secteur
   */
  private static generateBaseMetrics(
    sectorType: SectorType,
    condition: { performanceMultiplier: number; riskMultiplier: number }
  ): Omit<SectorMetrics, 'allocation' | 'lastUpdated'> {
    const metadata = SECTOR_DEFINITIONS[sectorType];
    
    // Performance de base selon le type de secteur
    const basePerformance = this.getBasePerformance(sectorType);
    const performance = basePerformance * condition.performanceMultiplier + this.randomNoise(-2, 2);
    
    // Risque de base selon le niveau de risque du secteur
    const baseRisk = this.getBaseRisk(metadata.riskLevel);
    const riskScore = Math.max(0, Math.min(100, baseRisk * condition.riskMultiplier + this.randomNoise(-5, 5)));
    
    // Confiance basée sur la performance et la volatilité
    const confidence = Math.max(30, Math.min(95, 80 - Math.abs(performance - 8) * 2 - (riskScore - 50) * 0.3));
    
    // Tendance basée sur la performance récente
    const trend = performance > 5 ? TrendDirection.UP : 
                  performance < -2 ? TrendDirection.DOWN : 
                  TrendDirection.STABLE;
    
    // Volatilité corrélée au risque
    const volatility = (riskScore / 100) * 25 + this.randomNoise(-3, 3);
    
    // Ratio de Sharpe basé sur performance et volatilité
    const sharpeRatio = Math.max(0, performance / Math.max(volatility, 1));
    
    // Bêta basé sur le type de secteur
    const beta = this.getBeta(sectorType) + this.randomNoise(-0.1, 0.1);

    return {
      performance: Math.round(performance * 10) / 10,
      confidence: Math.round(confidence),
      trend,
      riskScore: Math.round(riskScore),
      volatility: Math.round(volatility * 10) / 10,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      beta: Math.round(beta * 100) / 100
    };
  }

  /**
   * Génère des allocations équilibrées pour un portfolio
   */
  private static generateBalancedAllocations(sectors: SectorType[], total: number): number[] {
    const weights = sectors.map(sector => this.getSectorWeight(sector));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // Normalisation et ajout de variation aléatoire
    const allocations = weights.map(weight => {
      const baseAllocation = (weight / totalWeight) * total;
      const variation = this.randomNoise(-0.2, 0.2);
      return Math.max(0, baseAllocation * (1 + variation));
    });
    
    // Ajustement pour atteindre exactement le total
    const currentTotal = allocations.reduce((sum, alloc) => sum + alloc, 0);
    const adjustmentFactor = total / currentTotal;
    
    return allocations.map(alloc => Math.round(alloc * adjustmentFactor * 10) / 10);
  }

  /**
   * Génère des recommandations basées sur les métriques
   */
  private static generateRecommendations(
    sectorType: SectorType,
    metrics: SectorMetrics,
    grade: SectorGrade
  ): string[] {
    const recommendations: string[] = [];
    const metadata = SECTOR_DEFINITIONS[sectorType];
    
    // Recommandations basées sur la performance
    if (metrics.performance > 10) {
      recommendations.push('Performance exceptionnelle, surveiller les prises de bénéfices');
    } else if (metrics.performance > 5) {
      recommendations.push('Bonne performance, maintenir la position');
    } else if (metrics.performance < -5) {
      recommendations.push('Sous-performance, analyser les causes fondamentales');
    }
    
    // Recommandations basées sur le risque
    if (metrics.riskScore > 80) {
      recommendations.push('Risque élevé, considérer une réduction d\'allocation');
    } else if (metrics.riskScore < 40) {
      recommendations.push('Risque faible, opportunité d\'augmentation d\'allocation');
    }
    
    // Recommandations basées sur la tendance
    if (metrics.trend === TrendDirection.UP && metrics.confidence > 75) {
      recommendations.push('Tendance haussière confirmée, position favorable');
    } else if (metrics.trend === TrendDirection.DOWN && metrics.confidence > 70) {
      recommendations.push('Tendance baissière, surveiller les points de retournement');
    }
    
    // Recommandations spécifiques au secteur
    const sectorSpecific = this.getSectorSpecificRecommendations(sectorType, metrics);
    recommendations.push(...sectorSpecific);
    
    return recommendations.slice(0, 4); // Limiter à 4 recommandations
  }

  /**
   * Génère des données historiques pour un secteur
   */
  private static generateHistoricalData(sectorType: SectorType, months: number): HistoricalDataPoint[] {
    const data: HistoricalDataPoint[] = [];
    const baseAllocation = this.generateAllocation(sectorType);
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Simulation d'évolution temporelle
      const timeProgress = (months - i) / months;
      const seasonality = Math.sin(timeProgress * Math.PI * 2) * 2;
      const trend = (timeProgress - 0.5) * 10;
      const noise = this.randomNoise(-3, 3);
      
      const performance = this.getBasePerformance(sectorType) + trend + seasonality + noise;
      const allocation = baseAllocation * (1 + this.randomNoise(-0.1, 0.1));
      const riskScore = this.getBaseRisk(SECTOR_DEFINITIONS[sectorType].riskLevel) + this.randomNoise(-10, 10);
      const grade = SectorUtils.calculateGrade(performance);
      
      data.push({
        date,
        allocation: Math.round(allocation * 10) / 10,
        performance: Math.round(performance * 10) / 10,
        riskScore: Math.max(0, Math.min(100, Math.round(riskScore))),
        grade
      });
    }
    
    return data;
  }

  /**
   * Obtient la performance de base pour un secteur
   */
  private static getBasePerformance(sectorType: SectorType): number {
    const performanceMap = {
      [SectorType.TECHNOLOGY]: 12,
      [SectorType.HEALTHCARE]: 8,
      [SectorType.FINANCE]: 7,
      [SectorType.CONSUMER]: 6,
      [SectorType.COMMUNICATION]: 9,
      [SectorType.INDUSTRIALS]: 5,
      [SectorType.UTILITIES]: 4,
      [SectorType.REAL_ESTATE]: 6,
      [SectorType.ENERGY]: 3,
      [SectorType.MATERIALS]: 2,
      [SectorType.SERVICES]: 5
    };
    
    return performanceMap[sectorType] || 5;
  }

  /**
   * Obtient le risque de base selon le niveau
   */
  private static getBaseRisk(riskLevel: string): number {
    const riskMap = {
      'low': 35,
      'medium': 60,
      'high': 80
    };
    
    return riskMap[riskLevel as keyof typeof riskMap] || 60;
  }

  /**
   * Obtient le bêta de base pour un secteur
   */
  private static getBeta(sectorType: SectorType): number {
    const betaMap = {
      [SectorType.TECHNOLOGY]: 1.3,
      [SectorType.FINANCE]: 1.1,
      [SectorType.HEALTHCARE]: 0.8,
      [SectorType.ENERGY]: 1.4,
      [SectorType.INDUSTRIALS]: 1.2,
      [SectorType.CONSUMER]: 1.0,
      [SectorType.COMMUNICATION]: 1.1,
      [SectorType.MATERIALS]: 1.3,
      [SectorType.SERVICES]: 1.0,
      [SectorType.REAL_ESTATE]: 0.9,
      [SectorType.UTILITIES]: 0.6
    };
    
    return betaMap[sectorType] || 1.0;
  }

  /**
   * Obtient le poids de base pour un secteur dans un portfolio équilibré
   */
  private static getSectorWeight(sectorType: SectorType): number {
    const weightMap = {
      [SectorType.TECHNOLOGY]: 20,
      [SectorType.FINANCE]: 15,
      [SectorType.HEALTHCARE]: 12,
      [SectorType.CONSUMER]: 10,
      [SectorType.INDUSTRIALS]: 8,
      [SectorType.COMMUNICATION]: 8,
      [SectorType.ENERGY]: 6,
      [SectorType.REAL_ESTATE]: 5,
      [SectorType.MATERIALS]: 5,
      [SectorType.SERVICES]: 6,
      [SectorType.UTILITIES]: 5
    };
    
    return weightMap[sectorType] || 5;
  }

  /**
   * Génère une allocation pour un secteur
   */
  private static generateAllocation(sectorType: SectorType): number {
    const baseWeight = this.getSectorWeight(sectorType);
    const variation = this.randomNoise(-0.3, 0.3);
    return Math.max(0.1, baseWeight * (1 + variation));
  }

  /**
   * Obtient des recommandations spécifiques au secteur
   */
  private static getSectorSpecificRecommendations(sectorType: SectorType, metrics: SectorMetrics): string[] {
    const recommendations: string[] = [];
    
    switch (sectorType) {
      case SectorType.TECHNOLOGY:
        recommendations.push('Innovation IA et cloud computing');
        if (metrics.volatility > 20) recommendations.push('Volatilité élevée typique du secteur');
        break;
        
      case SectorType.HEALTHCARE:
        recommendations.push('Vieillissement démographique favorable');
        recommendations.push('Pipeline R&D à surveiller');
        break;
        
      case SectorType.FINANCE:
        recommendations.push('Sensible aux taux d\'intérêt');
        if (metrics.beta > 1.2) recommendations.push('Corrélation élevée avec le marché');
        break;
        
      case SectorType.ENERGY:
        recommendations.push('Transition énergétique en cours');
        recommendations.push('Volatilité des prix des commodités');
        break;
        
      case SectorType.UTILITIES:
        recommendations.push('Dividendes stables et récurrents');
        recommendations.push('Secteur défensif en période d\'incertitude');
        break;
        
      default:
        recommendations.push('Suivre les tendances macroéconomiques');
    }
    
    return recommendations;
  }

  /**
   * Génère un bruit aléatoire dans une plage donnée
   */
  private static randomNoise(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Simule des conditions de marché spécifiques
   */
  static simulateMarketScenario(scenario: 'crisis' | 'boom' | 'recession' | 'recovery'): SectorData[] {
    const conditionMap = {
      crisis: 'BEAR' as const,
      boom: 'BULL' as const,
      recession: 'BEAR' as const,
      recovery: 'BULL' as const
    };
    
    const condition = conditionMap[scenario];
    const portfolio = this.generatePortfolio(condition);
    
    // Ajustements spécifiques au scénario
    return portfolio.map(sector => {
      const adjustedMetrics = { ...sector.metrics };
      
      switch (scenario) {
        case 'crisis':
          // Les secteurs défensifs résistent mieux
          if (sector.metadata.category === 'defensive') {
            adjustedMetrics.performance *= 1.2;
            adjustedMetrics.riskScore *= 0.8;
          }
          break;
          
        case 'boom':
          // Les secteurs cycliques surperforment
          if (sector.metadata.category === 'cyclical') {
            adjustedMetrics.performance *= 1.3;
            adjustedMetrics.confidence *= 1.1;
          }
          break;
          
        case 'recession':
          // Baisse généralisée avec secteurs défensifs moins touchés
          adjustedMetrics.performance *= sector.metadata.category === 'defensive' ? 0.9 : 0.7;
          break;
          
        case 'recovery':
          // Reprise avec secteurs cycliques en tête
          if (sector.metadata.category === 'cyclical') {
            adjustedMetrics.performance *= 1.4;
            adjustedMetrics.trend = TrendDirection.UP;
          }
          break;
      }
      
      return {
        ...sector,
        metrics: adjustedMetrics,
        grade: SectorUtils.calculateGrade(adjustedMetrics.performance)
      };
    });
  }
}

export default SectorDataGenerator;

