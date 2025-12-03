import { Component, ViewChild, OnInit, AfterViewChecked } from '@angular/core';
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
  IonCardHeader,
  IonCardTitle,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import {
  send,
  sparkles,
  personCircleOutline,
  refreshOutline,
  bulbOutline,
  helpCircleOutline,
  schoolOutline,
  rocketOutline,
  addCircleOutline,
  arrowForwardOutline,
  checkmarkCircleOutline,
  mapOutline,
  copyOutline,
} from 'ionicons/icons';

// Import Prism for syntax highlighting
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';

interface AiAction {
  type: 'create_roadmap' | 'extend_roadmap' | 'add_step';
  data: any;
  label: string;
  description: string;
}

interface CodeBlock {
  language: string;
  code: string;
  id: string;
}

interface MessagePart {
  type: 'text' | 'code';
  content?: SafeHtml;
  codeBlock?: CodeBlock;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isLoading?: boolean;
  action?: AiAction;
  actionExecuted?: boolean;
  actionResult?: string;
  parts?: MessagePart[];
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
    IonCardHeader,
    IonCardTitle,
    CommonModule,
    FormsModule,
  ],
})
export class AiAssistantPage implements OnInit, AfterViewChecked {
  @ViewChild('chatContent', { static: false }) chatContent!: IonContent;

  messages: Message[] = [];
  newMessage = '';
  isLoading = false;
  sessionId: string;
  executingAction: string | null = null;
  private needsHighlighting = false;

  private readonly API_URL = 'https://learnstream-d7cpasdff4fec5hj.canadacentral-01.azurewebsites.net/api/ai-assistant';

  quickActions = [
    {
      label: 'Explain a concept',
      icon: 'bulb-outline',
      prompt: 'Can you explain ',
    },
    {
      label: 'Quiz me',
      icon: 'school-outline',
      prompt: 'Give me a quick quiz about ',
    },
    {
      label: 'Learning tips',
      icon: 'help-circle-outline',
      prompt: 'What are some tips for learning ',
    },
    {
      label: 'Create a roadmap',
      icon: 'map-outline',
      prompt: 'I want to learn ',
    },
  ];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private sanitizer: DomSanitizer
  ) {
    addIcons({
      send,
      sparkles,
      personCircleOutline,
      refreshOutline,
      bulbOutline,
      helpCircleOutline,
      schoolOutline,
      rocketOutline,
      addCircleOutline,
      arrowForwardOutline,
      checkmarkCircleOutline,
      mapOutline,
      copyOutline,
    });

    // Generate unique session ID
    this.sessionId = this.generateSessionId();
  }

  ngOnInit() {
    // Load chat history or show welcome message
    this.loadChatHistory();
  }

  ngAfterViewChecked() {
    if (this.needsHighlighting) {
      this.needsHighlighting = false;
    }
  }

  async loadChatHistory() {
    try {
      const response = await fetch(
        `${this.API_URL}/history/${this.sessionId}?limit=50`
      );
      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        // Restore messages from history
        this.messages = data.messages.map((msg: any) => {
          const message: Message = {
            id: this.generateId(),
            sender: msg.role === 'user' ? 'user' : 'ai',
            text: msg.content,
            timestamp: new Date(msg.timestamp),
            ...this.parseActionFromText(msg.content),
          };
          this.processMessageFormatting(message);
          return message;
        });
      } else {
        // Show welcome message for new sessions
        const welcomeMsg: Message = {
          id: this.generateId(),
          sender: 'ai',
          text: "Hello! 👋 I'm your LearnStream AI assistant. I can help you with:\n\n• Explaining programming concepts\n• Answering your tech questions\n• Creating learning roadmaps for you\n• Quizzing you on topics\n\nI'm aware of your current learning roadmaps and can help you continue your journey. What would you like to learn today?",
          timestamp: new Date(),
        };
        this.processMessageFormatting(welcomeMsg);
        this.messages.push(welcomeMsg);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Show welcome message on error
      const welcomeMsg: Message = {
        id: this.generateId(),
        sender: 'ai',
        text: "Hello! 👋 I'm your LearnStream AI assistant. What would you like to learn today?",
        timestamp: new Date(),
      };
      this.processMessageFormatting(welcomeMsg);
      this.messages.push(welcomeMsg);
    }
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

  /**
   * Parse action block from AI response text
   */
  parseActionFromText(text: string): { action?: AiAction } {
    const actionMatch = text.match(
      /:::ACTION:::\s*([\s\S]*?)\s*:::END_ACTION:::/
    );

    if (actionMatch) {
      try {
        const actionJson = actionMatch[1].trim();
        const action = JSON.parse(actionJson);
        return { action };
      } catch (error) {
        console.error('Failed to parse action:', error);
      }
    }

    return {};
  }

  /**
   * Get message text without the action block
   */
  getMessageTextWithoutAction(text: string): string {
    return text.replace(/:::ACTION:::[\s\S]*?:::END_ACTION:::/g, '').trim();
  }

  /**
   * Process message to extract code blocks and format HTML
   * Creates an array of parts (text or code) for proper rendering
   */
  private processMessageFormatting(message: Message) {
    const text = this.getMessageTextWithoutAction(message.text);
    const parts: MessagePart[] = [];
    let blockIndex = 0;

    // Split by code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before this code block
      if (match.index > lastIndex) {
        const textContent = text.substring(lastIndex, match.index);
        parts.push({
          type: 'text',
          content: this.formatTextContent(textContent),
        });
      }

      // Add the code block
      const language = this.getLanguageClass(match[1] || '');
      const code = match[2].trim();
      const id = `code-${message.id}-${blockIndex++}`;

      parts.push({
        type: 'code',
        codeBlock: { language, code, id },
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last code block
    if (lastIndex < text.length) {
      const textContent = text.substring(lastIndex);
      parts.push({
        type: 'text',
        content: this.formatTextContent(textContent),
      });
    }

    // If no code blocks were found, just format the whole text
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: this.formatTextContent(text),
      });
    }

    message.parts = parts;
  }

  /**
   * Format text content (inline code, bold, links, line breaks)
   */
  private formatTextContent(text: string): SafeHtml {
    let formatted = this.escapeHtml(text);

    // Markdown-style links [text](url) - MUST be processed BEFORE raw URLs
    formatted = formatted.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>'
    );

    // Raw URLs - convert to clickable links
    // Match URLs that start with http/https that are NOT already inside an href or anchor tag
    formatted = formatted.replace(
      /(?<!href="|>)(https?:\/\/[^\s<>\[\]"']+)/gi,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>'
    );

    // Inline code
    formatted = formatted.replace(
      /`([^`]+)`/g,
      '<code class="inline-code">$1</code>'
    );

    // Bold text
    formatted = formatted.replace(
      /\*\*([^*]+)\*\*/g,
      '<strong>$1</strong>'
    );

    // Italic text
    formatted = formatted.replace(
      /\*([^*]+)\*/g,
      '<em>$1</em>'
    );

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
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
    this.processMessageFormatting(userMessage);
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
        // Parse action from response
        const { action } = this.parseActionFromText(data.message);

        // Add AI response
        const aiMessage: Message = {
          id: this.generateId(),
          sender: 'ai',
          text: data.message,
          timestamp: new Date(),
          action,
        };
        this.processMessageFormatting(aiMessage);
        this.messages.push(aiMessage);

        // Trigger syntax highlighting
        this.needsHighlighting = true;
      } else {
        const errorMessage: Message = {
          id: this.generateId(),
          sender: 'ai',
          text: data.error || 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        };
        this.processMessageFormatting(errorMessage);
        this.messages.push(errorMessage);
      }
    } catch (error) {
      console.error('Chat error:', error);

      // Remove loading message
      this.messages = this.messages.filter((m) => m.id !== loadingMessage.id);

      const errorMessage: Message = {
        id: this.generateId(),
        sender: 'ai',
        text: "I'm having trouble connecting right now. Please check if the server is running and try again.",
        timestamp: new Date(),
      };
      this.processMessageFormatting(errorMessage);
      this.messages.push(errorMessage);
    } finally {
      this.isLoading = false;
      this.scrollToBottom();
    }
  }

  /**
   * Execute an action suggested by the AI
   */
  async executeAction(message: Message) {
    if (!message.action || message.actionExecuted || this.executingAction) {
      return;
    }

    const action = message.action;
    this.executingAction = message.id;

    try {
      const response = await fetch(`${this.API_URL}/execute-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: action.type,
          data: action.data,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        message.actionExecuted = true;
        message.actionResult = result.message;

        // Show success toast
        const toast = await this.toastController.create({
          message: result.message,
          duration: 3000,
          position: 'top',
          color: 'success',
          buttons: [
            {
              text: 'View',
              handler: () => {
                this.router.navigate(['/tabs/dashboard']);
              },
            },
          ],
        });
        await toast.present();
      } else {
        // Show error toast
        const toast = await this.toastController.create({
          message: result.error || 'Failed to execute action',
          duration: 3000,
          position: 'top',
          color: 'danger',
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Action execution error:', error);

      const toast = await this.toastController.create({
        message: 'Failed to execute action. Please try again.',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.executingAction = null;
      this.scrollToBottom();
    }
  }

  /**
   * Copy code to clipboard
   */
  async copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      const toast = await this.toastController.create({
        message: 'Code copied to clipboard!',
        duration: 2000,
        position: 'top',
        color: 'success',
      });
      await toast.present();
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }

  /**
   * Get icon for action type
   */
  getActionIcon(type: string): string {
    switch (type) {
      case 'create_roadmap':
        return 'rocket-outline';
      case 'extend_roadmap':
        return 'add-circle-outline';
      case 'add_step':
        return 'add-circle-outline';
      default:
        return 'arrow-forward-outline';
    }
  }

  useQuickAction(action: { label: string; icon: string; prompt: string }) {
    this.newMessage = action.prompt;
    // Focus on input after setting prompt
  }

  async clearChat() {
    const alert = await this.alertController.create({
      header: 'Clear Chat',
      message: 'This will clear your conversation history. Are you sure?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Clear',
          role: 'destructive',
          handler: async () => {
            // Clear session on backend
            try {
              await fetch(`${this.API_URL}/session/${this.sessionId}`, {
                method: 'DELETE',
              });
            } catch (error) {
              console.error('Failed to clear session:', error);
            }

            // Generate new session
            this.sessionId =
              'session_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('ai_session_id', this.sessionId);

            // Reset messages
            const welcomeMsg: Message = {
              id: this.generateId(),
              sender: 'ai',
              text: "Chat cleared! 🔄 I'm ready for a fresh start. What would you like to learn?",
              timestamp: new Date(),
            };
            this.processMessageFormatting(welcomeMsg);
            this.messages = [welcomeMsg];
          },
        },
      ],
    });

    await alert.present();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatContent?.scrollToBottom(300);
    }, 100);
  }

  /**
   * Map language aliases to Prism language names
   */
  private getLanguageClass(lang: string): string {
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      rb: 'ruby',
      sh: 'bash',
      shell: 'bash',
      yml: 'yaml',
      dockerfile: 'docker',
      '': 'javascript', // default
    };
    return languageMap[lang.toLowerCase()] || lang.toLowerCase();
  }

  /**
   * Get highlighted code HTML for a code block
   */
  getHighlightedCode(block: CodeBlock): SafeHtml {
    try {
      const languages = Prism.languages as Record<string, Prism.Grammar>;
      const grammar = languages[block.language] || languages['javascript'];
      const highlighted = Prism.highlight(block.code, grammar, block.language);
      return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    } catch (e) {
      console.warn('Failed to highlight code:', e);
      return this.sanitizer.bypassSecurityTrustHtml(this.escapeHtml(block.code));
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
