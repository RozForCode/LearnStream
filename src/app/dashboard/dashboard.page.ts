import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonBadge, IonProgressBar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonProgressBar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, CommonModule],
})
export class DashboardPage {
  learningTopics = [
    { id: 1, title: 'Ionic Framework Basics', category: 'Mobile Dev', progress: 0.75, status: 'In Progress' },
    { id: 2, title: 'Angular Signals', category: 'Frontend', progress: 0.30, status: 'In Progress' },
    { id: 3, title: 'Advanced CSS Grid', category: 'Design', progress: 1.0, status: 'Completed' },
    { id: 4, title: 'OpenAI API Integration', category: 'AI', progress: 0.10, status: 'Started' },
  ];

  constructor() { }
}
