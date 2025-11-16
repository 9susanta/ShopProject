import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VoiceToTextService } from '@core/services/voice-to-text.service';

@Component({
  selector: 'grocery-voice-command-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-command-button.component.html',
  styleUrls: ['./voice-command-button.component.css'],
})
export class VoiceCommandButtonComponent {
  private voiceService = inject(VoiceToTextService);

  isListening = false;

  toggleListening(): void {
    if (this.isListening) {
      this.voiceService.stopListening();
      this.isListening = false;
    } else {
      this.voiceService.startListening();
      this.isListening = true;
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (this.isListening) {
          this.voiceService.stopListening();
          this.isListening = false;
        }
      }, 5000);
    }
  }
}

