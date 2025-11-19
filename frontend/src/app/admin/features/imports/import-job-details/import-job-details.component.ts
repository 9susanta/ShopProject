import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ImportService } from '../services/import.service';
import { ImportJob, ImportJobStatus } from '@core/models/import.model';
import { ToastService } from '@core/toast/toast.service';
import { Subscription, interval } from 'rxjs';
// Note: Install file-saver: npm install file-saver @types/file-saver
// import { saveAs } from 'file-saver';

@Component({
  selector: 'grocery-import-job-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-job-details.component.html',
  styleUrls: ['./import-job-details.component.css'],
})
export class ImportJobDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private importService = inject(ImportService);
  private toastService = inject(ToastService);
  private subscriptions = new Subscription();

  jobId = signal<string | null>(null);
  job = signal<ImportJob | null>(null);
  isLoading = signal(false);
  isDownloading = signal(false);

  readonly ImportJobStatus = ImportJobStatus;

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.jobId.set(jobId);
      this.loadJobDetails();

      // Auto-refresh if job is still processing
      const refreshSub = interval(5000).subscribe(() => {
        if (this.job()?.status === ImportJobStatus.Processing || this.job()?.status === ImportJobStatus.Pending) {
          this.loadJobDetails();
        }
      });
      this.subscriptions.add(refreshSub);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadJobDetails(): void {
    const id = this.jobId();
    if (!id) return;

    this.isLoading.set(true);
    const sub = this.importService.getJobStatus(id).subscribe({
      next: (job) => {
        this.job.set(job);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading job details:', error);
        this.toastService.error('Failed to load job details');
        this.isLoading.set(false);
      },
    });
    this.subscriptions.add(sub);
  }

  downloadErrorReport(): void {
    const id = this.jobId();
    if (!id) return;

    this.isDownloading.set(true);
    this.importService.downloadErrorReport(id).subscribe({
      next: (blob) => {
        // Download file using browser API
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const job = this.job();
        link.download = job ? `import-errors-${job.fileName}-${id}.csv` : `import-errors-${id}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.isDownloading.set(false);
        this.toastService.success('Error report downloaded');
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        this.toastService.error('Failed to download error report');
        this.isDownloading.set(false);
      },
    });
  }

  cancelJob(): void {
    const id = this.jobId();
    if (!id) return;

    if (confirm('Are you sure you want to cancel this import job?')) {
      this.importService.cancelJob(id).subscribe({
        next: () => {
          this.toastService.success('Job cancelled');
          this.loadJobDetails();
        },
        error: (error) => {
          this.toastService.error('Failed to cancel job');
          console.error('Error cancelling job:', error);
        },
      });
    }
  }

  retryFailedRows(): void {
    const id = this.jobId();
    if (!id) return;

    if (confirm('Retry failed rows? This will reprocess only the rows that failed.')) {
      this.importService.retryFailedRows(id).subscribe({
        next: () => {
          this.toastService.success('Retry started');
          this.loadJobDetails();
        },
        error: (error) => {
          this.toastService.error('Failed to retry');
          console.error('Error retrying:', error);
        },
      });
    }
  }

  getProgressPercentage(): number {
    const job = this.job();
    if (!job || job.totalRows === 0) return 0;
    return Math.round((job.processedRows / job.totalRows) * 100);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  goBack(): void {
    this.router.navigate(['/admin/imports/jobs']);
  }
}

