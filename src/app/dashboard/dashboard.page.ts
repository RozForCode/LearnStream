import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonBadge, IonProgressBar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonCheckbox, IonTextarea, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';

interface LearningStep {
  _id: string;
  title: string;
  completed: boolean;
  notes: string;
  resources: string;
  expanded?: boolean;
}

interface LearningTopic {
  _id: string;
  title: string;
  category: string;
  description?: string;
  currentSkillLevel?: string;
  learningGoal?: string;
  targetSkillLevel?: string;
  learningPath: LearningStep[];
  progress: number;
  status: string;
  subtasks: LearningStep[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonProgressBar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCheckbox, IonTextarea, IonButton, IonIcon, IonSpinner, CommonModule, FormsModule],
})
export class DashboardPage implements OnInit {
  learningTopics: LearningTopic[] = [];
  isLoading = true;

  private readonly API_URL = 'http://localhost:3000/api/resources';

  constructor() {
    addIcons({ chevronDownOutline, chevronUpOutline });
  }

  ngOnInit() {
    this.fetchResources();
  }

  ionViewWillEnter() {
    this.fetchResources();
  }

  async fetchResources() {
    this.isLoading = true;
    try {
      const response = await fetch(this.API_URL);
      const resources = await response.json();

      this.learningTopics = resources.map((resource: any) => {
        const subtasks = (resource.learningPath || []).map((step: any) => ({
          ...step,
          expanded: false,
        }));

        const progress = this.calculateProgress(subtasks);
        const status = this.calculateStatus(progress);

        return {
          ...resource,
          subtasks,
          progress,
          status,
        };
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      this.isLoading = false;
    }
  }

  calculateProgress(subtasks: LearningStep[]): number {
    if (!subtasks || subtasks.length === 0) return 0;
    const completedCount = subtasks.filter((t) => t.completed).length;
    return completedCount / subtasks.length;
  }

  calculateStatus(progress: number): string {
    if (progress === 1) return 'Completed';
    if (progress > 0) return 'In Progress';
    return 'Not Started';
  }

  updateProgress(topic: LearningTopic) {
    topic.progress = this.calculateProgress(topic.subtasks);
    topic.status = this.calculateStatus(topic.progress);
  }

  async onSubtaskChange(event: any, subtask: LearningStep, topic: LearningTopic) {
    subtask.completed = event.detail.checked;
    this.updateProgress(topic);

    // Persist to backend
    try {
      await fetch(`${this.API_URL}/${topic._id}/steps/${subtask._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: subtask.completed }),
      });
    } catch (error) {
      console.error('Error updating step:', error);
    }
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      mobile: 'Mobile Dev',
      frontend: 'Frontend',
      backend: 'Backend',
      design: 'Design',
      ai: 'AI',
    };
    return labels[category] || category;
  }
}
