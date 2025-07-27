import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export class AnalyticsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async recordFeedback(feedbackData: any): Promise<any> {
    try {
      logger.info('Enregistrement du feedback utilisateur');

      const feedback = await this.prisma.feedback.create({
        data: {
          type: feedbackData.type,
          rating: feedbackData.rating,
          comment: feedbackData.comment,
          metadata: feedbackData.metadata,
          userId: feedbackData.userId,
          sessionId: feedbackData.sessionId
        }
      });

      // Enregistrer un événement analytics
      await this.recordEvent('feedback_submitted', {
        type: feedbackData.type,
        rating: feedbackData.rating,
        hasComment: !!feedbackData.comment
      });

      return feedback;
    } catch (error) {
      logger.error('Erreur lors de l\'enregistrement du feedback:', error);
      throw error;
    }
  }

  async getDashboardData(period: string): Promise<any> {
    try {
      const startDate = this.getDateFromPeriod(period);

      // Récupérer les statistiques d'utilisation
      const usageStats = await this.getUsageStats(startDate, new Date());

      // Récupérer les feedbacks récents
      const recentFeedback = await this.prisma.feedback.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });

      // Calculer les métriques de satisfaction
      const satisfactionMetrics = this.calculateSatisfactionMetrics(recentFeedback);

      return {
        period,
        usageStats,
        recentFeedback,
        satisfactionMetrics,
        topEvents: await this.getTopEvents(startDate)
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des données du dashboard:', error);
      throw error;
    }
  }

  async getUsageStats(startDate: string, endDate: string): Promise<any> {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Compter les événements par type
      const eventCounts = await this.prisma.analyticsEvent.groupBy({
        by: ['name'],
        where: {
          timestamp: {
            gte: start,
            lte: end
          }
        },
        _count: {
          name: true
        }
      });

      // Compter les utilisateurs uniques
      const uniqueUsers = await this.prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where: {
          timestamp: {
            gte: start,
            lte: end
          },
          userId: {
            not: null
          }
        }
      });

      // Compter les sessions uniques
      const uniqueSessions = await this.prisma.analyticsEvent.groupBy({
        by: ['sessionId'],
        where: {
          timestamp: {
            gte: start,
            lte: end
          },
          sessionId: {
            not: null
          }
        }
      });

      return {
        totalEvents: eventCounts.reduce((sum, event) => sum + event._count.name, 0),
        uniqueUsers: uniqueUsers.length,
        uniqueSessions: uniqueSessions.length,
        eventBreakdown: eventCounts.map(event => ({
          name: event.name,
          count: event._count.name
        }))
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques d\'utilisation:', error);
      throw error;
    }
  }

  async getPerformanceMetrics(regime: string, period: string): Promise<any> {
    try {
      const startDate = this.getDateFromPeriod(period);

      // Récupérer les performances historiques
      const performance = await this.prisma.allocationPerformance.findMany({
        where: {
          regime: regime as any,
          date: {
            gte: startDate
          }
        },
        orderBy: {
          date: 'asc'
        }
      });

      if (performance.length === 0) {
        return {
          regime,
          period,
          message: 'Aucune donnée de performance disponible'
        };
      }

      // Calculer les métriques
      const returns = performance.map(p => Number(p.return));
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const volatility = Math.sqrt(
        returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
      );

      const totalReturn = performance.reduce((cumulative, p) => 
        cumulative * (1 + Number(p.return)), 1
      ) - 1;

      return {
        regime,
        period,
        totalReturn,
        averageReturn: avgReturn,
        volatility,
        sharpeRatio: avgReturn / volatility,
        maxDrawdown: this.calculateMaxDrawdown(performance),
        dataPoints: performance.length
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des métriques de performance:', error);
      throw error;
    }
  }

  async recordEvent(name: string, properties?: any, userId?: string, sessionId?: string): Promise<void> {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          name,
          properties,
          userId,
          sessionId,
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Erreur lors de l\'enregistrement de l\'événement analytics:', error);
      // Ne pas faire échouer l'application pour un problème d'analytics
    }
  }

  private calculateSatisfactionMetrics(feedback: any[]): any {
    if (feedback.length === 0) {
      return {
        averageRating: 0,
        totalFeedback: 0,
        ratingDistribution: {}
      };
    }

    const ratings = feedback.map(f => f.rating);
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    const ratingDistribution = ratings.reduce((acc, rating) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      averageRating,
      totalFeedback: feedback.length,
      ratingDistribution
    };
  }

  private async getTopEvents(startDate: Date): Promise<any[]> {
    try {
      const topEvents = await this.prisma.analyticsEvent.groupBy({
        by: ['name'],
        where: {
          timestamp: {
            gte: startDate
          }
        },
        _count: {
          name: true
        },
        orderBy: {
          _count: {
            name: 'desc'
          }
        },
        take: 10
      });

      return topEvents.map(event => ({
        name: event.name,
        count: event._count.name
      }));
    } catch (error) {
      logger.error('Erreur lors de la récupération des événements populaires:', error);
      return [];
    }
  }

  private calculateMaxDrawdown(performance: any[]): number {
    let peak = 1;
    let maxDrawdown = 0;
    let cumulative = 1;

    performance.forEach(p => {
      cumulative *= (1 + Number(p.return));
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
    const days = this.getDaysFromPeriod(period);
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  private getDaysFromPeriod(period: string): number {
    switch (period) {
      case '1D': return 1;
      case '1W': return 7;
      case '7D': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      default: return 7;
    }
  }
} 