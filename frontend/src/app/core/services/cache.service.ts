import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = environment.cacheTTL;
  private readonly useLocalStorage = true; // Can be configured via environment

  constructor() {
    // Clean up expired entries on initialization
    this.cleanup();
  }

  /**
   * Get data from cache (memory first, then localStorage fallback)
   */
  get<T>(key: string): T | null {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data as T;
    }

    // Try localStorage
    if (this.useLocalStorage) {
      try {
        const stored = localStorage.getItem(this.getStorageKey(key));
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored);
          if (!this.isExpired(entry)) {
            // Restore to memory cache
            this.memoryCache.set(key, entry);
            return entry.data;
          } else {
            // Remove expired entry
            localStorage.removeItem(this.getStorageKey(key));
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }

    return null;
  }

  /**
   * Set data in cache (memory + localStorage)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    // Store in memory
    this.memoryCache.set(key, entry);

    // Store in localStorage
    if (this.useLocalStorage) {
      try {
        localStorage.setItem(this.getStorageKey(key), JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to write to localStorage (may be full):', error);
      }
    }
  }

  /**
   * Remove entry from cache
   */
  remove(key: string): void {
    this.memoryCache.delete(key);
    if (this.useLocalStorage) {
      try {
        localStorage.removeItem(this.getStorageKey(key));
      } catch (error) {
        console.warn('Failed to remove from localStorage:', error);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
    if (this.useLocalStorage) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToRemove: string[] = [];

    // Find keys in memory
    this.memoryCache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToRemove.push(key);
      }
    });

    // Remove from memory
    keysToRemove.forEach((key) => this.memoryCache.delete(key));

    // Remove from localStorage
    if (this.useLocalStorage) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith('cache_') && regex.test(key.replace('cache_', ''))) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to invalidate localStorage pattern:', error);
      }
    }
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private getStorageKey(key: string): string {
    return `cache_${key}`;
  }

  private cleanup(): void {
    // Remove expired entries from memory
    this.memoryCache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    });

    // Cleanup localStorage (run periodically)
    if (this.useLocalStorage) {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith('cache_')) {
            try {
              const entry: CacheEntry<any> = JSON.parse(localStorage.getItem(key) || '{}');
              if (this.isExpired(entry)) {
                localStorage.removeItem(key);
              }
            } catch {
              // Invalid entry, remove it
              localStorage.removeItem(key);
            }
          }
        });
      } catch (error) {
        console.warn('Cache cleanup failed:', error);
      }
    }
  }
}


