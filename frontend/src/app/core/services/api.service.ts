import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CacheService } from './cache.service';

export interface ApiOptions {
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: any };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) {}

  /**
   * Build full URL from base URL and endpoint
   */
  private buildUrl(endpoint: string): string {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    // Remove trailing slash from baseUrl if present
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }

  /**
   * GET request with optional caching
   */
  get<T>(endpoint: string, options?: ApiOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const cacheKey = options?.cacheKey || `get_${endpoint}`;

    // Check cache first
    if (options?.cache) {
      const cached = this.cache.get<T>(cacheKey);
      if (cached !== null) {
        return of(cached);
      }
    }

    // Make HTTP request
    const httpOptions = {
      headers: options?.headers,
      params: options?.params,
    };

    return this.http.get<T>(url, httpOptions).pipe(
      map((data) => {
        // Cache the response if caching is enabled
        if (options?.cache) {
          this.cache.set(cacheKey, data, options.cacheTTL);
        }
        return data;
      }),
      catchError((error) => {
        console.error(`API GET error for ${endpoint}:`, error);
        throw error;
      })
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any, options?: ApiOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = {
      headers: options?.headers,
      params: options?.params,
    };

    return this.http.post<T>(url, body, httpOptions).pipe(
      catchError((error) => {
        console.error(`API POST error for ${endpoint}:`, error);
        throw error;
      })
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any, options?: ApiOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = {
      headers: options?.headers,
      params: options?.params,
    };

    return this.http.put<T>(url, body, httpOptions).pipe(
      catchError((error) => {
        console.error(`API PUT error for ${endpoint}:`, error);
        throw error;
      })
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: ApiOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = {
      headers: options?.headers,
      params: options?.params,
    };

    return this.http.delete<T>(url, httpOptions).pipe(
      catchError((error) => {
        console.error(`API DELETE error for ${endpoint}:`, error);
        throw error;
      })
    );
  }

  /**
   * File upload (multipart/form-data)
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: { [key: string]: any }): Observable<T> {
    const url = this.buildUrl(endpoint);
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach((key) => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<T>(url, formData).pipe(
      catchError((error) => {
        console.error(`API upload error for ${endpoint}:`, error);
        throw error;
      })
    );
  }

  /**
   * Download file
   */
  downloadFile(endpoint: string, filename?: string): Observable<Blob> {
    const url = this.buildUrl(endpoint);
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((blob) => {
        if (filename) {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(link.href);
        }
        return blob;
      }),
      catchError((error) => {
        console.error(`API download error for ${endpoint}:`, error);
        throw error;
      })
    );
  }
}


