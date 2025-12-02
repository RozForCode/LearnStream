import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonChip,
  IonCard,
  IonCardContent,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  send,
  sparkles,
  personCircleOutline,
  refreshOutline,
  bulbOutline,
  helpCircleOutline,
  schoolOutline,
} from 'ionicons/icons';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isLoading?: boolean;
}

@Component({
  selector: 'app-ai-assistant',
  templateUrl: 'ai-assistant.page.html',
  styleUrls: ['ai-assistant.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonChip,
    IonCard,
    IonCardContent,
    CommonModule,
    FormsModule,
  ],
})
export class AiAssistantPage implements OnInit {
  @ViewChild('chatContent', { static: false }) chatContent!: IonContent;

  messages: Message[] = [];
  newMessage = '';
  isLoading = false;
  sessionId: string;

  private readonly API_URL = 'http://localhost:3000/api/ai-assistant';

  quickActions = [
    { label: 'Explain a concept', icon: 'bulb-outline', prompt: 'Can you explain ' },
    { label: 'Quiz me', icon: 'school-outline', prompt: 'Give me a quick quiz about ' },
    { label: 'Learning tips', icon: 'help-circle-outline', prompt: 'What are some tips for learning ' },
  ];

  constructor() {
    addIcons({
      send,
      sparkles,
      personCircleOutline,
      refreshOutline,
      bulbOutline,
      helpCircleOutline,
      schoolOutline,
    });

    // Generate unique session ID
    this.sessionId = this.generateSessionId();
  }

  ngOnInit() {
    // Add welcome message
    this.messages.push({
      id: this.generateId(),
      sender: 'ai',
      text: "Hello! 👋 I'm your LearnStream AI assistant. I can help you with:\n\n• Explaining programming concepts\n• Answering your questions\n• Providing learning tips\n• Quizzing you on topics\n\nWhat would you like to learn today?",
      timestamp: new Date(),
    });
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  generateSessionId(): string {
    const stored = localStorage.getItem('ai_session_id');
    if (stored) return stored;

    const newId = 'session_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('ai_session_id', newId);
    return newId;
  }

  async sendMessage(customMessage?: string) {
    const messageText = customMessage || this.newMessage.trim();

    if (messageText.length === 0 || this.isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: this.generateId(),
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };
    this.messages.push(userMessage);
    this.newMessage = '';

    // Add loading message
    const loadingMessage: Message = {
      id: this.generateId(),
      sender: 'ai',
      text: '',
      timestamp: new Date(),
      isLoading: true,
    };
    this.messages.push(loadingMessage);

    this.isLoading = true;
    this.scrollToBottom();

    try {
      const response = await fetch(`${this.API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          sessionId: this.sessionId,
        }),
      });

      const data = await response.json();

      // Remove loading message
      this.messages = this.messages.filter((m) => m.id !== loadingMessage.id);

      if (response.ok) {
        // Add AI response
        this.messages.push({
          id: this.generateId(),
          sender: 'ai',
          text: data.message,
          timestamp: new Date(),
        });
      } else {
        this.messages.push({
          id: this.generateId(),
          sender: 'ai',
          text: data.error || 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Chat error:', error);

      // Remove loading message
      this.messages = this.messages.filter((m) => m.id !== loadingMessage.id);

      this.messages.push({
        id: this.generateId(),
        sender: 'ai',
        text: "I'm having trouble connecting right now. Please check if the server is running and try again.",
        timestamp: new Date(),
      });
    } finally {
      this.isLoading = false;
      this.scrollToBottom();
    }
  }

  useQuickAction(action: { label: string; icon: string; prompt: string }) {
    this.newMessage = action.prompt;
    // Focus on input after setting prompt
  }

  async clearChat() {
    // Clear session on backend
    try {
      await fetch(`${this.API_URL}/session/${this.sessionId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to clear session:', error);
    }

    // Generate new session
    this.sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('ai_session_id', this.sessionId);

    // Reset messages
    this.messages = [
      {
        id: this.generateId(),
        sender: 'ai',
        text: "Chat cleared! 🔄 I'm ready for a fresh start. What would you like to learn?",
        timestamp: new Date(),
      },
    ];
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatContent?.scrollToBottom(300);
    }, 100);
  }

  formatMessage(text: string): string {
    // Convert markdown-style code blocks to HTML
    let formatted = text;

    // Code blocks with language
    formatted = formatted.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="code-block"><code>$2</code></pre>'
    );

    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold text
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  }
}
