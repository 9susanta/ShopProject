import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ImportService } from '../services/import.service';
import { ImportJob, ImportJobStatus } from '@core/models/import.model';
import { Subscription, interval } from 'rxjs';
import { environment } from '@environments/environment';

@Component({
  selector: 'grocery-import-jobs-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './import-jobs-list.component.html',
  styleUrls: ['./import-jobs-list.component.css'],
})
export class ImportJobsListComponent implements OnInit, OnDestroy {
  private importService = inject(ImportService);
  private subscriptions = new Subscription();

  jobs = signal<ImportJob[]>([]);
  isLoading = signal(false);
  selectedStatus = signal<ImportJobStatus | undefined>(undefined);

  readonly ImportJobStatus = ImportJobStatus;

  ngOnInit(): void {
    this.loadJobs();

    // Auto-refresh every 10 seconds
    const refreshSub = interval(10000).subscribe(() => {
      this.loadJobs();
    });
    this.subscriptions.add(refreshSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadJobs(): void {
    this.isLoading.set(true);
    const sub = this.importService.getJobs(this.selectedStatus()).subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading import jobs:', error);
        this.isLoading.set(false);
      },
    });
    this.subscriptions.add(sub);
  }

  filterByStatus(status?: ImportJobStatus): void {
    this.selectedStatus.set(status);
    this.loadJobs();
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}

