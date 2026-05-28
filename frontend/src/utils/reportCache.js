const CACHE_PREFIX = 'carbonflow_report_';
const ANALYSIS_CACHE_PREFIX = 'carbonflow_analysis_';
const CACHE_EXPIRY_HOURS = 2; // Reports expire after 2 hours

/**
 * Generate a unique cache key for a producer-consumer pair
 */
const generateCacheKey = (producer, consumer) => {
  const producerId = producer.id || producer.name?.replace(/\s+/g, '_');
  const consumerId = consumer.id || consumer.name?.replace(/\s+/g, '_');
  return `${CACHE_PREFIX}${producerId}_${consumerId}`;
};

/**
 * Generate a unique cache key for producer analysis
 */
const generateAnalysisCacheKey = (producer) => {
  const producerId = producer.id || producer.name?.replace(/\s+/g, '_');
  return `${ANALYSIS_CACHE_PREFIX}${producerId}`;
};

/**
 * Cache an impact report with expiration
 */
export const cacheReport = (producer, consumer, reportData) => {
  try {
    const cacheKey = generateCacheKey(producer, consumer);
    const cacheData = {
      report: reportData,
      timestamp: Date.now(),
      producer: {
        id: producer.id,
        name: producer.name
      },
      consumer: {
        id: consumer.id,
        name: consumer.name
      }
    };

    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('Report cached:', cacheKey);
  } catch (error) {
    console.warn('Failed to cache report:', error);
  }
};

/**
 * Cache an analysis report for a producer
 */
export const cacheAnalysisReport = (producer, analysisData) => {
  try {
    const cacheKey = generateAnalysisCacheKey(producer);
    const cacheData = {
      analysis: analysisData,
      timestamp: Date.now(),
      producer: {
        id: producer.id,
        name: producer.name
      }
    };

    sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log('Analysis cached:', cacheKey);
  } catch (error) {
    console.warn('Failed to cache analysis:', error);
  }
};

/**
 * Retrieve a cached impact report if it exists and hasn't expired
 */
export const getCachedReport = (producer, consumer) => {
  try {
    const cacheKey = generateCacheKey(producer, consumer);
    const cachedData = sessionStorage.getItem(cacheKey);

    if (!cachedData) {
      return null;
    }

    const parsed = JSON.parse(cachedData);
    const now = Date.now();
    const expiryTime = parsed.timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);

    if (now > expiryTime) {
      sessionStorage.removeItem(cacheKey);
      console.log('⏰ Cached report expired and removed:', cacheKey);
      return null;
    }

    console.log('Found cached report:', cacheKey);
    return parsed.report;
  } catch (error) {
    console.warn('Failed to retrieve cached report:', error);
    return null;
  }
};

/**
 * Retrieve a cached analysis report if it exists and hasn't expired
 */
export const getCachedAnalysisReport = (producer) => {
  try {
    const cacheKey = generateAnalysisCacheKey(producer);
    const cachedData = sessionStorage.getItem(cacheKey);

    if (!cachedData) {
      return null;
    }

    const parsed = JSON.parse(cachedData);
    const now = Date.now();
    const expiryTime = parsed.timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);

    if (now > expiryTime) {
      sessionStorage.removeItem(cacheKey);
      console.log('⏰ Cached analysis expired and removed:', cacheKey);
      return null;
    }

    console.log('Found cached analysis:', cacheKey);
    return parsed.analysis;
  } catch (error) {
    console.warn('Failed to retrieve cached analysis:', error);
    return null;
  }
};

/**
 * Get all cached reports for the current session
 */
export const getAllCachedReports = () => {
  const cachedReports = [];

  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);

      if (key && key.startsWith(CACHE_PREFIX)) {
        const cachedData = sessionStorage.getItem(key);

        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const now = Date.now();
          const expiryTime = parsed.timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);

          if (now <= expiryTime) {
            cachedReports.push({
              key,
              producer: parsed.producer,
              consumer: parsed.consumer,
              timestamp: parsed.timestamp,
              report: parsed.report
            });
          } else {
            sessionStorage.removeItem(key);
          }
        }
      }
    }
  } catch (error) {
    console.warn('Failed to retrieve all cached reports:', error);
  }

  return cachedReports;
};

/**
 * Clear all cached reports
 */
export const clearAllCachedReports = () => {
  try {
    const keysToRemove = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith(CACHE_PREFIX) || key.startsWith(ANALYSIS_CACHE_PREFIX))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    console.log('Cleared all cached reports and analyses');
  } catch (error) {
    console.warn('Failed to clear cached reports:', error);
  }
};

/**
 * Check if a report exists for a specific producer-consumer pair
 */
export const hasReportForPair = (producer, consumer) => {
  return getCachedReport(producer, consumer) !== null;
};

/**
 * Check if an analysis exists for a specific producer
 */
export const hasAnalysisForProducer = (producer) => {
  return getCachedAnalysisReport(producer) !== null;
};