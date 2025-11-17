import { TestBed } from '@angular/core/testing';
import { PurchasingService } from './purchasing.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';

describe('PurchasingService', () => {
  let service: PurchasingService;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put']);

    TestBed.configureTestingModule({
      providers: [
        PurchasingService,
        { provide: ApiService, useValue: apiServiceSpy },
      ],
    });

    service = TestBed.inject(PurchasingService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get purchase orders', () => {
    const mockResponse = {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 20,
      totalPages: 0,
    };
    apiService.get.and.returnValue(of(mockResponse));

    service.getPurchaseOrders().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    expect(apiService.get).toHaveBeenCalledWith('purchasing/purchase-orders', jasmine.any(Object));
  });

  it('should create purchase order', () => {
    const mockRequest = {
      supplierId: 'supplier-1',
      items: [],
    };
    const mockResponse = {
      id: 'po-1',
      orderNumber: 'PO-001',
      ...mockRequest,
    };
    apiService.post.and.returnValue(of(mockResponse));

    service.createPurchaseOrder(mockRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    expect(apiService.post).toHaveBeenCalledWith('purchasing/purchase-orders', mockRequest);
  });
});

