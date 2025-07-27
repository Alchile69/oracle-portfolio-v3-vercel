import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { RegimeType, RegimeData, RegimeHistory } from '@oracle-portfolio/shared';

export class RegimeService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getCurrentRegime(country: string = 'US', includeHistory: boolean = false): Promise<RegimeData> {
    try {
      logger.info(`Récupération du régime actuel pour ${country}`);

      // Récupérer le régime le plus récent
      const currentRegime = await this.prisma.regime.findFirst({
        where: {
          country,
          isActive: true
        },
        orderBy: {
          detectedAt: 'desc'
        }
      });

      if (!currentRegime) {
        // Générer un régime par défaut si aucun n'existe
        return this.generateDefaultRegime(country);
      }

      const regimeData: RegimeData = {
        id: currentRegime.id,
        country: currentRegime.country,
        regime: currentRegime.regime as RegimeType,
        detectedAt: currentRegime.detectedAt,
        growthScore: currentRegime.growthScore,
        inflationScore: currentRegime.inflationScore,
        confidence: currentRegime.confidence,
        indicators: await this.getRegimeIndicators(currentRegime.id)
      };

      if (includeHistory) {
        regimeData.history = await this.getRegimeHistory(country, 30);
      }

      return regimeData;
    } catch (error) {
      logger.error('Erreur lors de la récupération du régime actuel:', error);
      throw error;
    }
  }

  async getRegimeHistory(country: string, days: number, regime?: string): Promise<RegimeHistory[]> {
    try {
      const whereClause: any = {
        country,
        detectedAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      };

      if (regime) {
        whereClause.regime = regime;
      }

      const history = await this.prisma.regime.findMany({
        where: whereClause,
        orderBy: {
          detectedAt: 'desc'
        }
      });

      return history.map(regime => ({
        id: regime.id,
        regime: regime.regime as RegimeType,
        detectedAt: regime.detectedAt,
        growthScore: regime.growthScore,
        inflationScore: regime.inflationScore,
        confidence: regime.confidence
      }));
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }

  async detectRegime(country: string, indicators?: any): Promise<RegimeData> {
    try {
      logger.info(`Détection du régime pour ${country}`);

      // Logique de détection basée sur les indicateurs économiques
      const { growthScore, inflationScore, regime, confidence } = await this.analyzeIndicators(country, indicators);

      // Sauvegarder le nouveau régime
      const newRegime = await this.prisma.regime.create({
        data: {
          country,
          regime,
          growthScore,
          inflationScore,
          confidence,
          isActive: true
        }
      });

      return {
        id: newRegime.id,
        country: newRegime.country,
        regime: newRegime.regime as RegimeType,
        detectedAt: newRegime.detectedAt,
        growthScore: newRegime.growthScore,
        inflationScore: newRegime.inflationScore,
        confidence: newRegime.confidence,
        indicators: await this.getRegimeIndicators(newRegime.id)
      };
    } catch (error) {
      logger.error('Erreur lors de la détection du régime:', error);
      throw error;
    }
  }

  async getRegimeAnalysis(country: string): Promise<any> {
    try {
      const history = await this.getRegimeHistory(country, 365);
      
      // Analyser la distribution des régimes
      const regimeDistribution = history.reduce((acc, regime) => {
        acc[regime.regime] = (acc[regime.regime] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculer les statistiques
      const totalRegimes = history.length;
      const avgConfidence = history.reduce((sum, regime) => sum + regime.confidence, 0) / totalRegimes;

      return {
        country,
        totalRegimes,
        regimeDistribution,
        averageConfidence: avgConfidence,
        lastUpdate: history[0]?.detectedAt,
        trends: this.calculateTrends(history)
      };
    } catch (error) {
      logger.error('Erreur lors de l\'analyse des régimes:', error);
      throw error;
    }
  }

  private async analyzeIndicators(country: string, indicators?: any): Promise<{
    growthScore: number;
    inflationScore: number;
    regime: RegimeType;
    confidence: number;
  }> {
    // Simulation de l'analyse des indicateurs
    // En production, cela utiliserait de vrais indicateurs économiques
    
    const growthScore = Math.random() * 2 - 1; // -1 à 1
    const inflationScore = Math.random() * 4; // 0 à 4
    const confidence = 0.7 + Math.random() * 0.3; // 0.7 à 1.0

    let regime: RegimeType;
    
    if (growthScore > 0.5 && inflationScore < 2.5) {
      regime = 'EXPANSION';
    } else if (growthScore > 0 && growthScore <= 0.5 && inflationScore < 2) {
      regime = 'RECOVERY';
    } else if (growthScore < 0 && inflationScore > 3) {
      regime = 'STAGFLATION';
    } else {
      regime = 'RECESSION';
    }

    return { growthScore, inflationScore, regime, confidence };
  }

  private async getRegimeIndicators(regimeId: string): Promise<any[]> {
    // Récupérer les indicateurs associés au régime
    return [];
  }

  private generateDefaultRegime(country: string): RegimeData {
    return {
      id: 'default',
      country,
      regime: 'EXPANSION',
      detectedAt: new Date(),
      growthScore: 0.5,
      inflationScore: 2.0,
      confidence: 0.8,
      indicators: []
    };
  }

  private calculateTrends(history: RegimeHistory[]): any {
    // Calculer les tendances des régimes
    return {
      recentTrend: 'stable',
      volatility: 'low',
      regimeChanges: history.length > 1 ? history.length - 1 : 0
    };
  }
} 