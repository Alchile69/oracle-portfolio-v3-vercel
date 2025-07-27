import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { 
  RegimeType, 
  SectorType, 
  SectorAllocation, 
  AllocationSet,
  RegimeAllocations 
} from '@oracle-portfolio/shared';

export class AllocationService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllocation(
    regime: string, 
    riskProfile: string = 'moderate', 
    timeHorizon: number = 5
  ): Promise<AllocationSet> {
    try {
      logger.info(`Récupération de l'allocation pour le régime ${regime}`);

      // Récupérer l'allocation depuis la base de données
      const allocationRecord = await this.prisma.allocationSet.findFirst({
        where: {
          regime: regime as RegimeType,
          isActive: true
        },
        orderBy: {
          validFrom: 'desc'
        }
      });

      if (!allocationRecord) {
        // Générer une allocation par défaut
        return this.generateDefaultAllocation(regime as RegimeType, riskProfile, timeHorizon);
      }

      return {
        id: allocationRecord.id,
        regime: allocationRecord.regime as RegimeType,
        allocations: allocationRecord.allocations as SectorAllocation[],
        totalAllocation: allocationRecord.totalAllocation,
        riskScore: allocationRecord.riskScore,
        expectedReturn: allocationRecord.expectedReturn,
        validFrom: allocationRecord.validFrom,
        validTo: allocationRecord.validTo,
        isActive: allocationRecord.isActive
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'allocation:', error);
      throw error;
    }
  }

  async optimizeAllocation(
    regime: string,
    constraints?: any,
    preferences?: any
  ): Promise<AllocationSet> {
    try {
      logger.info(`Optimisation de l'allocation pour le régime ${regime}`);

      // Logique d'optimisation basée sur les contraintes et préférences
      const optimizedAllocations = await this.runOptimization(regime, constraints, preferences);

      // Sauvegarder la nouvelle allocation optimisée
      const newAllocation = await this.prisma.allocationSet.create({
        data: {
          regime: regime as RegimeType,
          allocations: optimizedAllocations,
          totalAllocation: 100,
          riskScore: this.calculateRiskScore(optimizedAllocations),
          expectedReturn: this.calculateExpectedReturn(optimizedAllocations, regime as RegimeType),
          validFrom: new Date(),
          isActive: true
        }
      });

      return {
        id: newAllocation.id,
        regime: newAllocation.regime as RegimeType,
        allocations: newAllocation.allocations as SectorAllocation[],
        totalAllocation: newAllocation.totalAllocation,
        riskScore: newAllocation.riskScore,
        expectedReturn: newAllocation.expectedReturn,
        validFrom: newAllocation.validFrom,
        validTo: newAllocation.validTo,
        isActive: newAllocation.isActive
      };
    } catch (error) {
      logger.error('Erreur lors de l\'optimisation de l\'allocation:', error);
      throw error;
    }
  }

  async compareAllocations(regimes: string[]): Promise<any> {
    try {
      const comparisons = await Promise.all(
        regimes.map(async (regime) => {
          const allocation = await this.getAllocation(regime);
          return {
            regime,
            allocation,
            metrics: this.calculateAllocationMetrics(allocation)
          };
        })
      );

      return {
        comparisons,
        summary: this.generateComparisonSummary(comparisons)
      };
    } catch (error) {
      logger.error('Erreur lors de la comparaison des allocations:', error);
      throw error;
    }
  }

  async getHistoricalPerformance(regime: string, period: string): Promise<any> {
    try {
      // Récupérer les performances historiques
      const historicalData = await this.prisma.allocationPerformance.findMany({
        where: {
          regime: regime as RegimeType,
          date: {
            gte: this.getDateFromPeriod(period)
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      return {
        regime,
        period,
        performance: historicalData,
        metrics: this.calculatePerformanceMetrics(historicalData)
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des performances:', error);
      throw error;
    }
  }

  private async runOptimization(regime: string, constraints?: any, preferences?: any): Promise<SectorAllocation[]> {
    // Logique d'optimisation simplifiée
    // En production, cela utiliserait des algorithmes d'optimisation avancés
    
    const baseAllocations = this.getBaseAllocations(regime as RegimeType);
    
    // Appliquer les contraintes
    if (constraints?.sectorLimits) {
      Object.entries(constraints.sectorLimits).forEach(([sector, limit]) => {
        const allocation = baseAllocations.find(a => a.sector === sector);
        if (allocation && allocation.allocation > limit) {
          allocation.allocation = limit as number;
        }
      });
    }

    // Normaliser les allocations
    const total = baseAllocations.reduce((sum, a) => sum + a.allocation, 0);
    baseAllocations.forEach(allocation => {
      allocation.allocation = (allocation.allocation / total) * 100;
      allocation.weight = allocation.allocation / 100;
    });

    return baseAllocations;
  }

  private getBaseAllocations(regime: RegimeType): SectorAllocation[] {
    const regimeAllocations: Record<RegimeType, Record<SectorType, number>> = {
      EXPANSION: {
        technology: 25,
        consumer: 20,
        industrials: 18,
        finance: 15,
        healthcare: 8,
        utilities: 5,
        energy: 5,
        materials: 4
      },
      RECOVERY: {
        finance: 22,
        materials: 20,
        industrials: 18,
        technology: 15,
        consumer: 12,
        utilities: 6,
        healthcare: 5,
        energy: 2
      },
      STAGFLATION: {
        energy: 25,
        utilities: 20,
        healthcare: 18,
        consumer: 15,
        technology: 8,
        finance: 6,
        materials: 5,
        industrials: 3
      },
      RECESSION: {
        utilities: 25,
        healthcare: 22,
        consumer: 20,
        technology: 12,
        finance: 8,
        energy: 6,
        materials: 4,
        industrials: 3
      }
    };

    const allocations = regimeAllocations[regime];
    return Object.entries(allocations).map(([sector, allocation]) => ({
      sector: sector as SectorType,
      allocation,
      weight: allocation / 100,
      confidence: 0.8,
      rationale: `Allocation optimale pour le régime ${regime}`
    }));
  }

  private generateDefaultAllocation(regime: RegimeType, riskProfile: string, timeHorizon: number): AllocationSet {
    const allocations = this.getBaseAllocations(regime);
    
    return {
      id: 'default',
      regime,
      allocations,
      totalAllocation: 100,
      riskScore: this.calculateRiskScore(allocations),
      expectedReturn: this.calculateExpectedReturn(allocations, regime),
      validFrom: new Date(),
      isActive: true
    };
  }

  private calculateRiskScore(allocations: SectorAllocation[]): number {
    // Calcul simplifié du score de risque
    const weights = allocations.map(a => a.weight);
    const concentrationRisk = weights.reduce((sum, weight) => sum + weight * weight, 0);
    return Math.min(concentrationRisk, 1);
  }

  private calculateExpectedReturn(allocations: SectorAllocation[], regime: RegimeType): number {
    // Calcul simplifié du retour attendu
    const regimeReturns: Record<RegimeType, number> = {
      EXPANSION: 0.12,
      RECOVERY: 0.10,
      STAGFLATION: 0.06,
      RECESSION: 0.03
    };
    
    return regimeReturns[regime] || 0.08;
  }

  private calculateAllocationMetrics(allocation: AllocationSet): any {
    return {
      riskScore: allocation.riskScore,
      expectedReturn: allocation.expectedReturn,
      diversification: this.calculateDiversification(allocation.allocations),
      sectorConcentration: this.calculateSectorConcentration(allocation.allocations)
    };
  }

  private calculateDiversification(allocations: SectorAllocation[]): number {
    const weights = allocations.map(a => a.weight);
    const herfindahlIndex = weights.reduce((sum, weight) => sum + weight * weight, 0);
    return 1 - herfindahlIndex; // Plus proche de 1 = plus diversifié
  }

  private calculateSectorConcentration(allocations: SectorAllocation[]): any {
    const sorted = [...allocations].sort((a, b) => b.allocation - a.allocation);
    return {
      top3Sectors: sorted.slice(0, 3).map(a => ({ sector: a.sector, allocation: a.allocation })),
      concentration: sorted.slice(0, 3).reduce((sum, a) => sum + a.allocation, 0)
    };
  }

  private generateComparisonSummary(comparisons: any[]): any {
    return {
      bestReturn: comparisons.reduce((best, comp) => 
        comp.metrics.expectedReturn > best.metrics.expectedReturn ? comp : best
      ),
      lowestRisk: comparisons.reduce((lowest, comp) => 
        comp.metrics.riskScore < lowest.metrics.riskScore ? comp : lowest
      ),
      mostDiversified: comparisons.reduce((most, comp) => 
        comp.metrics.diversification > most.metrics.diversification ? comp : most
      )
    };
  }

  private calculatePerformanceMetrics(historicalData: any[]): any {
    if (historicalData.length === 0) return {};

    const returns = historicalData.map(d => d.return);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );

    return {
      averageReturn: avgReturn,
      volatility,
      sharpeRatio: avgReturn / volatility,
      maxDrawdown: this.calculateMaxDrawdown(returns)
    };
  }

  private calculateMaxDrawdown(returns: number[]): number {
    let peak = 1;
    let maxDrawdown = 0;
    let cumulative = 1;

    returns.forEach(return_ => {
      cumulative *= (1 + return_);
      if (cumulative > peak) {
        peak = cumulative;
      }
      const drawdown = (peak - cumulative) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return maxDrawdown;
  }

  private getDateFromPeriod(period: string): Date {
    const now = new Date();
    switch (period) {
      case '1M': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '3M': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '6M': return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case '1Y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case '3Y': return new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    }
  }
} 