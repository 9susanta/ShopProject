export const environment = {
  production: true,
  apiUrl: 'http://localhost:5000/api', // Replace with production API URL
  signalRHub: 'http://localhost:5000/hubs/import', // Replace with production SignalR hub URL
  enableSignalR: true,
  cacheTTL: 300000, // 5 minutes in milliseconds
  defaultPageSize: 20,
};
