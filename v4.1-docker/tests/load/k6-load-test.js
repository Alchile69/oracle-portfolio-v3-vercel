import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métriques personnalisées
const errorRate = new Rate('errors');

// Configuration du test
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Montée en charge
    { duration: '5m', target: 10 },   // Charge constante
    { duration: '2m', target: 50 },   // Pic de charge
    { duration: '5m', target: 50 },   // Charge élevée
    { duration: '2m', target: 0 },    // Descente
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% des requêtes < 2s
    http_req_failed: ['rate<0.05'],    // Taux d'erreur < 5%
    errors: ['rate<0.05'],             // Erreurs < 5%
  },
};

// Configuration de base
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const API_VERSION = 'v1';

// Headers par défaut
const headers = {
  'Content-Type': 'application/json',
  'User-Agent': 'k6-load-test',
};

// Fonction principale
export default function () {
  const params = {
    headers: headers,
    timeout: '30s',
  };

  // Test 1: Health check
  const healthCheck = http.get(`${BASE_URL}/health`, params);
  check(healthCheck, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Test 2: Current regime
  const currentRegime = http.get(`${BASE_URL}/api/${API_VERSION}/regimes/current`, params);
  check(currentRegime, {
    'current regime status is 200': (r) => r.status === 200,
    'current regime has valid data': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data && body.data.regime;
    },
  });

  // Test 3: Regime history
  const historyParams = { ...params };
  historyParams.headers['X-Test-User'] = `user-${Math.floor(Math.random() * 1000)}`;
  
  const regimeHistory = http.get(`${BASE_URL}/api/${API_VERSION}/regimes/history?days=30`, historyParams);
  check(regimeHistory, {
    'regime history status is 200': (r) => r.status === 200,
    'regime history has data': (r) => {
      const body = JSON.parse(r.body);
      return body.success && Array.isArray(body.data);
    },
  });

  // Test 4: Allocations
  const allocations = http.get(`${BASE_URL}/api/${API_VERSION}/allocations/EXPANSION`, historyParams);
  check(allocations, {
    'allocations status is 200': (r) => r.status === 200,
    'allocations has valid data': (r) => {
      const body = JSON.parse(r.body);
      return body.success && Array.isArray(body.data);
    },
  });

  // Test 5: Sector data
  const sectorData = http.get(`${BASE_URL}/api/${API_VERSION}/sectors/technology/indicators`, historyParams);
  check(sectorData, {
    'sector data status is 200': (r) => r.status === 200,
    'sector data has indicators': (r) => {
      const body = JSON.parse(r.body);
      return body.success && Array.isArray(body.data);
    },
  });

  // Test 6: Data freshness
  const dataFreshness = http.get(`${BASE_URL}/api/${API_VERSION}/data/freshness`, historyParams);
  check(dataFreshness, {
    'data freshness status is 200': (r) => r.status === 200,
    'data freshness has sectors': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data && body.data.sectors;
    },
  });

  // Test 7: Export data (simulation)
  const exportParams = { ...historyParams };
  exportParams.headers['Accept'] = 'text/csv';
  
  const exportData = http.get(`${BASE_URL}/api/${API_VERSION}/export?format=csv&period=30`, exportParams);
  check(exportData, {
    'export status is 200': (r) => r.status === 200,
    'export returns CSV': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('text/csv'),
  });

  // Test 8: Analytics event (simulation)
  const analyticsEvent = {
    name: 'page_view',
    properties: {
      page: '/dashboard',
      userAgent: 'k6-load-test',
      timestamp: new Date().toISOString(),
    },
    sessionId: `session-${Math.floor(Math.random() * 10000)}`,
  };

  const analyticsResponse = http.post(
    `${BASE_URL}/api/${API_VERSION}/analytics`,
    JSON.stringify({ events: [analyticsEvent] }),
    historyParams
  );
  check(analyticsResponse, {
    'analytics status is 200': (r) => r.status === 200,
  });

  // Test 9: Feedback submission (simulation)
  const feedback = {
    type: 'suggestion',
    message: 'Test feedback from k6 load test',
    sessionId: `session-${Math.floor(Math.random() * 10000)}`,
    userAgent: 'k6-load-test',
    page: '/dashboard',
  };

  const feedbackResponse = http.post(
    `${BASE_URL}/api/${API_VERSION}/feedback`,
    JSON.stringify(feedback),
    historyParams
  );
  check(feedbackResponse, {
    'feedback status is 200': (r) => r.status === 200,
  });

  // Test 10: Confusion matrix
  const confusionMatrix = http.get(`${BASE_URL}/api/${API_VERSION}/regimes/confusion-matrix`, historyParams);
  check(confusionMatrix, {
    'confusion matrix status is 200': (r) => r.status === 200,
    'confusion matrix has data': (r) => {
      const body = JSON.parse(r.body);
      return body.success && body.data && body.data.stability !== undefined;
    },
  });

  // Gestion des erreurs
  const responses = [healthCheck, currentRegime, regimeHistory, allocations, sectorData, dataFreshness, exportData, analyticsResponse, feedbackResponse, confusionMatrix];
  
  responses.forEach(response => {
    if (response.status !== 200) {
      errorRate.add(1);
      console.error(`Error: ${response.status} - ${response.url}`);
    } else {
      errorRate.add(0);
    }
  });

  // Pause entre les requêtes
  sleep(Math.random() * 3 + 1); // 1-4 secondes
}

// Fonction de setup (optionnelle)
export function setup() {
  console.log('Starting load test for Oracle Portfolio API');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API Version: ${API_VERSION}`);
  
  // Test de connectivité initial
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error(`Health check failed: ${healthCheck.status}`);
  }
  
  console.log('Setup completed successfully');
}

// Fonction de teardown (optionnelle)
export function teardown(data) {
  console.log('Load test completed');
  console.log('Final metrics:');
  console.log(`- Total requests: ${data.metrics.http_reqs?.values?.count || 0}`);
  console.log(`- Error rate: ${data.metrics.http_req_failed?.values?.rate || 0}`);
  console.log(`- Avg response time: ${data.metrics.http_req_duration?.values?.avg || 0}ms`);
} 