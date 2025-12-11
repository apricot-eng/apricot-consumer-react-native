/**
 * Logger utility with configurable verbosity
 * Can be enabled/disabled via environment variable or config
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  enabled: boolean;
  verbose: boolean;
  level: LogLevel;
}

// Get config from environment or default to development settings
const getConfig = (): LogConfig => {
  // Check for explicit env var first
  const envEnabled = process.env.EXPO_PUBLIC_LOG_ENABLED;
  const envVerbose = process.env.EXPO_PUBLIC_LOG_VERBOSE;
  
  return {
    enabled: envEnabled !== 'false', // Default to true in dev
    verbose: envVerbose === 'true' || __DEV__, // Verbose in dev by default
    level: (process.env.EXPO_PUBLIC_LOG_LEVEL as LogLevel) || 'debug',
  };
};

const config = getConfig();

const shouldLog = (level: LogLevel): boolean => {
  if (!config.enabled) return false;
  
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(config.level);
  const messageLevelIndex = levels.indexOf(level);
  
  return messageLevelIndex >= currentLevelIndex;
};

const formatMessage = (tag: string, message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
  return `[${timestamp}] [${tag}] ${message}${dataStr}`;
};

export const logger = {
  debug: (tag: string, message: string, data?: any) => {
    if (shouldLog('debug')) {
      console.log(formatMessage(tag, message, data));
    }
  },
  
  info: (tag: string, message: string, data?: any) => {
    if (shouldLog('info')) {
      console.log(formatMessage(tag, message, data));
    }
  },
  
  warn: (tag: string, message: string, data?: any) => {
    if (shouldLog('warn')) {
      console.warn(formatMessage(tag, message, data));
    }
  },
  
  error: (tag: string, message: string, error?: any, data?: any) => {
    if (shouldLog('error')) {
      const errorData = error instanceof Error 
        ? { message: error.message, stack: error.stack, ...error }
        : error;
      console.error(formatMessage(tag, message, { error: errorData, ...data }));
    }
  },
  
  api: {
    request: (method: string, url: string, config?: any, data?: any) => {
      if (config.verbose) {
        logger.debug('API_REQUEST', `${method} ${url}`, {
          headers: config?.headers,
          params: config?.params,
          data,
        });
      }
    },
    
    response: (method: string, url: string, response: any, data?: any) => {
      if (config.verbose) {
        logger.debug('API_RESPONSE', `${method} ${url}`, {
          status: response?.status,
          statusText: response?.statusText,
          headers: response?.headers,
          data: data || response?.data,
        });
      }
    },
    
    error: (method: string, url: string, error: any) => {
      logger.error('API_ERROR', `${method} ${url}`, error, {
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        config: error?.config,
      });
    },
  },
  
  // Helper to log JSON responses in a readable format
  json: (tag: string, message: string, json: any) => {
    if (config.verbose) {
      try {
        const formatted = JSON.stringify(json, null, 2);
        logger.debug(tag, `${message}\n${formatted}`);
      } catch (e) {
        logger.warn(tag, `${message} (failed to stringify)`, json);
      }
    }
  },
};

// Export config for checking
export const isLoggingEnabled = () => config.enabled;
export const isVerboseLogging = () => config.verbose;
