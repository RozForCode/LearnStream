import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonBadge,
  IonProgressBar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSpinner,
  IonChip,
  IonSkeletonText,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  AlertController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  chevronDownOutline,
  chevronUpOutline,
  addCircleOutline,
  rocketOutline,
  bookOutline,
  videocamOutline,
  logoGithub,
  documentTextOutline,
  linkOutline,
  constructOutline,
  timeOutline,
  openOutline,
  refreshOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  trashOutline,
  addOutline,
  checkmarkOutline,
  checkmark,
} from 'ionicons/icons';
import { Browser } from '@capacitor/browser';

type ResourcesStatus = 'pending' | 'loading' | 'ready' | 'failed';

interface ResourceLink {
  title: string;
  url: string;
  type:
    | 'documentation'
    | 'tutorial'
    | 'video'
    | 'course'
    | 'article'
    | 'github'
    | 'tool'
    | 'other';
}

interface LearningStep {
  _id: string;
  title: string;
  completed: boolean;
  description: string;
  estimatedTime: string;
  resources: ResourceLink[];
  resourcesStatus: ResourcesStatus;
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
  resourcesStatus: ResourcesStatus;
  progress: number;
  status: string;
  subtasks: LearningStep[];
  expanded?: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonProgressBar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonCheckbox,
    IonTextarea,
    IonButton,
    IonIcon,
    IonSpinner,
    IonChip,
    IonSkeletonText,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    CommonModule,
    FormsModule,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  learningTopics: LearningTopic[] = [];
  isLoading = true;
  private pollingIntervals: Map<string, any> = new Map();

  private readonly API_URL = 'http://localhost:3000/api/resources';
  private readonly POLLING_INTERVAL = 3000;

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {
    addIcons({
      chevronDownOutline,
      chevronUpOutline,
      addCircleOutline,
      rocketOutline,
      bookOutline,
      videocamOutline,
      logoGithub,
      documentTextOutline,
      linkOutline,
      constructOutline,
      timeOutline,
      openOutline,
      refreshOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      trashOutline,
      addOutline,
      checkmarkOutline,
      checkmark,
    });
  }

  ngOnInit() {
    this.fetchResources();
  }

  ngOnDestroy() {
    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.pollingIntervals.clear();
  }

  ionViewWillEnter() {
    this.fetchResources();
  }

  ionViewWillLeave() {
    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.pollingIntervals.clear();
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
          expanded: true,
        };
      });

      this.learningTopics.forEach((topic) => {
        if (
          topic.resourcesStatus === 'pending' ||
          topic.resourcesStatus === 'loading'
        ) {
          this.startPolling(topic._id);
        }
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      this.isLoading = false;
    }
  }

  startPolling(resourceId: string) {
    if (this.pollingIntervals.has(resourceId)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${this.API_URL}/${resourceId}/status`);
        const statusData = await response.json();

        const topicIndex = this.learningTopics.findIndex(
          (t) => t._id === resourceId
        );
        if (topicIndex !== -1) {
          const topic = this.learningTopics[topicIndex];
          topic.resourcesStatus = statusData.resourcesStatus;

          statusData.steps.forEach((stepStatus: any) => {
            const step = topic.subtasks.find((s) => s._id === stepStatus._id);
            if (step) {
              step.resourcesStatus = stepStatus.resourcesStatus;
            }
          });

          if (
            statusData.resourcesStatus === 'ready' ||
            statusData.resourcesStatus === 'failed'
          ) {
            this.stopPolling(resourceId);
            await this.refreshSingleResource(resourceId);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, this.POLLING_INTERVAL);

    this.pollingIntervals.set(resourceId, interval);
  }

  stopPolling(resourceId: string) {
    const interval = this.pollingIntervals.get(resourceId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(resourceId);
    }
  }

  async refreshSingleResource(resourceId: string) {
    try {
      const response = await fetch(`${this.API_URL}/${resourceId}`);
      const resource = await response.json();

      const topicIndex = this.learningTopics.findIndex(
        (t) => t._id === resourceId
      );
      if (topicIndex !== -1) {
        const subtasks = (resource.learningPath || []).map((step: any) => ({
          ...step,
          expanded:
            this.learningTopics[topicIndex].subtasks.find(
              (s) => s._id === step._id
            )?.expanded || false,
        }));

        const progress = this.calculateProgress(subtasks);
        const status = this.calculateStatus(progress);

        this.learningTopics[topicIndex] = {
          ...resource,
          subtasks,
          progress,
          status,
          expanded: this.learningTopics[topicIndex].expanded,
        };
      }
    } catch (error) {
      console.error('Error refreshing resource:', error);
    }
  }

  async retryResourceGathering(topic: LearningTopic) {
    try {
      await fetch(`${this.API_URL}/${topic._id}/retry-resources`, {
        method: 'POST',
      });
      topic.resourcesStatus = 'loading';
      topic.subtasks.forEach((s) => (s.resourcesStatus = 'pending'));
      this.startPolling(topic._id);
    } catch (error) {
      console.error('Error retrying resource gathering:', error);
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

  async onSubtaskChange(
    event: any,
    subtask: LearningStep,
    topic: LearningTopic
  ) {
    subtask.completed = event.detail.checked;
    this.updateProgress(topic);

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

  getResourceIcon(type: string): string {
    const icons: Record<string, string> = {
      documentation: 'book-outline',
      tutorial: 'document-text-outline',
      video: 'videocam-outline',
      course: 'book-outline',
      article: 'document-text-outline',
      github: 'logo-github',
      tool: 'construct-outline',
      other: 'link-outline',
    };
    return icons[type] || 'link-outline';
  }

  async openResource(url: string) {
    try {
      await Browser.open({ url });
    } catch (error) {
      window.open(url, '_blank');
    }
  }

  navigateToAddSkill() {
    this.router.navigate(['/tabs/add-resource']);
  }

  getCompletedSteps(topic: LearningTopic): number {
    return topic.subtasks.filter((s) => s.completed).length;
  }

  isResourcesLoading(step: LearningStep): boolean {
    return (
      step.resourcesStatus === 'pending' || step.resourcesStatus === 'loading'
    );
  }

  getTotalResourceCount(topic: LearningTopic): number {
    return topic.subtasks.reduce(
      (sum, s) => sum + (s.resources?.length || 0),
      0
    );
  }

  getCompletedResourceCount(topic: LearningTopic): number {
    return topic.subtasks
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + (s.resources?.length || 0), 0);
  }

  async confirmDeleteRoadmap(topic: LearningTopic) {
    const alert = await this.alertController.create({
      header: 'Delete Roadmap',
      message: `Are you sure you want to delete "${topic.title}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteRoadmap(topic);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteRoadmap(topic: LearningTopic) {
    try {
      const response = await fetch(`${this.API_URL}/${topic._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        this.learningTopics = this.learningTopics.filter(
          (t) => t._id !== topic._id
        );
        this.stopPolling(topic._id);
      } else {
        console.error('Failed to delete roadmap');
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error);
    }
  }
}
