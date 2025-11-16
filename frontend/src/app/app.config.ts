import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    // Zoneless Change Detection (must be first)
    provideZonelessChangeDetection(),
    
    // Router with modern features
    provideRouter(
      routes,
      withComponentInputBinding() // Enable component input binding from route params
      // Removed withViewTransitions() to fix transition errors
    ),
    
    // HTTP Client with interceptors
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    
    // Animations
    provideAnimations(),
    
    // Client hydration for SSR (if needed)
    provideClientHydration(),
    
    // Translation
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: environment.defaultLanguage || 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    
    // PWA Service Worker (only in production)
    // Note: registerWhenStable doesn't work in zoneless mode, use registerImmediately instead
    ...(environment.enablePWA && environment.production
      ? [
          provideServiceWorker('ngsw-worker.js', {
            enabled: environment.production,
            registrationStrategy: 'registerImmediately',
          }),
        ]
      : []),
  ],
};

