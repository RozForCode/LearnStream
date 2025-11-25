import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonItem, IonInput, IonButton, IonIcon, IonList, IonText } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { send } from 'ionicons/icons';

@Component({
  selector: 'app-ai-assistant',
  templateUrl: 'ai-assistant.page.html',
  styleUrls: ['ai-assistant.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonItem, IonInput, IonButton, IonIcon, IonList, IonText, CommonModule, FormsModule],
})
export class AiAssistantPage {
  messages = [
    { sender: 'ai', text: 'Hello! I am your LearnStream AI assistant. How can I help you learn today?' }
  ];
  newMessage = '';

  constructor() {
    addIcons({ send });
  }

  sendMessage() {
    if (this.newMessage.trim().length > 0) {
      this.messages.push({ sender: 'user', text: this.newMessage });
      // Mock AI response
      setTimeout(() => {
        this.messages.push({ sender: 'ai', text: 'That is a great question! Let me find some resources for you...' });
      }, 1000);
      this.newMessage = '';
    }
  }
}

