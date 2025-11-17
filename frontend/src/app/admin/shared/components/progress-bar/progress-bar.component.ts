import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'grocery-progress-bar',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule, MatCardModule],
  template: `
    <div class="progress-container">
      @if (showCard) {
        <mat-card>
          <mat-card-content>
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold">{{ label || 'Progress' }}</span>
              <span class="text-sm text-gray-500">{{ value }}%</span>
            </div>
            <mat-progress-bar [mode]="mode" [value]="value" [bufferValue]="bufferValue"></mat-progress-bar>
            @if (message) {
              <p class="text-sm text-gray-600 mt-2">{{ message }}</p>
            }
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="progress-simple">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold">{{ label || 'Progress' }}</span>
            <span class="text-sm text-gray-500">{{ value }}%</span>
          </div>
          <mat-progress-bar [mode]="mode" [value]="value" [bufferValue]="bufferValue"></mat-progress-bar>
          @if (message) {
            <p class="text-sm text-gray-600 mt-2">{{ message }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .progress-container {
      width: 100%;
    }
    .progress-simple {
      padding: 1rem 0;
    }
  `],
})
export class ProgressBarComponent {
  @Input() value: number = 0;
  @Input() bufferValue: number = 0;
  @Input() mode: 'determinate' | 'indeterminate' | 'buffer' | 'query' = 'determinate';
  @Input() label: string = '';
  @Input() message: string = '';
  @Input() showCard: boolean = true;
}

