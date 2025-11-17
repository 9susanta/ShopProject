import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { ProductCreateComponent } from './product-create.component';
import { ProductService } from '../services/product.service';
import { MasterDataService } from '@core/services/master-data.service';
import { CategoryService } from '@core/services/category.service';
import { ToastService } from '@core/toast/toast.service';
import { BarcodeScannerService } from '@core/services/barcode-scanner.service';
import { CategoryDto } from '@core/models/category.model';
import { TaxSlabDto } from '@core/models/taxslab.model';
import { UnitDto, UnitType } from '@core/models/unit.model';
import { Product } from '@core/models/product.model';

describe('ProductCreateComponent', () => {
  let component: ProductCreateComponent;
  let fixture: ComponentFixture<ProductCreateComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let masterDataService: jasmine.SpyObj<MasterDataService>;
  let categoryService: jasmine.SpyObj<CategoryService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockCategories: CategoryDto[] = [
    {
      id: 'cat1',
      name: 'Category 1',
      taxSlabId: 'tax1',
      taxSlab: { id: 'tax1', name: 'GST 5%', rate: 5, isDefault: false, isActive: true },
      isActive: true,
    },
  ];

  const mockTaxSlabs: TaxSlabDto[] = [
    { id: 'tax1', name: 'GST 5%', rate: 5, isDefault: false, isActive: true },
    { id: 'tax2', name: 'GST 12%', rate: 12, isDefault: false, isActive: true },
  ];

  const mockUnits: UnitDto[] = [
    { id: 'unit1', name: 'Kilogram', symbol: 'kg', type: UnitType.Kilogram, sortOrder: 1, isActive: true },
    { id: 'unit2', name: 'Piece', symbol: 'pc', type: UnitType.Piece, sortOrder: 2, isActive: true },
  ];

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['createProduct', 'getProductByBarcode']);
    const masterDataServiceSpy = jasmine.createSpyObj('MasterDataService', ['getCategories', 'getTaxSlabs', 'getUnits', 'addCategoryToCache']);
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['createCategory']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [ProductCreateComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: MasterDataService, useValue: masterDataServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: BarcodeScannerService, useValue: {} },
      ],
    }).compileComponents();

    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    masterDataService = TestBed.inject(MasterDataService) as jasmine.SpyObj<MasterDataService>;
    categoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    // Setup default return values
    masterDataService.getCategories.and.returnValue(of(mockCategories));
    masterDataService.getTaxSlabs.and.returnValue(of(mockTaxSlabs));
    masterDataService.getUnits.and.returnValue(of(mockUnits));
    productService.getProductByBarcode.and.returnValue(throwError(() => new Error('Not found')));

    fixture = TestBed.createComponent(ProductCreateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    fixture.detectChanges();
    expect(component.productForm.invalid).toBeTrue();
  });

  it('should auto-fill taxSlabId when category is selected', () => {
    fixture.detectChanges();
    
    // Set category
    component.productForm.patchValue({ categoryId: 'cat1' });
    component.onCategoryChange('cat1');
    
    expect(component.productForm.get('taxSlabId')?.value).toBe('tax1');
  });

  it('should call ProductService.createProduct with correct payload on submit', () => {
    fixture.detectChanges();
    
    // Setup form with valid data
    component.productForm.patchValue({
      name: 'Test Product',
      sku: 'SKU001',
      categoryId: 'cat1',
      taxSlabId: 'tax1',
      unitId: 'unit1',
      mrp: 100,
      salePrice: 90,
      lowStockThreshold: 10,
      isActive: true,
    });

    // Mock dialog to return true (confirmed)
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(true));
    dialog.open.and.returnValue(dialogRefSpy);

    // Mock successful product creation
    const createdProduct: Product = {
      id: 'prod1',
      name: 'Test Product',
      sku: 'SKU001',
      mrp: 100,
      salePrice: 90,
      categoryId: 'cat1',
      unitId: 'unit1',
      lowStockThreshold: 10,
      isActive: true,
    } as Product;
    productService.createProduct.and.returnValue(of(createdProduct));

    // Mock snackbar
    const snackBarRefSpy = jasmine.createSpyObj('MatSnackBarRef', ['onAction']);
    snackBarRefSpy.onAction.and.returnValue(of(null));
    snackBar.open.and.returnValue(snackBarRefSpy);

    // Submit form
    component.onSubmit();

    // Verify createProduct was called with correct payload
    expect(productService.createProduct).toHaveBeenCalled();
    const callArgs = productService.createProduct.calls.mostRecent().args[0];
    expect(callArgs.name).toBe('Test Product');
    expect(callArgs.categoryId).toBe('cat1');
    expect(callArgs.taxSlabId).toBe('tax1');
    expect(callArgs.unitId).toBe('unit1');
    expect(callArgs.mrp).toBe(100);
    expect(callArgs.salePrice).toBe(90);
  });

  it('should validate salePrice <= mrp', () => {
    fixture.detectChanges();
    
    component.productForm.patchValue({
      mrp: 100,
      salePrice: 150, // Exceeds MRP
    });

    const salePriceControl = component.productForm.get('salePrice');
    expect(salePriceControl?.hasError('salePriceExceedsMRP')).toBeTrue();
  });

  it('should show duplicate warning when barcode exists', (done) => {
    fixture.detectChanges();
    
    const duplicateProduct: Product = {
      id: 'prod1',
      name: 'Existing Product',
      barcode: '123456',
    } as Product;

    productService.getProductByBarcode.and.returnValue(of(duplicateProduct));

    component.productForm.patchValue({ barcode: '123456' });
    component.barcodeCheckSubject.next('123456');

    setTimeout(() => {
      expect(component.duplicateProductWarning()).toBeTruthy();
      expect(component.duplicateProductWarning()?.name).toBe('Existing Product');
      done();
    }, 600); // Wait for debounce
  });
});

