import { Component, Output, EventEmitter, signal, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'grocery-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnDestroy {
  @Output() search = new EventEmitter<string>();

  searchTerm = signal('');
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.search.emit(term);
    });
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onInput(value: string): void {
    this.searchTerm.set(value);
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.search.emit('');
  }
}

