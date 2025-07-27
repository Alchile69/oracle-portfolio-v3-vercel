import { SectorType, SectorIndicator, DataSource, ValidatedData, QualityIssue } from '@oracle-portfolio/shared';
import { Logger } from '../monitoring/logger.service';
import { YahooFinanceClient } from './yahoo.client';
import { FredClient } from './fred.client';
import { SQLiteCache } from './fallback.service';

export class DataCollectorService {
  private sources: Map<string, DataSource>;
  private fallbackCache: SQLiteCache;
  private logger: Logger;
  private yahooClient: YahooFinanceClient;
  private fredClient: FredClient;
  
  constructor() {
    this.sources = new Map([
      ['yahoo', { 
        name: 'Yahoo Finance', 
        priority: 1, 
        type: 'primary',
        isHealthy: true,
        lastSuccessfulFetch: new Date(),
        errorCount: 0
      }],
      ['fred', { 
        name: 'FRED API', 
        priority: 2, 
        type: 'primary',
        isHealthy: true,
        lastSuccessfulFetch: new Date(),
        errorCount: 0
      }],
      ['cache', { 
        name: 'Local Cache', 
        priority: 99, 
        type: 'fallback',
        isHealthy: true,
        lastSuccessfulFetch: new Date(),
        errorCount: 0
      }]
    ]);
    
    this.fallbackCache = new SQLiteCache('./data/fallback.db');
    this.logger = new Logger('DataCollector');
    this.yahooClient = new YahooFinanceClient();
    this.fredClient = new FredClient();
  }
  
  async collectSectorData(sector: SectorType): Promise<SectorIndicator[]> {
    const collectors = this.getSectorCollectors(sector);
    const results: SectorIndicator[] = [];
    
    for (const collector of collectors) {
      try {
        // Tentative de collecte avec timeout
        const data = await this.collectWithTimeout(collector, 5000);
        
        // Validation des données
        const validatedData = await this.validateData(data);
        
        if (validatedData.quality.score > 0.7) {
          results.push(...validatedData.indicators);
          
          // Mise en cache pour fallback
          await this.fallbackCache.store(sector, validatedData);
          
          // Log succès structuré
          this.logger.info('Data collection successful', {
            sector,
            source: collector.source.name,
            indicatorCount: validatedData.indicators.length,
            qualityScore: validatedData.quality.score
          });
        } else {
          throw new Error(`Data quality too low: ${validatedData.quality.score}`);
        }
        
        break; // Succès, pas besoin de fallback
        
      } catch (error) {
        // Log erreur structuré
        this.logger.error('Data collection failed', {
          sector,
          source: collector.source.name,
          error: error.message,
          stack: error.stack
        });
        
        // Incrémenter compteur d'erreurs
        collector.source.errorCount++;
        
        // Marquer source comme unhealthy si trop d'erreurs
        if (collector.source.errorCount > 3) {
          collector.source.isHealthy = false;
          await this.alertAdmin(`Source ${collector.source.name} marked unhealthy`);
        }
        
        // Continuer avec la source suivante
        continue;
      }
    }
    
    // Si aucune source primaire ne fonctionne, utiliser le fallback
    if (results.length === 0) {
      this.logger.warn('All primary sources failed, using fallback', { sector });
      
      const fallbackData = await this.fallbackCache.getLatest(sector);
      if (fallbackData && this.isFreshEnough(fallbackData, 48)) { // 48h max
        results.push(...fallbackData.indicators);
        
        // Ajouter warning sur la fraîcheur
        results.forEach(indicator => {
          indicator.quality.issues.push({
            type: 'stale_data',
            message: `Data is ${this.getAgeInHours(indicator.timestamp)} hours old`,
            severity: 'medium'
          });
        });
      } else {
        throw new Error(`No valid data available for sector ${sector}`);
      }
    }
    
    return results;
  }
  
  private async validateData(data: any): Promise<ValidatedData> {
    const validation = new DataValidator();
    
    // Vérifications de base
    const checks = [
      validation.checkCompleteness(data),
      validation.checkRanges(data),
      validation.checkConsistency(data),
      validation.checkFreshness(data)
    ];
    
    const results = await Promise.all(checks);
    const qualityScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    
    return {
      indicators: data,
      quality: {
        score: qualityScore,
        issues: results.flatMap(r => r.issues),
        isFresh: results[3].score > 0.8,
        isValidated: qualityScore > 0.7
      }
    };
  }
  
  private getSectorCollectors(sector: SectorType) {
    return [
      {
        source: this.sources.get('yahoo')!,
        collect: () => this.yahooClient.getSectorData(sector)
      },
      {
        source: this.sources.get('fred')!,
        collect: () => this.fredClient.getSectorData(sector)
      }
    ].filter(c => c.source.isHealthy);
  }
  
  private async collectWithTimeout(collector: any, timeoutMs: number): Promise<any> {
    return Promise.race([
      collector.collect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      )
    ]);
  }
  
  private isFreshEnough(data: any, maxHours: number): boolean {
    const age = this.getAgeInHours(data.timestamp);
    return age <= maxHours;
  }
  
  private getAgeInHours(timestamp: Date): number {
    return (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
  }
  
  private async alertAdmin(message: string): Promise<void> {
    // Implémentation de l'alerte admin
    this.logger.error('Admin alert', { message });
  }
}

class DataValidator {
  async checkCompleteness(data: any): Promise<{ score: number; issues: QualityIssue[] }> {
    const issues: QualityIssue[] = [];
    let missingCount = 0;
    let totalCount = 0;
    
    for (const indicator of data) {
      totalCount++;
      if (!indicator.value || indicator.value === null) {
        missingCount++;
        issues.push({
          type: 'missing_data',
          message: `Missing value for ${indicator.indicatorName}`,
          severity: 'high'
        });
      }
    }
    
    const score = totalCount > 0 ? (totalCount - missingCount) / totalCount : 0;
    return { score, issues };
  }
  
  async checkRanges(data: any): Promise<{ score: number; issues: QualityIssue[] }> {
    const issues: QualityIssue[] = [];
    let outlierCount = 0;
    let totalCount = 0;
    
    for (const indicator of data) {
      totalCount++;
      if (this.isOutlier(indicator.value, indicator.indicatorName)) {
        outlierCount++;
        issues.push({
          type: 'outlier',
          message: `Outlier detected for ${indicator.indicatorName}: ${indicator.value}`,
          severity: 'medium'
        });
      }
    }
    
    const score = totalCount > 0 ? (totalCount - outlierCount) / totalCount : 0;
    return { score, issues };
  }
  
  async checkConsistency(data: any): Promise<{ score: number; issues: QualityIssue[] }> {
    const issues: QualityIssue[] = [];
    let inconsistentCount = 0;
    let totalCount = 0;
    
    // Vérifier la cohérence entre indicateurs
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        totalCount++;
        if (this.areInconsistent(data[i], data[j])) {
          inconsistentCount++;
          issues.push({
            type: 'inconsistent',
            message: `Inconsistent data between ${data[i].indicatorName} and ${data[j].indicatorName}`,
            severity: 'medium'
          });
        }
      }
    }
    
    const score = totalCount > 0 ? (totalCount - inconsistentCount) / totalCount : 0;
    return { score, issues };
  }
  
  async checkFreshness(data: any): Promise<{ score: number; issues: QualityIssue[] }> {
    const issues: QualityIssue[] = [];
    let staleCount = 0;
    let totalCount = 0;
    
    for (const indicator of data) {
      totalCount++;
      const age = (Date.now() - indicator.timestamp.getTime()) / (1000 * 60 * 60);
      if (age > 24) { // Plus de 24h
        staleCount++;
        issues.push({
          type: 'stale_data',
          message: `Data is ${age.toFixed(1)} hours old`,
          severity: 'low'
        });
      }
    }
    
    const score = totalCount > 0 ? (totalCount - staleCount) / totalCount : 0;
    return { score, issues };
  }
  
  private isOutlier(value: number, indicatorName: string): boolean {
    // Logique simplifiée de détection d'outliers
    const thresholds: Record<string, { min: number; max: number }> = {
      'growth_rate': { min: -10, max: 10 },
      'inflation_rate': { min: -5, max: 20 },
      'interest_rate': { min: -5, max: 15 }
    };
    
    const threshold = thresholds[indicatorName] || { min: -100, max: 100 };
    return value < threshold.min || value > threshold.max;
  }
  
  private areInconsistent(indicator1: any, indicator2: any): boolean {
    // Logique simplifiée de vérification de cohérence
    return false; // À implémenter selon les règles métier
  }
} 