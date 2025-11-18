import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface VoiceCommand {
  action: 'add' | 'remove' | 'search' | 'checkout' | 'clear';
  productName?: string;
  quantity?: number;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VoiceToTextService {
  private recognition: any = null;
  private isListening = false;
  private commandSubject = new Subject<VoiceCommand>();
  public command$ = this.commandSubject.asObservable();

  constructor() {
    this.initializeRecognition();
  }

  /**
   * Initialize Web Speech API (stub implementation)
   * In production, this would integrate with a real speech-to-text service
   */
  private initializeRecognition(): void {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(' ')
          .toLowerCase();

        const command = this.parseCommand(transcript);
        if (command) {
          this.commandSubject.next(command);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    } catch (error) {
      console.warn('Failed to initialize speech recognition:', error);
    }
  }

  /**
   * Start listening for voice commands
   */
  startListening(): void {
    if (!this.recognition) {
      console.warn('Speech recognition not available');
      return;
    }

    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('Voice recognition started');
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
    }
  }

  /**
   * Stop listening for voice commands
   */
  stopListening(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('Voice recognition stopped');
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }
  }

  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Parse voice transcript into command with enhanced NLP patterns
   */
  private parseCommand(transcript: string): VoiceCommand | null {
    const lower = transcript.toLowerCase().trim();

    // Normalize common variations
    const normalized = this.normalizeTranscript(lower);

    // Checkout commands - multiple patterns
    const checkoutPatterns = [
      /^(checkout|complete|finish|finalize|pay|process payment|bill|invoice)/,
      /^(proceed to checkout|go to checkout|ready to pay)/,
      /^(done|complete sale|finish sale)/
    ];
    if (checkoutPatterns.some(pattern => pattern.test(normalized))) {
      return { action: 'checkout' };
    }

    // Clear cart commands
    const clearPatterns = [
      /^(clear|empty|remove all|delete all|reset)/,
      /^(clear cart|empty cart|remove everything|delete everything)/
    ];
    if (clearPatterns.some(pattern => pattern.test(normalized))) {
      return { action: 'clear' };
    }

    // Search commands - enhanced patterns
    const searchPatterns = [
      /^(search|find|look for|show me|display|list)\s+(.+)/,
      /^(where is|where are|find me|get me)\s+(.+)/,
      /^(i need|i want|show|need)\s+(.+)/,
    ];
    for (const pattern of searchPatterns) {
      const match = normalized.match(pattern);
      if (match && match[2]) {
        const searchTerm = this.cleanProductName(match[2]);
        if (searchTerm) {
          return { action: 'search', searchTerm };
        }
      }
    }

    // Add product commands - enhanced with quantity variations
    const addPatterns = [
      /^(add|put|include|get|take|buy|purchase)\s+(\d+)\s+(.+)/,  // "add 2 apples"
      /^(add|put|include|get|take|buy|purchase)\s+(.+)/,          // "add apples"
      /^(\d+)\s+(.+)/,                                             // "2 apples"
      /^(i want|i need|give me|i'll take)\s+(\d+)?\s*(.+)/,       // "i want 2 apples"
      /^(quantity|qty|qty of)\s+(\d+)\s+(.+)/,                    // "quantity 2 apples"
    ];
    for (const pattern of addPatterns) {
      const match = normalized.match(pattern);
      if (match) {
        let quantity = 1;
        let productName = '';

        if (match.length === 4) {
          // Pattern with quantity: "add 2 apples"
          quantity = parseInt(match[2], 10) || 1;
          productName = this.cleanProductName(match[3]);
        } else if (match.length === 3) {
          // Check if second group is number or product name
          const secondGroup = match[2];
          if (/^\d+$/.test(secondGroup)) {
            // "2 apples" or "add 2 apples" (action already matched)
            quantity = parseInt(secondGroup, 10) || 1;
            productName = this.cleanProductName(match[3] || match[2]);
          } else {
            // "add apples"
            productName = this.cleanProductName(secondGroup);
          }
        } else if (match.length === 2) {
          // Just product name
          productName = this.cleanProductName(match[1]);
        }

        if (productName && quantity > 0) {
          return { action: 'add', productName, quantity };
        }
      }
    }

    // Remove product commands - enhanced patterns
    const removePatterns = [
      /^(remove|delete|take out|take off|exclude|drop)\s+(\d+)\s+(.+)/,  // "remove 2 apples"
      /^(remove|delete|take out|take off|exclude|drop)\s+(.+)/,          // "remove apples"
      /^(cancel|undo|don't want|don't need)\s+(\d+)?\s*(.+)/,            // "cancel apples"
      /^(minus|subtract|less)\s+(\d+)?\s*(.+)/,                          // "minus 2 apples"
    ];
    for (const pattern of removePatterns) {
      const match = normalized.match(pattern);
      if (match) {
        let quantity = 1;
        let productName = '';

        if (match.length === 4) {
          quantity = parseInt(match[2], 10) || 1;
          productName = this.cleanProductName(match[3]);
        } else if (match.length === 3) {
          const secondGroup = match[2];
          if (/^\d+$/.test(secondGroup)) {
            quantity = parseInt(secondGroup, 10) || 1;
            productName = this.cleanProductName(match[3] || match[2]);
          } else {
            productName = this.cleanProductName(secondGroup);
          }
        }

        if (productName) {
          return { action: 'remove', productName, quantity };
        }
      }
    }

    return null;
  }

  /**
   * Normalize transcript to handle common speech variations
   */
  private normalizeTranscript(transcript: string): string {
    // Remove filler words
    let normalized = transcript
      .replace(/\b(um|uh|ah|er|like|you know)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Normalize numbers (spoken to digits)
    const numberWords: Record<string, string> = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
      'fourteen': '14', 'fifteen': '15', 'twenty': '20', 'thirty': '30'
    };

    for (const [word, digit] of Object.entries(numberWords)) {
      normalized = normalized.replace(new RegExp(`\\b${word}\\b`, 'gi'), digit);
    }

    // Normalize common product name variations
    normalized = normalized
      .replace(/\b(kg|kilogram|kilograms)\b/gi, 'kg')
      .replace(/\b(gm|gram|grams)\b/gi, 'gm')
      .replace(/\b(l|liter|liters|litre|litres)\b/gi, 'l')
      .replace(/\b(pcs|piece|pieces|pcs)\b/gi, 'pcs');

    return normalized;
  }

  /**
   * Clean product name from common speech artifacts
   */
  private cleanProductName(name: string): string {
    if (!name) return '';

    return name
      .replace(/\b(please|thanks|thank you|okay|ok)\b/gi, '')
      .replace(/\b(to|the|a|an|some|any)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get command stream
   */
  getCommandStream(): Observable<VoiceCommand> {
    return this.command$;
  }

  /**
   * Cleanup and dispose resources
   * Should be called when service is no longer needed
   */
  dispose(): void {
    // Stop listening if active
    if (this.isListening) {
      this.stopListening();
    }

    // Remove event handlers
    if (this.recognition) {
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
    }

    // Complete subject to allow garbage collection
    this.commandSubject.complete();

    // Clear recognition
    this.recognition = null;
  }
}


