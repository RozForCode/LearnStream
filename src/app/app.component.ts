import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NotificationToastComponent } from './components/notification-toast/notification-toast.component';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, NotificationToastComponent],
})
export class AppComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}

  async ngOnInit() {
    // Request browser notification permission on app start
    await this.notificationService.requestPermission();
  }
}
