import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

export interface ScheduledNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  scheduledFor: string;
  status: 'pending' | 'sent' | 'cancelled';
  metadata?: {
    roadmapId?: string;
    roadmapTitle?: string;
    category?: string;
    streakCount?: number;
  };
  sentAt?: string;
  createdAt: string;
}

export interface NotificationDisplay {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: Date;
  metadata?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = 'https://learnstream-d7cpasdff4fec5hj.canadacentral-01.azurewebsites.net/api/notifications';

  // Observable for active notifications to display
  private activeNotifications = new BehaviorSubject<NotificationDisplay[]>([]);
  public notifications$ = this.activeNotifications.asObservable();

  // Observable for countdown to next notification
  private nextNotificationCountdown = new BehaviorSubject<{ notification: ScheduledNotification | null; timeUntil: number; formatted: string } | null>(null);
  public countdown$ = this.nextNotificationCountdown.asObservable();

  // Polling subscription
  private pollingSubscription: Subscription | null = null;
  private countdownSubscription: Subscription | null = null;

  // Track last seen notification to avoid duplicates
  private lastSeenNotificationIds = new Set<string>();

  constructor() {
    // Start polling when service is created
    this.startPolling();
  }

  /**
   * Start polling for new notifications
   */
  startPolling() {
    if (this.pollingSubscription) {
      return; // Already polling
    }

    // Poll every 5 seconds for sent notifications
    this.pollingSubscription = interval(5000).subscribe(() => {
      this.checkForNewNotifications();
    });

    // Update countdown every second
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.updateCountdown();
    });

    // Initial check
    this.checkForNewNotifications();
    this.updateCountdown();
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
      this.countdownSubscription = null;
    }
  }

  /**
   * Check for newly sent notifications
   */
  async checkForNewNotifications() {
    try {
      const response = await fetch(`${this.API_URL}?status=sent`);
      if (!response.ok) return;

      const data = await response.json();
      const notifications: ScheduledNotification[] = data.notifications || [];

      // Filter for notifications sent in the last 30 seconds that we haven't seen
      const thirtySecondsAgo = new Date(Date.now() - 30000);

      for (const notif of notifications) {
        const sentAt = new Date(notif.sentAt || notif.createdAt);

        if (sentAt > thirtySecondsAgo && !this.lastSeenNotificationIds.has(notif._id)) {
          this.lastSeenNotificationIds.add(notif._id);
          this.showNotification({
            id: notif._id,
            title: notif.title,
            message: notif.message,
            type: notif.type,
            timestamp: sentAt,
            metadata: notif.metadata,
          });
        }
      }

      // Cleanup old IDs (keep only last 100)
      if (this.lastSeenNotificationIds.size > 100) {
        const arr = Array.from(this.lastSeenNotificationIds);
        this.lastSeenNotificationIds = new Set(arr.slice(-50));
      }
    } catch (error) {
      console.error('Error checking for notifications:', error);
    }
  }

  /**
   * Update countdown to next notification
   */
  async updateCountdown() {
    try {
      const response = await fetch(`${this.API_URL}/next`);
      if (!response.ok) {
        this.nextNotificationCountdown.next(null);
        return;
      }

      const data = await response.json();

      if (data.notification) {
        this.nextNotificationCountdown.next({
          notification: data.notification,
          timeUntil: data.timeUntil,
          formatted: data.timeUntilFormatted,
        });
      } else {
        this.nextNotificationCountdown.next(null);
      }
    } catch (error) {
      // Silently fail countdown updates
    }
  }

  /**
   * Show a notification (add to active list)
   */
  showNotification(notification: NotificationDisplay) {
    const current = this.activeNotifications.value;
    this.activeNotifications.next([notification, ...current]);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      this.dismissNotification(notification.id);
    }, 10000);

    // Also try to show browser notification if permitted
    this.showBrowserNotification(notification);
  }

  /**
   * Dismiss a notification
   */
  dismissNotification(id: string) {
    const current = this.activeNotifications.value;
    this.activeNotifications.next(current.filter(n => n.id !== id));
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.activeNotifications.next([]);
  }

  /**
   * Show browser push notification (if permitted)
   */
  async showBrowserNotification(notification: NotificationDisplay) {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icon/favicon.png',
        tag: notification.id,
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/assets/icon/favicon.png',
          tag: notification.id,
        });
      }
    }
  }

  /**
   * Request browser notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<ScheduledNotification[]> {
    try {
      const response = await fetch(`${this.API_URL}?status=pending`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.notifications || [];
    } catch (error) {
      console.error('Error fetching scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Schedule a custom notification
   */
  async scheduleNotification(type: string, title: string, message: string, delayMinutes: number = 2): Promise<ScheduledNotification | null> {
    try {
      const response = await fetch(`${this.API_URL}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, message, delayMinutes }),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.notification;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error cancelling notification:', error);
      return false;
    }
  }
}

