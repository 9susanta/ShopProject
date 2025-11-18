import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { StoreSettingsService, StoreSettings, UpdateStoreSettingsRequest } from '@core/services/store-settings.service';
import { ToastService } from '@core/toast/toast.service';

@Component({
  selector: 'grocery-store-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="store-settings-container p-4 max-w-4xl mx-auto">
      <div class="mb-4">
        <h1 class="text-2xl font-bold">Store Settings</h1>
        <p class="text-gray-600">Manage your store information and configuration</p>
      </div>

      @if (loading()) {
        <div class="flex justify-center p-8">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (settingsForm) {
        <form [formGroup]="settingsForm" (ngSubmit)="onSubmit()">
          <!-- Store Information -->
          <mat-card class="mb-4">
            <mat-card-header>
              <mat-card-title>Store Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Store Name</mat-label>
                  <input matInput formControlName="storeName" required>
                  @if (settingsForm.get('storeName')?.hasError('required')) {
                    <mat-error>Store name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>GSTIN</mat-label>
                  <input matInput formControlName="gstin" maxlength="15">
                  <mat-hint>15-character GST identification number</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Phone</mat-label>
                  <input matInput formControlName="phone" type="tel">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" type="email">
                  @if (settingsForm.get('email')?.hasError('email')) {
                    <mat-error>Invalid email format</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="md:col-span-2">
                  <mat-label>Address</mat-label>
                  <textarea matInput formControlName="address" rows="2"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>City</mat-label>
                  <input matInput formControlName="city">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>State</mat-label>
                  <input matInput formControlName="state">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Pincode</mat-label>
                  <input matInput formControlName="pincode" maxlength="10">
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Charges & Fees -->
          <mat-card class="mb-4">
            <mat-card-header>
              <mat-card-title>Charges & Fees</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline">
                  <mat-label>Packing Charges (₹)</mat-label>
                  <input matInput formControlName="packingCharges" type="number" min="0" step="0.01">
                  <span matPrefix>₹&nbsp;</span>
                  @if (settingsForm.get('packingCharges')?.hasError('min')) {
                    <mat-error>Packing charges cannot be negative</mat-error>
                  }
                </mat-form-field>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Home Delivery -->
          <mat-card class="mb-4">
            <mat-card-header>
              <mat-card-title>Home Delivery</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="mb-4">
                <mat-checkbox formControlName="isHomeDeliveryEnabled">
                  Enable Home Delivery
                </mat-checkbox>
              </div>
              @if (settingsForm.get('isHomeDeliveryEnabled')?.value) {
                <mat-form-field appearance="outline">
                  <mat-label>Home Delivery Charges (₹)</mat-label>
                  <input matInput formControlName="homeDeliveryCharges" type="number" min="0" step="0.01">
                  <span matPrefix>₹&nbsp;</span>
                  @if (settingsForm.get('homeDeliveryCharges')?.hasError('min')) {
                    <mat-error>Delivery charges cannot be negative</mat-error>
                  }
                </mat-form-field>
              }
            </mat-card-content>
          </mat-card>

          <!-- Loyalty Program -->
          <mat-card class="mb-4">
            <mat-card-header>
              <mat-card-title>Loyalty Program</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline">
                <mat-label>Points per ₹100</mat-label>
                <input matInput formControlName="pointsPerHundredRupees" type="number" min="0">
                <mat-hint>Number of loyalty points earned per ₹100 spent</mat-hint>
                @if (settingsForm.get('pointsPerHundredRupees')?.hasError('min')) {
                  <mat-error>Points cannot be negative</mat-error>
                }
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Actions -->
          <div class="flex gap-4 justify-end">
            <button mat-button type="button" (click)="resetForm()" [disabled]="saving()">
              Reset
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="settingsForm.invalid || saving()">
              @if (saving()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                Saving...
              } @else {
                <mat-icon>save</mat-icon>
                Save Settings
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .store-settings-container {
      min-height: calc(100vh - 64px);
    }
    mat-card {
      margin-bottom: 16px;
    }
    mat-form-field {
      width: 100%;
    }
  `]
})
export class StoreSettingsComponent implements OnInit {
  private storeSettingsService = inject(StoreSettingsService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  saving = signal(false);
  settings = signal<StoreSettings | null>(null);
  settingsForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  initForm(): void {
    this.settingsForm = this.fb.group({
      storeName: ['', [Validators.required]],
      gstin: [''],
      address: [''],
      city: [''],
      state: [''],
      pincode: [''],
      phone: [''],
      email: ['', [Validators.email]],
      packingCharges: [0, [Validators.min(0)]],
      isHomeDeliveryEnabled: [false],
      homeDeliveryCharges: [0, [Validators.min(0)]],
      pointsPerHundredRupees: [1, [Validators.min(0)]],
    });
  }

  loadSettings(): void {
    this.loading.set(true);
    this.storeSettingsService.getStoreSettings().subscribe({
      next: (settings) => {
        this.settings.set(settings);
        this.settingsForm.patchValue({
          storeName: settings.storeName,
          gstin: settings.gstin || '',
          address: settings.address || '',
          city: settings.city || '',
          state: settings.state || '',
          pincode: settings.pincode || '',
          phone: settings.phone || '',
          email: settings.email || '',
          packingCharges: settings.packingCharges,
          isHomeDeliveryEnabled: settings.isHomeDeliveryEnabled,
          homeDeliveryCharges: settings.homeDeliveryCharges,
          pointsPerHundredRupees: settings.pointsPerHundredRupees,
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading store settings:', error);
        this.toastService.error('Failed to load store settings');
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      this.toastService.warning('Please fix form errors before saving');
      return;
    }

    this.saving.set(true);
    const request: UpdateStoreSettingsRequest = {
      storeName: this.settingsForm.value.storeName,
      gstin: this.settingsForm.value.gstin || undefined,
      address: this.settingsForm.value.address || undefined,
      city: this.settingsForm.value.city || undefined,
      state: this.settingsForm.value.state || undefined,
      pincode: this.settingsForm.value.pincode || undefined,
      phone: this.settingsForm.value.phone || undefined,
      email: this.settingsForm.value.email || undefined,
      packingCharges: this.settingsForm.value.packingCharges || 0,
      isHomeDeliveryEnabled: this.settingsForm.value.isHomeDeliveryEnabled || false,
      homeDeliveryCharges: this.settingsForm.value.homeDeliveryCharges || 0,
      pointsPerHundredRupees: this.settingsForm.value.pointsPerHundredRupees || 1,
    };

    this.storeSettingsService.updateStoreSettings(request).subscribe({
      next: (updatedSettings) => {
        this.settings.set(updatedSettings);
        this.toastService.success('Store settings updated successfully');
        this.saving.set(false);
      },
      error: (error) => {
        console.error('Error updating store settings:', error);
        this.toastService.error(error?.error?.message || 'Failed to update store settings');
        this.saving.set(false);
      },
    });
  }

  resetForm(): void {
    const currentSettings = this.settings();
    if (currentSettings) {
      this.settingsForm.patchValue({
        storeName: currentSettings.storeName,
        gstin: currentSettings.gstin || '',
        address: currentSettings.address || '',
        city: currentSettings.city || '',
        state: currentSettings.state || '',
        pincode: currentSettings.pincode || '',
        phone: currentSettings.phone || '',
        email: currentSettings.email || '',
        packingCharges: currentSettings.packingCharges,
        isHomeDeliveryEnabled: currentSettings.isHomeDeliveryEnabled,
        homeDeliveryCharges: currentSettings.homeDeliveryCharges,
        pointsPerHundredRupees: currentSettings.pointsPerHundredRupees,
      });
    }
  }
}
