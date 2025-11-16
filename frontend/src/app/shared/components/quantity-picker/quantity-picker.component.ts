import { Component, input, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'grocery-quantity-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Computed value that syncs with input changes
  value = computed(() => {
    const inputVal = this.initialValue();
    const current = this.valueSignal();
    if (inputVal !== current) {
      this.valueSignal.set(inputVal);
      return inputVal;
    }
    return current;
  });

  ngOnInit(): void {
    // Initialize with input value
    this.valueSignal.set(this.initialValue());
  }

  increment(): void {
    const current = this.valueSignal();
    const maxValue = this.max();
    if (current < maxValue) {
      const newValue = current + 1;
      this.valueSignal.set(newValue);
      this.valueChange.emit(newValue);
    }
  }

  decrement(): void {
    const current = this.valueSignal();
    if (current > this.min()) {
      const newValue = current - 1;
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

    this.valueSignal.set(newValue);
    input.value = newValue.toString();
    this.valueChange.emit(newValue);
  }
}
