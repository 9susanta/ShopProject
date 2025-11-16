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
   * Parse voice transcript into command (stub implementation)
   * In production, this would use NLP/LLM to parse natural language
   */
  private parseCommand(transcript: string): VoiceCommand | null {
    // Simple keyword-based parsing (stub)
    // Production would use more sophisticated NLP

    const lower = transcript.toLowerCase().trim();

    // Checkout commands
    if (lower.includes('checkout') || lower.includes('complete') || lower.includes('finish')) {
      return { action: 'checkout' };
    }

    // Clear cart
    if (lower.includes('clear') || lower.includes('remove all')) {
      return { action: 'clear' };
    }

    // Search commands
    if (lower.startsWith('search') || lower.startsWith('find')) {
      const searchTerm = lower.replace(/^(search|find)\s+/, '').trim();
      if (searchTerm) {
        return { action: 'search', searchTerm };
      }
    }

    // Add product commands (e.g., "add 2 apples", "add apple")
    const addMatch = lower.match(/add\s+(\d+)?\s*(.+)/);
    if (addMatch) {
      const quantity = addMatch[1] ? parseInt(addMatch[1], 10) : 1;
      const productName = addMatch[2].trim();
      if (productName) {
        return { action: 'add', productName, quantity };
      }
    }

    // Remove product commands
    const removeMatch = lower.match(/remove\s+(\d+)?\s*(.+)/);
    if (removeMatch) {
      const quantity = removeMatch[1] ? parseInt(removeMatch[1], 10) : 1;
      const productName = removeMatch[2].trim();
      if (productName) {
        return { action: 'remove', productName, quantity };
      }
    }

    return null;
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


