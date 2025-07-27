import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { SectorType, SECTOR_NAMES, SECTOR_INDICATORS } from '@oracle-portfolio/shared';

export class SectorService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllSectors(): Promise<any[]> {
    try {
      logger.info('Récupération de tous les secteurs');

      const sectors = Object.entries(SECTOR_NAMES).map(([key, name]) => ({
        id: key,
        name,
        indicators: SECTOR_INDICATORS[key as SectorType] || [],
        description: this.getSectorDescription(key as SectorType)
      }));

      return sectors;
    } catch (error) {
      logger.error('Erreur lors de la récupération des secteurs:', error);
      throw error;
    }
  }

  async getSectorData(sector: string): Promise<any> {
    try {
      logger.info(`Récupération des données pour le secteur ${sector}`);

      // Récupérer les données récentes du secteur
      const recentData = await this.prisma.sectorData.findMany({
        where: {
          sector,
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      // Calculer les statistiques
      const stats = this.calculateSectorStats(recentData);

      return {
        sector,
        name: SECTOR_NAMES[sector as SectorType] || sector,
        indicators: SECTOR_INDICATORS[sector as SectorType] || [],
        recentData,
        statistics: stats,
        lastUpdate: recentData[0]?.date
      };
    } catch (error) {
      logger.error(`Erreur lors de la récupération des données du secteur ${sector}:`, error);
      throw error;
    }
  }

  async getSectorIndicators(sector: string, period: string): Promise<any[]> {
    try {
      const startDate = this.getDateFromPeriod(period);
      
      const indicators = await this.prisma.sectorData.findMany({
        where: {
          sector,
          date: {
            gte: startDate
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      // Grouper par indicateur
      const groupedIndicators = indicators.reduce((acc, data) => {
        if (!acc[data.indicatorName]) {
          acc[data.indicatorName] = [];
        }
        acc[data.indicatorName].push({
          date: data.date,
          value: data.value,
          source: data.source,
          qualityScore: data.qualityScore
        });
        return acc;
      }, {} as Record<string, any[]>);

      return Object.entries(groupedIndicators).map(([indicator, data]) => ({
        indicator,
        data,
        trend: this.calculateTrend(data),
        volatility: this.calculateVolatility(data)
      }));
    } catch (error) {
      logger.error(`Erreur lors de la récupération des indicateurs du secteur ${sector}:`, error);
      throw error;
    }
  }

  async getSectorPerformance(sector: string, period: string): Promise<any> {
    try {
      // Simulation des performances sectorielles
      // En production, cela utiliserait de vraies données de performance
      
      const performance = this.generateSectorPerformance(sector, period);
      
      return {
        sector,
        period,
        performance,
        metrics: this.calculatePerformanceMetrics(performance)
      };
    } catch (error) {
      logger.error(`Erreur lors de la récupération des performances du secteur ${sector}:`, error);
      throw error;
    }
  }

  private getSectorDescription(sector: SectorType): string {
    const descriptions: Record<SectorType, string> = {
      technology: 'Secteur technologique incluant logiciels, matériel et services IT',
      energy: 'Secteur énergétique incluant pétrole, gaz et énergies renouvelables',
      finance: 'Secteur financier incluant banques, assurances et services financiers',
      consumer: 'Secteur de consommation incluant biens de consommation et services',
      healthcare: 'Secteur de la santé incluant pharmaceutique et équipements médicaux',
      utilities: 'Secteur des services publics incluant électricité, eau et gaz',
      materials: 'Secteur des matériaux incluant métaux, produits chimiques et construction',
      industrials: 'Secteur industriel incluant fabrication, transport et services industriels'
    };

    return descriptions[sector] || 'Description non disponible';
  }

  private calculateSectorStats(data: any[]): any {
    if (data.length === 0) return {};

    const values = data.map(d => Number(d.value)).filter(v => !isNaN(v));
    
    if (values.length === 0) return {};

    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const volatility = Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length
    );

    return {
      average: avg,
      minimum: min,
      maximum: max,
      volatility,
      dataPoints: values.length,
      lastValue: values[0]
    };
  }

  private calculateTrend(data: any[]): string {
    if (data.length < 2) return 'stable';

    const recent = data.slice(-5); // 5 derniers points
    const older = data.slice(-10, -5); // 5 points précédents

    const recentAvg = recent.reduce((sum, d) => sum + Number(d.value), 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + Number(d.value), 0) / older.length;

    const change = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  private calculateVolatility(data: any[]): number {
    if (data.length < 2) return 0;

    const values = data.map(d => Number(d.value));
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    
    return Math.sqrt(
      values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length
    );
  }

  private generateSectorPerformance(sector: string, period: string): any[] {
    // Simulation de données de performance
    const days = this.getDaysFromPeriod(period);
    const performance = [];

    let baseValue = 100;
    for (let i = 0; i < days; i++) {
      const dailyReturn = (Math.random() - 0.5) * 0.02; // ±1% par jour
      baseValue *= (1 + dailyReturn);
      
      performance.push({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
        value: baseValue,
        return: dailyReturn,
        cumulativeReturn: (baseValue - 100) / 100
      });
    }

    return performance;
  }

  private calculatePerformanceMetrics(performance: any[]): any {
    if (performance.length === 0) return {};

    const returns = performance.map(p => p.return);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );

    const totalReturn = (performance[performance.length - 1].value - 100) / 100;

    return {
      totalReturn,
      averageReturn: avgReturn,
      volatility,
      sharpeRatio: avgReturn / volatility,
      maxDrawdown: this.calculateMaxDrawdown(performance)
    };
  }

  private calculateMaxDrawdown(performance: any[]): number {
    let peak = 100;
    let maxDrawdown = 0;

    performance.forEach(p => {
      if (p.value > peak) {
        peak = p.value;
      }
      const drawdown = (peak - p.value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return maxDrawdown;
  }

  private getDateFromPeriod(period: string): Date {
    const now = new Date();
    const days = this.getDaysFromPeriod(period);
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  private getDaysFromPeriod(period: string): number {
    switch (period) {
      case '1D': return 1;
      case '1W': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      default: return 30;
    }
  }
} 