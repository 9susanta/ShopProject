import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportUploadComponent } from './import-upload.component';
import { ImportService } from './import.service';
import { SignalRService } from '../../core/services/signalr.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { FileImportComponent } from '../shared/components/file-import/file-import.component';

describe('ImportUploadComponent', () => {
  let component: ImportUploadComponent;
  let fixture: ComponentFixture<ImportUploadComponent>;
  let importService: jasmine.SpyObj<ImportService>;
  let signalRService: jasmine.SpyObj<SignalRService>;

  beforeEach(async () => {
    const importServiceSpy = jasmine.createSpyObj('ImportService', [
      'uploadFile',
      'startImport',
      'getImportStatus',
      'pollImportStatus',
    ]);
    const signalRServiceSpy = jasmine.createSpyObj('SignalRService', ['start'], {
      importProgress$: of({}),
    });

    await TestBed.configureTestingModule({
      imports: [
        ImportUploadComponent,
        HttpClientTestingModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatProgressBarModule,
        FormsModule,
        FileImportComponent,
      ],
      providers: [
        { provide: ImportService, useValue: importServiceSpy },
        { provide: SignalRService, useValue: signalRServiceSpy },
      ],
    }).compileComponents();

    importService = TestBed.inject(ImportService) as jasmine.SpyObj<ImportService>;
    signalRService = TestBed.inject(SignalRService) as jasmine.SpyObj<SignalRService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize mapping when preview is ready', () => {
    const preview = {
      headers: ['name', 'price', 'stock'],
      rows: [['Product 1', '10', '5']],
      fileName: 'test.xlsx',
      fileType: 'xlsx',
    };

    component.onPreviewReady(preview);

    expect(component.preview()).toEqual(preview);
    expect(component.mapping()).toBeDefined();
  });

  it('should upload file and set jobId', async () => {
    const file = new File(['test'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const uploadResponse = {
      jobId: 'test-job-id',
      fileName: 'test.xlsx',
      totalRows: 10,
      previewRows: [],
      headers: [],
    };

    importService.uploadFile.and.returnValue(of(uploadResponse));

    component.selectedFile.set(file);
    await component.uploadFile();

    expect(importService.uploadFile).toHaveBeenCalledWith(file);
    expect(component.currentJobId()).toBe('test-job-id');
  });

  it('should start import with mapping', async () => {
    component.currentJobId.set('test-job-id');
    const preview = {
      headers: ['name', 'price'],
      rows: [['Product 1', '10']],
      fileName: 'test.xlsx',
      fileType: 'xlsx',
    };
    component.preview.set(preview);
    component.mapping.set({ name: 'name', price: 'price' });

    importService.startImport.and.returnValue(of(undefined));
    importService.pollImportStatus.and.returnValue(
      of({
        job: {
          id: 'test-job-id',
          status: 'Completed' as any,
          fileName: 'test.xlsx',
          totalRows: 1,
          processedRows: 1,
          successRows: 1,
          errorRows: 0,
          createdAt: new Date().toISOString(),
        },
        progress: 100,
      })
    );

    await component.startImport();

    expect(importService.startImport).toHaveBeenCalledWith('test-job-id', component.mapping());
  });

  it('should handle upload error', async () => {
    const file = new File(['test'], 'test.xlsx');
    const error = { userMessage: 'Upload failed' };

    importService.uploadFile.and.returnValue(throwError(() => error));

    component.selectedFile.set(file);
    await component.uploadFile();

    expect(component.errors()).toContain('Upload failed');
    expect(component.isUploading()).toBe(false);
  });
});
