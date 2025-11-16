import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ImportService } from './import.service';
import { ImportJobStatus } from '@core/models/import.model';
import { environment } from '@environments/environment';

describe('ImportService', () => {
  let service: ImportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ImportService],
    });
    service = TestBed.inject(ImportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get job status', () => {
    const mockJob = {
      id: '1',
      fileName: 'test.xlsx',
      status: ImportJobStatus.Completed,
      totalRows: 100,
      processedRows: 100,
      successfulRows: 95,
      failedRows: 5,
      createdAt: new Date().toISOString(),
    };

    service.getJobStatus('1').subscribe(job => {
      expect(job).toEqual(mockJob);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/imports/1/status`);
    expect(req.request.method).toBe('GET');
    req.flush(mockJob);
  });
});

