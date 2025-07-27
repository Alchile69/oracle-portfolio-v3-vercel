const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');
const { defineSecret } = require('firebase-functions/params');
const fetch = require('node-fetch');

// 🔧 Define secrets - CORRECTED
const fredApiKey = defineSecret('FRED_API_KEY');
const alphaVantageApiKey = defineSecret('ALPHA_VANTAGE_API_KEY');

// 🔧 Global options - CORRECTED
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  secrets: [fredApiKey, alphaVantageApiKey]
});

// 🌐 CORS Configuration - CORRECTED
const ALLOWED_ORIGINS = [
  'https://oracle-portfolio-prod.web.app',
  'https://oracle-portfolio-prod.firebaseapp.com',
  'http://localhost:3000',
  'http://localhost:5000'
];

// 🔄 Utility function for API calls with retry - IMPROVED
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Fetching (attempt ${i + 1}):`, url);
      
      const response = await fetch(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Oracle-Portfolio/1.0',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Success on attempt ${i + 1}`);
      return data;
      
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      if (i === retries - 1) {
        console.error(`All ${retries} attempts failed for:`, url);
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}

// 📊 Economic Regime Configuration - ENHANCED
const REGIME_CONFIG = {
  FRA: {
    name: 'France',
    regime_base: 'EXPANSION',
    confidence_base: 0.85,
    allocations: {
      stocks: 65,
      bonds: 25,
      commodities: 5,
      cash: 5,
    },
    indicators: {
      growth: 0.025,
      inflation: 0.028,
      unemployment: 0.075
    }
  },
  DEU: {
    name: 'Germany',
    regime_base: 'STAGFLATION',
    confidence_base: 0.72,
    allocations: {
      stocks: 40,
      bonds: 20,
      commodities: 30,
      cash: 10,
    },
    indicators: {
      growth: 0.018,
      inflation: 0.032,
      unemployment: 0.055
    }
  },
  USA: {
    name: 'United States',
    regime_base: 'RECOVERY',
    confidence_base: 0.91,
    allocations: {
      stocks: 70,
      bonds: 15,
      commodities: 10,
      cash: 5,
    },
    indicators: {
      growth: 0.035,
      inflation: 0.025,
      unemployment: 0.045
    }
  },
  GBR: {
    name: 'United Kingdom',
    regime_base: 'EXPANSION',
    confidence_base: 0.78,
    allocations: {
      stocks: 60,
      bonds: 30,
      commodities: 5,
      cash: 5,
    },
    indicators: {
      growth: 0.022,
      inflation: 0.030,
      unemployment: 0.065
    }
  }
};

// 🌐 CORS Middleware - COMPLETELY REWRITTEN
const withCors = (handler) =>
  onRequest({ 
    secrets: [fredApiKey, alphaVantageApiKey],
    cors: true // Enable automatic CORS
  }, async (req, res) => {
    // Enhanced CORS headers
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    } else {
      res.set('Access-Control-Allow-Origin', '*'); // Fallback for development
    }
    
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Max-Age', '86400');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      // Get API keys safely
      const API_KEYS = {
        fred: fredApiKey.value() || 'demo_key',
        alpha_vantage: alphaVantageApiKey.value() || 'demo'
      };
      
      console.log('API Keys status:', {
        fred: API_KEYS.fred !== 'demo_key' ? 'CONFIGURED' : 'USING_DEMO',
        alpha_vantage: API_KEYS.alpha_vantage !== 'demo' ? 'CONFIGURED' : 'USING_DEMO'
      });
      
      await handler(req, res, API_KEYS);
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  });

// 📍 Market Stress Function - FIXED
exports.getMarketStress = withCors(async (req, res, API_KEYS) => {
  try {
    console.log('=== getMarketStress START ===');
    
    let vix = 20.5; // Realistic default
    let highYieldSpread = 3.2; // Realistic default
    let stressLevel = 'MODÉRÉ';
    let dataSource = 'fallback';

    // Only try real API if we have real keys
    if (API_KEYS.fred !== 'demo_key') {
      try {
        // Fetch VIX from FRED
        const vixUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=VIXCLS&api_key=${API_KEYS.fred}&file_type=json&limit=1&sort_order=desc`;
        const vixResponse = await fetchWithRetry(vixUrl);

        if (vixResponse.observations && vixResponse.observations.length > 0) {
          const vixValue = vixResponse.observations[0].value;
          if (vixValue && vixValue !== '.') {
            vix = parseFloat(vixValue);
            dataSource = 'fred_api';
            console.log('VIX from FRED:', vix);
          }
        }

        // Fetch High Yield Spread from FRED
        const hyUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=BAMLH0A0HYM2EY&api_key=${API_KEYS.fred}&file_type=json&limit=1&sort_order=desc`;
        const hyResponse = await fetchWithRetry(hyUrl);

        if (hyResponse.observations && hyResponse.observations.length > 0) {
          const hyValue = hyResponse.observations[0].value;
          if (hyValue && hyValue !== '.') {
            highYieldSpread = parseFloat(hyValue);
            console.log('High Yield Spread from FRED:', highYieldSpread);
          }
        }

      } catch (apiError) {
        console.error('FRED API Error, using fallback:', apiError.message);
        dataSource = 'fallback_after_error';
      }
    } else {
      console.log('Using demo key, skipping real API calls');
      dataSource = 'demo_mode';
    }

    // Calculate stress level based on data
    if (vix < 15 && highYieldSpread < 2) {
      stressLevel = 'FAIBLE';
    } else if (vix < 25 && highYieldSpread < 4) {
      stressLevel = 'MODÉRÉ';
    } else if (vix < 35 && highYieldSpread < 6) {
      stressLevel = 'ÉLEVÉ';
    } else {
      stressLevel = 'EXTRÊME';
    }

    const response = {
      success: true,
      stress_level: stressLevel,
      vix: Math.round(vix * 100) / 100,
      high_yield_spread: Math.round(highYieldSpread * 100) / 100,
      data_source: dataSource,
      data_sources: {
        vix: 'https://fred.stlouisfed.org/series/VIXCLS',
        spread: 'https://fred.stlouisfed.org/series/BAMLH0A0HYM2EY',
      },
      last_update: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    console.log('Market stress response:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('getMarketStress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market stress data',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 📍 Market Data Function - FIXED
exports.getMarketData = withCors(async (req, res, API_KEYS) => {
  try {
    console.log('=== getMarketData START ===');
    
    // Realistic fallback data
    let marketData = {
      tlt_price: 95.12,
      spy_price: 418.74,
      gld_price: 201.45,
      hyg_price: 78.23,
      data_source: 'fallback'
    };

    // Only try real API if we have real keys
    if (API_KEYS.alpha_vantage !== 'demo') {
      try {
        const etfs = ['TLT', 'SPY', 'GLD', 'HYG'];
        let successCount = 0;
        
        for (const etf of etfs) {
          try {
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${etf}&apikey=${API_KEYS.alpha_vantage}`;
            const response = await fetchWithRetry(url);

            if (response['Global Quote'] && response['Global Quote']['05. price']) {
              const price = parseFloat(response['Global Quote']['05. price']);
              if (!isNaN(price) && price > 0) {
                marketData[`${etf.toLowerCase()}_price`] = Math.round(price * 100) / 100;
                successCount++;
                console.log(`${etf} price updated:`, price);
              }
            }
            
            // Rate limiting - wait between calls
            await new Promise(resolve => setTimeout(resolve, 1000));
            
          } catch (etfError) {
            console.error(`Error fetching ${etf}:`, etfError.message);
          }
        }
        
        if (successCount > 0) {
          marketData.data_source = 'alpha_vantage_partial';
        }
        if (successCount === etfs.length) {
          marketData.data_source = 'alpha_vantage_complete';
        }
        
      } catch (apiError) {
        console.error('Alpha Vantage API Error, using fallback:', apiError.message);
        marketData.data_source = 'fallback_after_error';
      }
    } else {
      console.log('Using demo key, skipping Alpha Vantage calls');
      marketData.data_source = 'demo_mode';
    }

    const response = {
      success: true,
      market_data: marketData,
      timestamp: new Date().toISOString(),
      last_update: new Date().toISOString()
    };

    console.log('Market data response:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('getMarketData error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market data',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 📍 Allocations Function - ENHANCED
exports.getAllocations = withCors(async (req, res, API_KEYS) => {
  try {
    console.log('=== getAllocations START ===');
    
    const country = (req.query.country || 'FRA').toUpperCase();
    const config = REGIME_CONFIG[country] || REGIME_CONFIG['FRA'];

    console.log(`Getting allocations for country: ${country}`);

    const response = {
      success: true,
      country,
      country_name: config.name,
      data: {
        regime: config.regime_base,
        confidence: config.confidence_base,
        allocations: config.allocations,
        indicators: config.indicators
      },
      // Legacy format for backward compatibility
      allocation: {
        actions: config.allocations.stocks,
        obligations: config.allocations.bonds,
        or: config.allocations.commodities,
        cash: config.allocations.cash
      },
      timestamp: new Date().toISOString(),
      last_update: new Date().toISOString()
    };

    console.log('Allocations response:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('getAllocations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch allocation data',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 📍 Regime Function - ENHANCED
exports.getRegime = withCors(async (req, res, API_KEYS) => {
  try {
    console.log('=== getRegime START ===');
    
    const country = (req.query.country || 'FRA').toUpperCase();
    const config = REGIME_CONFIG[country] || REGIME_CONFIG['FRA'];

    let regime = config.regime_base;
    let confidence = config.confidence_base;
    let dataSource = 'config';

    console.log(`Getting regime for country: ${country}`);

    // Only try real API if we have real keys
    if (API_KEYS.fred !== 'demo_key') {
      try {
        // Fetch PMI from FRED (US Manufacturing PMI)
        const pmiUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=MANEMP&api_key=${API_KEYS.fred}&file_type=json&limit=1&sort_order=desc`;
        const pmiResponse = await fetchWithRetry(pmiUrl);

        if (pmiResponse.observations && pmiResponse.observations.length > 0) {
          const pmiValue = pmiResponse.observations[0].value;
          if (pmiValue && pmiValue !== '.') {
            const pmi = parseFloat(pmiValue);
            console.log('PMI from FRED:', pmi);
            
            // Adjust regime based on PMI
            if (pmi > 50) {
              regime = 'EXPANSION';
              confidence = Math.min(0.95, confidence + 0.1);
            } else if (pmi < 45) {
              regime = 'RECESSION';
              confidence = Math.max(0.6, confidence - 0.1);
            }
            
            dataSource = 'fred_api';
          }
        }
      } catch (apiError) {
        console.error('PMI API Error, using base regime:', apiError.message);
        dataSource = 'config_after_error';
      }
    } else {
      console.log('Using demo key, skipping PMI API call');
      dataSource = 'demo_mode';
    }

    const response = {
      success: true,
      country,
      country_name: config.name,
      regime,
      confidence: Math.round(confidence * 1000) / 1000,
      data_source: dataSource,
      indicators: config.indicators,
      timestamp: new Date().toISOString(),
      last_update: new Date().toISOString()
    };

    console.log('Regime response:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('getRegime error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regime data',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 📍 Countries Function - ENHANCED
exports.getCountries = withCors(async (req, res, API_KEYS) => {
  try {
    console.log('=== getCountries START ===');
    
    const countries = Object.entries(REGIME_CONFIG).map(([code, config]) => ({
      code,
      name: config.name,
      regime: config.regime_base,
      confidence: config.confidence_base,
      allocations: config.allocations,
      indicators: config.indicators,
      last_update: new Date().toISOString()
    }));

    const response = {
      success: true,
      countries,
      total_countries: countries.length,
      timestamp: new Date().toISOString(),
      last_update: new Date().toISOString()
    };

    console.log('Countries response:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('getCountries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch countries data',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 📍 Health Check Function - NEW
exports.getHealth = withCors(async (req, res, API_KEYS) => {
  try {
    console.log('=== getHealth START ===');
    
    const health = {
      success: true,
      status: 'healthy',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      services: {
        functions: 'operational',
        cors: 'configured',
        secrets: {
          fred: API_KEYS.fred !== 'demo_key' ? 'configured' : 'demo_mode',
          alpha_vantage: API_KEYS.alpha_vantage !== 'demo' ? 'configured' : 'demo_mode'
        }
      },
      endpoints: [
        'getMarketStress',
        'getMarketData', 
        'getAllocations',
        'getRegime',
        'getCountries',
        'getHealth'
      ],
      supported_countries: Object.keys(REGIME_CONFIG)
    };

    console.log('Health check response:', health);
    res.status(200).json(health);

  } catch (error) {
    console.error('getHealth error:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 📊 Backtesting Module (Sprint 1 - Étape 1A) - AJOUTÉ
const backtesting = require('./backtesting');
exports.getBacktesting = backtesting.getBacktesting;
exports.getBacktestingHealth = backtesting.getBacktestingHealth;