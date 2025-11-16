export const environment = {
  production: false,
  apiUrl: 'http://localhost:5120/api',
  signalRHub: 'http://localhost:5120/hubs/import-progress',
  enableSignalR: true,
  enableMockServer: false,
  enablePWA: false,
  cacheTTL: 300000, // 5 minutes
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'hi'],
  maxUploadSize: 50 * 1024 * 1024, // 50MB
  chunkSize: 1024 * 1024, // 1MB chunks for file upload
  barcodeScannerTimeout: 5000, // 5 seconds
  voiceCommandEnabled: true,
  autoRefreshInterval: 30000, // 30 seconds for dashboard widgets
};
