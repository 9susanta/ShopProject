// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5120/api',
  signalRHub: 'http://localhost:5120/hubs/import-progress',
  enableSignalR: true,
  cacheTTL: 300000, // 5 minutes in milliseconds
  defaultPageSize: 20,
};
