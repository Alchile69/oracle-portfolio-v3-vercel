/**
 * API Endpoint /api/sectors - Oracle Portfolio V3.0
 * @author Manus AI
 * @version 3.0.0
 * @date 2025-08-07
 */

// Données sectorielles complètes
const SECTORS_DATA = {
  sectors: [
    {
      metadata: {
        id: "technology",
        name: "Technologies",
        description: "IT, Software, Hardware, Intelligence Artificielle",
        category: "GROWTH",
        riskLevel: "HIGH"
      },
      metrics: {
        allocation: 25.5,
        performance: 12.3,
        confidence: 85,
        trend: "UP",
        riskScore: 75,
        volatility: 18.2,
        sharpeRatio: 1.45,
        beta: 1.2,
        lastUpdated: new Date().toISOString()
      },
      grade: "A",
      recommendations: [
        "Secteur en forte croissance avec l'IA",
        "Maintenir allocation élevée",
        "Surveiller la volatilité"
      ],
      historicalData: []
    },
    {
      metadata: {
        id: "finance",
        name: "Finance",
        description: "Banque, Assurance, Fintech",
        category: "VALUE",
        riskLevel: "MEDIUM"
      },
      metrics: {
        allocation: 18.7,
        performance: 8.9,
        confidence: 78,
        trend: "UP",
        riskScore: 65,
        volatility: 15.4,
        sharpeRatio: 1.15,
        beta: 1.05,
        lastUpdated: new Date().toISOString()
      },
      grade: "B",
      recommendations: [
        "Taux d'intérêt favorables",
        "Digitalisation bancaire",
        "Fintech en expansion"
      ],
      historicalData: []
    },
    {
      metadata: {
        id: "healthcare",
        name: "Santé",
        description: "Médical, Pharma, Biotech",
        category: "DEFENSIVE",
        riskLevel: "LOW"
      },
      metrics: {
        allocation: 15.2,
        performance: 6.8,
        confidence: 82,
        trend: "STABLE",
        riskScore: 45,
        volatility: 12.1,
        sharpeRatio: 1.28,
        beta: 0.75,
        lastUpdated: new Date().toISOString()
      },
      grade: "A",
      recommendations: [
        "Secteur défensif stable",
        "Vieillissement démographique favorable",
        "Innovation biotechnologique"
      ],
      historicalData: []
    },
    {
      metadata: {
        id: "energy",
        name: "Énergie",
        description: "Pétrole, Gaz, Renouvelables",
        category: "CYCLICAL",
        riskLevel: "HIGH"
      },
      metrics: {
        allocation: 12.1,
        performance: -2.5,
        confidence: 65,
        trend: "DOWN",
        riskScore: 85,
        volatility: 25.3,
        sharpeRatio: 0.65,
        beta: 1.45,
        lastUpdated: new Date().toISOString()
      },
      grade: "C",
      recommendations: [
        "Transition énergétique en cours",
        "Volatilité élevée des prix",
        "Considérer les énergies renouvelables"
      ],
      historicalData: []
    },
    {
      metadata: {
        id: "industrials",
        name: "Industrie",
        description: "Manufacture, Auto, Aéro",
        category: "CYCLICAL",
        riskLevel: "MEDIUM"
      },
      metrics: {
        allocation: 10.8,
        performance: 5.2,
        confidence: 72,
        trend: "STABLE",
        riskScore: 70,
        volatility: 16.7,
        sharpeRatio: 0.95,
        beta: 1.1,
        lastUpdated: new Date().toISOString()
      },
      grade: "B",
      recommendations: [
        "Secteur cyclique sensible à l'économie",
        "Automatisation et robotique",
        "Infrastructure et transport"
      ],
      historicalData: []
    },
    {
      metadata: {
        id: "consumer",
        name: "Consommation",
        description: "Retail, E-commerce",
        category: "CYCLICAL",
        riskLevel: "MEDIUM"
      },
      metrics: {
        allocation: 8.9,
        performance: 4.1,
        confidence: 75,
        trend: "STABLE",
        riskScore: 60,
        volatility: 14.2,
        sharpeRatio: 1.05,
        beta: 0.9,
        lastUpdated: new Date().toISOString()
      },
      grade: "B",
      recommendations: [
        "Consommation résiliente",
        "E-commerce en croissance",
        "Marques premium favorisées"
      ],
      historicalData: []
    },
    {
      metadata: {
        id: "communication",
        name: "Communication",
        description: "Télécom, Média, Internet",
        category: "GROWTH",
        riskLevel: "MEDIUM"
      },
      metrics: {
        allocation: 7.3,
        performance: 3.8,
        confidence: 70,
        trend: "STABLE",
        riskScore: 55,
        volatility: 13.6,
        sharpeRatio: 0.88,
        beta: 0.95,
        lastUpdated: new Date().toISOString()
      },
      grade: "B",
      recommendations: [
        "5G et infrastructure réseau",
        "Streaming et contenu digital",
        "Consolidation du secteur"
      ],
      historicalData: []
    },
    {
      metadata: {
        id: "materials",
        name: "Matériaux",
        description: "Chimie, Construction, Métaux",
        category: "CYCLICAL",
        riskLevel: "HIGH"
      },
      metrics: {
        allocation: 5.4,
        performance: 1.2,
        confidence: 68,
        trend: "DOWN",
        riskScore: 80,
        volatility: 22.1,
        sharpeRatio: 0.45,
        beta: 1.35,
        lastUpdated: new Date().toISOString()
      },
      grade: "C",
      recommendations: [
        "Cyclique dépendant de l'économie",
        "Matériaux verts en développement",
        "Volatilité des prix des commodités"
      ],
      historicalData: []
    },
    {
      metadata: {
        id: "utilities",
        name: "Services publics",
        description: "Eau, Électricité, Gaz",
        category: "DEFENSIVE",
        riskLevel: "LOW"
      },
      metrics: {
        allocation: 1.4,
        performance: 3.2,
        confidence: 88,
        trend: "STABLE",
        riskScore: 35,
        volatility: 8.9,
        sharpeRatio: 1.35,
        beta: 0.6,
        lastUpdated: new Date().toISOString()
      },
      grade: "A",
      recommendations: [
        "Secteur défensif avec dividendes",
        "Transition énergétique",
        "Régulation stable"
      ],
      historicalData: []
    }
  ],
  metadata: {
    totalSectors: 9,
    lastUpdated: new Date().toISOString(),
    version: "3.0.0",
    source: "Oracle Portfolio API"
  }
};

// Handler principal pour l'endpoint
export default function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gestion des requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Seules les requêtes GET sont autorisées
  if (req.method !== 'GET') {
    res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
    return;
  }

  try {
    // Simulation d'un délai de traitement
    setTimeout(() => {
      // Retourner les données sectorielles
      res.status(200).json(SECTORS_DATA);
    }, 100);

  } catch (error) {
    console.error('Erreur API sectors:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Erreur lors de la récupération des données sectorielles'
    });
  }
}

