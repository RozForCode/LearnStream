import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonBadge, IonProgressBar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonCheckbox, IonTextarea, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonProgressBar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCheckbox, IonTextarea, IonButton, IonIcon, CommonModule, FormsModule],
})
export class DashboardPage {
  learningTopics = [
    {
      id: 1,
      title: 'Ionic Framework Basics',
      category: 'Mobile Dev',
      progress: 0.75,
      status: 'In Progress',
      subtasks: [
        { id: 101, title: 'Install Ionic CLI', completed: true, notes: 'npm install -g @ionic/cli', expanded: false },
        { id: 102, title: 'Create first app', completed: true, notes: 'ionic start myApp tabs', expanded: false },
        { id: 103, title: 'Understand project structure', completed: true, notes: '', expanded: false },
        { id: 104, title: 'Build a UI with Components', completed: false, notes: '', expanded: false }
      ]
    },
    {
      id: 2,
      title: 'Angular Signals',
      category: 'Frontend',
      progress: 0.30,
      status: 'In Progress',
      subtasks: [
        { id: 201, title: 'Read Documentation', completed: true, notes: 'https://angular.io/guide/signals', expanded: false },
        { id: 202, title: 'Refactor legacy code', completed: false, notes: '', expanded: false },
        { id: 203, title: 'Use computed signals', completed: false, notes: '', expanded: false }
      ]
    },
    {
      id: 3,
      title: 'Advanced CSS Grid',
      category: 'Design',
      progress: 1.0,
      status: 'Completed',
      subtasks: [
        { id: 301, title: 'Grid Template Areas', completed: true, notes: '', expanded: false },
        { id: 302, title: 'Auto-fill vs Auto-fit', completed: true, notes: '', expanded: false }
      ]
    },
    {
      id: 4,
      title: 'OpenAI API Integration',
      category: 'AI',
      progress: 0.10,
      status: 'Started',
      subtasks: [
        { id: 401, title: 'Get API Key', completed: true, notes: '', expanded: false },
        { id: 402, title: 'Make first request', completed: false, notes: '', expanded: false },
        { id: 403, title: 'Handle errors', completed: false, notes: '', expanded: false }
      ]
    },
  ];

  constructor() {
    addIcons({ chevronDownOutline, chevronUpOutline });
  }

  updateProgress(topic: any) {
    if (!topic.subtasks || topic.subtasks.length === 0) {
      topic.progress = 0;
      return;
    }
    const completedCount = topic.subtasks.filter((t: any) => t.completed).length;
    topic.progress = completedCount / topic.subtasks.length;

    if (topic.progress === 1) {
      topic.status = 'Completed';
    } else if (topic.progress > 0) {
      topic.status = 'In Progress';
    } else {
      topic.status = 'Started'; // Or 'Not Started' depending on logic
    }
  }

  onSubtaskChange(event: any, subtask: any, topic: any) {
    subtask.completed = event.detail.checked;
    this.updateProgress(topic);
  }
}
