import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { CacheService } from './cache.service';
import { environment } from '../../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let cacheService: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, CacheService],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
    cacheService = TestBed.inject(CacheService);
  });

  afterEach(() => {
    httpMock.verify();
    cacheService.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should make GET request', () => {
    const mockData = { id: 1, name: 'Test' };
    const endpoint = 'test';

    service.get(endpoint).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/${endpoint}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should cache GET response when cache option is enabled', () => {
    const mockData = { id: 1, name: 'Test' };
    const endpoint = 'test';
    const cacheKey = 'test_cache';

    // First request
    service.get(endpoint, { cache: true, cacheKey }).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req1 = httpMock.expectOne(`${environment.apiUrl}/${endpoint}`);
    req1.flush(mockData);

    // Second request should use cache
    service.get(endpoint, { cache: true, cacheKey }).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    // Should not make another HTTP request
    httpMock.expectNone(`${environment.apiUrl}/${endpoint}`);
  });

  it('should make POST request', () => {
    const mockData = { id: 1, name: 'Test' };
    const endpoint = 'test';
    const body = { name: 'Test' };

    service.post(endpoint, body).subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/${endpoint}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(mockData);
  });

  it('should handle errors', () => {
    const endpoint = 'test';
    const errorMessage = 'Server error';

    service.get(endpoint).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(error).toBeTruthy();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/${endpoint}`);
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });
});


