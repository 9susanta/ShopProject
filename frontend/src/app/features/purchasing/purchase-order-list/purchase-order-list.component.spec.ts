import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseOrderListComponent } from './purchase-order-list.component';
import { PurchasingService } from '@core/services/purchasing.service';
import { ToastService } from '@core/toast/toast.service';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { of } from 'rxjs';

describe('PurchaseOrderListComponent', () => {
  let component: PurchaseOrderListComponent;
  let fixture: ComponentFixture<PurchaseOrderListComponent>;
  let purchasingService: jasmine.SpyObj<PurchasingService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const purchasingServiceSpy = jasmine.createSpyObj('PurchasingService', ['getPurchaseOrders']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['error', 'success', 'warning']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole']);

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderListComponent],
      providers: [
        { provide: PurchasingService, useValue: purchasingServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    purchasingService = TestBed.inject(PurchasingService) as jasmine.SpyObj<PurchasingService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    purchasingService.getPurchaseOrders.and.returnValue(
      of({
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 20,
        totalPages: 0,
      })
    );
    authService.hasRole.and.returnValue(false);

    fixture = TestBed.createComponent(PurchaseOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load purchase orders on init', () => {
    expect(purchasingService.getPurchaseOrders).toHaveBeenCalled();
  });

  it('should navigate to create PO on createNew', () => {
    component.createNew();
    expect(router.navigate).toHaveBeenCalledWith(['/purchasing/purchase-orders/new']);
  });
});

