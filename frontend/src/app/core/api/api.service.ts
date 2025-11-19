import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retryWhen, delayWhen, take, concatMap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { CacheService } from '../cache/cache.service';

export interface ApiOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, any>;
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Build full URL from base URL and endpoint
   */
  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }

  /**
   * Clean params object by removing undefined, null, and empty string values
   * Also converts to HttpParams to ensure proper serialization
   */
  private cleanParams(params?: HttpParams | Record<string, any>): HttpParams | undefined {
    if (!params) return undefined;
    
    let paramsObj: Record<string, any> = {};
    
    if (params instanceof HttpParams) {
      // For HttpParams, extract values
      params.keys().forEach(key => {
        const value = params.get(key);
        if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
          paramsObj[key] = value;
        }
      });
    } else {
      // For plain objects, filter out undefined/null/empty/string "undefined" values
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
          paramsObj[key] = value;
        }
      });
    }
    
    // Return undefined if no valid params, otherwise create HttpParams
    if (Object.keys(paramsObj).length === 0) {
      return undefined;
    }
    
    // Convert to HttpParams for proper URL encoding
    let httpParams = new HttpParams();
    Object.keys(paramsObj).forEach(key => {
      httpParams = httpParams.set(key, paramsObj[key]);
    });
    return httpParams;
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
      if (cached) {
        return new Observable(observer => {
          observer.next(cached);
          observer.complete();
        });
      }
    }

    let request$ = this.http.get<T>(url, {
      headers: options?.headers,
      params: this.cleanParams(options?.params),
    });

    // Add retry logic
    if (options?.retry !== false) {
      const retryCount = options?.retryCount || 3;
      const retryDelay = options?.retryDelay || 1000;
      request$ = request$.pipe(
        retryWhen(errors =>
          errors.pipe(
            delayWhen((error, index) => {
              if (index < retryCount && this.isRetryableError(error)) {
                return timer(retryDelay * (index + 1));
              }
              return throwError(() => error);
            }),
            take(retryCount + 1),
            concatMap(error => throwError(() => error))
          )
        )
      );
    }

    return request$.pipe(
      catchError(error => {
        // Try to return cached data on error if caching is enabled
        if (options?.cache) {
          const cached = this.cache.get<T>(cacheKey);
          if (cached) {
            return new Observable<T>(observer => {
              observer.next(cached);
              observer.complete();
            });
          }
        }
        return this.handleError(error);
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
      params: this.cleanParams(options?.params),
    };

    return this.http.post<T>(url, body, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any, options?: ApiOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = {
      headers: options?.headers,
      params: this.cleanParams(options?.params),
    };

    return this.http.put<T>(url, body, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: ApiOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const httpOptions = {
      headers: options?.headers,
      params: this.cleanParams(options?.params),
    };

    return this.http.delete<T>(url, httpOptions).pipe(
      catchError(this.handleError)
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
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<T>(url, formData, {
      reportProgress: true,
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST request with FormData (for file uploads with form fields)
   */
  postFormData<T>(endpoint: string, formData: FormData, options?: ApiOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    return this.http.post<T>(url, formData, {
      headers: options?.headers,
      params: this.cleanParams(options?.params),
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Chunked file upload with retry
   */
  uploadFileChunked<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Observable<T> {
    const chunkSize = environment.chunkSize;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedChunks = 0;

    // For simplicity, upload entire file
    // In production, implement actual chunking
    return this.uploadFile<T>(endpoint, file).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Download file
   */
  downloadFile(endpoint: string, filename?: string): Observable<Blob> {
    const url = this.buildUrl(endpoint);
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  };

  private isRetryableError(error: any): boolean {
    if (error instanceof HttpErrorResponse) {
      const status = error.status;
      // Retry on network errors or 5xx server errors
      return status === 0 || status >= 500 || status === 429;
    }
    return false;
  }
}

