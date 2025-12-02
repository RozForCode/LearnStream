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
<<<<<<< HEAD
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
=======
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { InAppSearchComponent } from '../components/in-app-search/in-app-search.component';
import { Toast } from '@capacitor/toast';
>>>>>>> 55a12393c46b4ae710be8431fbb683c82210180c

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss'],
  standalone: true,
<<<<<<< HEAD
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
=======
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonBadge, IonProgressBar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCheckbox, IonTextarea, IonButton, IonIcon, CommonModule, FormsModule, InAppSearchComponent],
>>>>>>> 55a12393c46b4ae710be8431fbb683c82210180c
})
export class DashboardPage implements OnInit, OnDestroy {
  learningTopics: LearningTopic[] = [];
  isLoading = true;
  private pollingIntervals: Map<string, any> = new Map();

  private readonly API_URL = 'http://localhost:3000/api/resources';
  private readonly POLLING_INTERVAL = 3000; // 3 seconds

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
    });
  }

  ngOnInit() {
    this.fetchResources();
  }

  ngOnDestroy() {
    // Clear all polling intervals
    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.pollingIntervals.clear();
  }

  ionViewWillEnter() {
    this.fetchResources();
  }

  ionViewWillLeave() {
    // Clear polling when leaving
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

      // Start polling for resources that are still loading
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
    // Don't start duplicate polling
    if (this.pollingIntervals.has(resourceId)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${this.API_URL}/${resourceId}/status`);
        const statusData = await response.json();

        // Update the topic in our list
        const topicIndex = this.learningTopics.findIndex(
          (t) => t._id === resourceId
        );
        if (topicIndex !== -1) {
          const topic = this.learningTopics[topicIndex];
          topic.resourcesStatus = statusData.resourcesStatus;

          // Update each step's status
          statusData.steps.forEach((stepStatus: any) => {
            const step = topic.subtasks.find((s) => s._id === stepStatus._id);
            if (step) {
              step.resourcesStatus = stepStatus.resourcesStatus;
            }
          });

          // If all done, stop polling and refresh full data
          if (
            statusData.resourcesStatus === 'ready' ||
            statusData.resourcesStatus === 'failed'
          ) {
            this.stopPolling(resourceId);
            // Fetch full resource data to get the actual resources
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

<<<<<<< HEAD
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

  async regenerateResources(topic: LearningTopic) {
    try {
      // Clear existing resources and reset status
      topic.resourcesStatus = 'loading';
      topic.subtasks.forEach((s) => {
        s.resourcesStatus = 'pending';
        s.resources = [];
      });

      await fetch(`${this.API_URL}/${topic._id}/retry-resources`, {
        method: 'POST',
      });

      this.startPolling(topic._id);
    } catch (error) {
      console.error('Error regenerating resources:', error);
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

  getResourceColor(type: string): string {
    const colors: Record<string, string> = {
      documentation: 'primary',
      tutorial: 'secondary',
      video: 'danger',
      course: 'tertiary',
      article: 'warning',
      github: 'dark',
      tool: 'success',
      other: 'medium',
    };
    return colors[type] || 'medium';
  }

  async openResource(url: string) {
    try {
      await Browser.open({ url });
    } catch (error) {
      // Fallback for web
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

  getResourcesLoadingCount(topic: LearningTopic): number {
    return topic.subtasks.filter((s) => this.isResourcesLoading(s)).length;
  }

  getTotalResourceCount(topic: LearningTopic): number {
    return topic.subtasks.reduce(
      (sum, s) => sum + (s.resources?.length || 0),
      0
    );
  }

  getCompletedResourceCount(topic: LearningTopic): number {
    // Count resources from completed steps as "completed"
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
        // Remove from local list
        this.learningTopics = this.learningTopics.filter(
          (t) => t._id !== topic._id
        );
        // Stop polling if active
        this.stopPolling(topic._id);
      } else {
        console.error('Failed to delete roadmap');
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error);
    }
  }

  async confirmExtendRoadmap(topic: LearningTopic) {
    const alert = await this.alertController.create({
      header: 'Extend Roadmap',
      message: 'How many additional steps would you like to add?',
      inputs: [
        {
          name: 'steps',
          type: 'number',
          placeholder: 'Number of steps (1-5)',
          min: 1,
          max: 5,
          value: 3,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Add Steps',
          handler: (data) => {
            const steps = Math.min(5, Math.max(1, parseInt(data.steps) || 3));
            this.extendRoadmap(topic, steps);
          },
        },
      ],
    });

    await alert.present();
  }

  async extendRoadmap(topic: LearningTopic, additionalSteps: number) {
    try {
      topic.resourcesStatus = 'loading';

      const response = await fetch(`${this.API_URL}/${topic._id}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalSteps }),
      });

      if (response.ok) {
        // Refresh the resource data
        await this.refreshSingleResource(topic._id);
        // Start polling for new resources
        this.startPolling(topic._id);
      }
    } catch (error) {
      console.error('Error extending roadmap:', error);
      topic.resourcesStatus = 'ready';
=======
  async onSubtaskChange(event: any, subtask: any, topic: any) {
    subtask.completed = event.detail.checked;
    this.updateProgress(topic);

    if (subtask.completed) {
      await Toast.show({
        text: `Subtask '${subtask.title}' completed!`,
        duration: 'short',
        position: 'bottom',
      });
>>>>>>> 55a12393c46b4ae710be8431fbb683c82210180c
    }
  }
}
