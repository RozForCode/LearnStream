import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationDisplay } from '../../services/notification.service';
import { IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline, 
  rocketOutline, 
  flameOutline, 
  trophyOutline,
  notificationsOutline,
  timeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, IonIcon, IonButton],
  template: `
    <!-- Notification Toast Container -->
    <div class="notification-container" *ngIf="notifications.length > 0">
      <div 
        *ngFor="let notif of notifications; trackBy: trackById" 
        class="notification-toast"
        [class.entering]="notif.entering"
        [class.exiting]="notif.exiting"
      >
        <div class="notification-icon" [attr.data-type]="notif.type">
          <ion-icon [name]="getIcon(notif.type)"></ion-icon>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notif.title }}</div>
          <div class="notification-message">{{ notif.message }}</div>
          <div class="notification-meta" *ngIf="notif.metadata?.roadmapTitle">
            📚 {{ notif.metadata.roadmapTitle }}
          </div>
        </div>
        <button class="notification-close" (click)="dismiss(notif.id)">
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>
    </div>

    <!-- Countdown Badge (shows when notification is pending) -->
    <div class="countdown-badge" *ngIf="countdown && countdown.timeUntil > 0" (click)="showCountdownDetails()">
      <ion-icon name="time-outline"></ion-icon>
      <span>{{ countdown.formatted }}</span>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    }

    .notification-toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-radius: 16px;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        0 0 30px rgba(99, 102, 241, 0.2);
      pointer-events: auto;
      animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: top right;
    }

    .notification-toast.entering {
      animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .notification-toast.exiting {
      animation: slideOut 0.3s ease-in forwards;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100px) scale(0.8);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateX(100px) scale(0.8);
      }
    }

    .notification-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      animation: pulse 2s infinite;

      ion-icon {
        font-size: 24px;
        color: white;
      }

      &[data-type="skill_added"] {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
      }

      &[data-type="streak_reminder"] {
        background: linear-gradient(135deg, #f59e0b, #ef4444);
      }

      &[data-type="achievement"] {
        background: linear-gradient(135deg, #10b981, #14b8a6);
      }

      &[data-type="daily_reminder"] {
        background: linear-gradient(135deg, #3b82f6, #6366f1);
      }

      &[data-type="custom"] {
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
      }
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
      }
      50% {
        box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
      }
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-size: 16px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .notification-message {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .notification-meta {
      font-size: 12px;
      color: #6366f1;
      font-weight: 500;
    }

    .notification-close {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;

      ion-icon {
        font-size: 18px;
        color: #94a3b8;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        ion-icon {
          color: #f1f5f9;
        }
      }
    }

    /* Countdown Badge */
    .countdown-badge {
      position: fixed;
      bottom: 100px;
      right: 20px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 30px;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
      cursor: pointer;
      animation: bounce 2s infinite;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.05);
      }

      ion-icon {
        font-size: 20px;
        color: white;
      }

      span {
        font-size: 14px;
        font-weight: 700;
        color: white;
        font-family: 'SF Mono', 'Fira Code', monospace;
      }
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .notification-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .notification-toast {
        padding: 12px;
      }

      .notification-icon {
        width: 40px;
        height: 40px;

        ion-icon {
          font-size: 20px;
        }
      }

      .countdown-badge {
        bottom: 80px;
        right: 10px;
      }
    }
  `]
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  notifications: (NotificationDisplay & { entering?: boolean; exiting?: boolean })[] = [];
  countdown: { notification: any; timeUntil: number; formatted: string } | null = null;

  private notificationSub: Subscription | null = null;
  private countdownSub: Subscription | null = null;

  constructor(private notificationService: NotificationService) {
    addIcons({
      closeOutline,
      rocketOutline,
      flameOutline,
      trophyOutline,
      notificationsOutline,
      timeOutline
    });
  }

  ngOnInit() {
    // Subscribe to notifications
    this.notificationSub = this.notificationService.notifications$.subscribe(notifications => {
      // Mark new notifications as entering
      this.notifications = notifications.map(n => ({
        ...n,
        entering: !this.notifications.find(existing => existing.id === n.id)
      }));
    });

    // Subscribe to countdown
    this.countdownSub = this.notificationService.countdown$.subscribe(countdown => {
      this.countdown = countdown;
    });
  }

  ngOnDestroy() {
    this.notificationSub?.unsubscribe();
    this.countdownSub?.unsubscribe();
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'skill_added': 'rocket-outline',
      'streak_reminder': 'flame-outline',
      'achievement': 'trophy-outline',
      'daily_reminder': 'notifications-outline',
      'custom': 'notifications-outline',
    };
    return icons[type] || 'notifications-outline';
  }

  dismiss(id: string) {
    // Mark as exiting for animation
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.exiting = true;
      // Remove after animation
      setTimeout(() => {
        this.notificationService.dismissNotification(id);
      }, 300);
    }
  }

  trackById(index: number, item: NotificationDisplay): string {
    return item.id;
  }

  showCountdownDetails() {
    if (this.countdown?.notification) {
      alert(`Next notification in ${this.countdown.formatted}:\n\n${this.countdown.notification.title}\n${this.countdown.notification.message}`);
    }
  }
}

