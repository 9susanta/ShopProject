import { Component, input, output, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'grocery-quantity-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './quantity-picker.component.html',
  styleUrls: ['./quantity-picker.component.css'],
})
export class QuantityPickerComponent implements OnInit {
  // Signal-based inputs with defaults
  min = input<number>(1);
  max = input<number>(Number.MAX_SAFE_INTEGER); // Default to very large number (effectively unlimited)
  initialValue = input<number>(1);

  // Internal state signal
  private valueSignal = signal<number>(1);

  // Signal-based output
  valueChange = output<number>();

  // Computed value (read-only, no side effects)
  value = computed(() => this.valueSignal());

  private isInternalUpdate = false;

  constructor() {
    // Sync initialValue input with internal signal using effect
    // Only sync when the value is actually different and not from internal updates
    effect(() => {
      const inputVal = this.initialValue();
      const current = this.valueSignal();
      if (!this.isInternalUpdate && inputVal !== current) {
        this.valueSignal.set(inputVal);
      }
      this.isInternalUpdate = false;
    });
  }

  ngOnInit(): void {
    // Initialize with input value
    this.valueSignal.set(this.initialValue());
  }

  increment(): void {
    const current = this.valueSignal();
    const maxValue = this.max();
    if (current < maxValue) {
      const newValue = current + 1;
      this.isInternalUpdate = true;
      this.valueSignal.set(newValue);
      this.valueChange.emit(newValue);
    }
  }

  decrement(): void {
    const current = this.valueSignal();
    if (current > this.min()) {
      const newValue = current - 1;
      this.isInternalUpdate = true;
      this.valueSignal.set(newValue);
      this.valueChange.emit(newValue);
    }
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let newValue = parseInt(input.value, 10);
    const maxValue = this.max();

    if (isNaN(newValue) || newValue < this.min()) {
      newValue = this.min();
    } else if (newValue > maxValue) {
      newValue = maxValue;
    }

    this.isInternalUpdate = true;
    this.valueSignal.set(newValue);
    input.value = newValue.toString();
    this.valueChange.emit(newValue);
  }
}
