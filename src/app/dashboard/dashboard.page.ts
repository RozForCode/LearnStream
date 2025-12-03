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
  IonInput,
  IonModal,
  IonButtons,
  AlertController,
  ToastController,
  ModalController,
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
  bookmarkOutline,
  bookmark,
  createOutline,
  shareOutline,
  shareSocialOutline,
  copyOutline,
  flameOutline,
  trophyOutline,
  closeOutline,
  downloadOutline,
  logoTwitter,
  logoLinkedin,
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

interface Note {
  _id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LearningStep {
  _id: string;
  title: string;
  completed: boolean;
  description: string;
  estimatedTime: string;
  resources: ResourceLink[];
  resourcesStatus: ResourcesStatus;
  notes: Note[];
  bookmarked: boolean;
  expanded?: boolean;
  showNotes?: boolean;
  newNoteContent?: string;
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
  shareId?: string;
  isPublic?: boolean;
}

interface UserProgress {
  currentStreak: number;
  longestStreak: number;
  totalStepsCompleted: number;
  totalRoadmapsCreated: number;
  totalNotesAdded: number;
  achievements: string[];
  activityHeatmap: Record<string, number>;
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
    IonInput,
    IonModal,
    IonButtons,
    CommonModule,
    FormsModule,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  learningTopics: LearningTopic[] = [];
  isLoading = true;
  private pollingIntervals: Map<string, any> = new Map();

  // Progress & Streak
  userProgress: UserProgress | null = null;
  showStreakCelebration = false;

  // Share modal
  shareModalOpen = false;
  shareModalTopic: LearningTopic | null = null;
  shareUrl = '';

  private readonly API_URL = 'https://learnstream-d7cpasdff4fec5hj.canadacentral-01.azurewebsites.net/api/resources';
  private readonly PROGRESS_URL = 'https://learnstream-d7cpasdff4fec5hj.canadacentral-01.azurewebsites.net/api/progress';
  private readonly POLLING_INTERVAL = 3000;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
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
      bookmarkOutline,
      bookmark,
      createOutline,
      shareOutline,
      shareSocialOutline,
      copyOutline,
      flameOutline,
      trophyOutline,
      closeOutline,
      downloadOutline,
      logoTwitter,
      logoLinkedin,
    });
  }

  ngOnInit() {
    this.fetchResources();
    this.fetchProgress();
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

      // Track activity if step was completed
      if (subtask.completed) {
        await this.trackActivity(
          'step_completed',
          topic._id,
          subtask._id,
          `Completed "${subtask.title}" in ${topic.title}`
        );
      }
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

  // ============================================
  // PROGRESS & STREAK METHODS
  // ============================================

  async fetchProgress() {
    try {
      const response = await fetch(this.PROGRESS_URL);
      this.userProgress = await response.json();
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }

  async trackActivity(type: string, roadmapId?: string, stepId?: string, details?: string) {
    try {
      const response = await fetch(`${this.PROGRESS_URL}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, roadmapId, stepId, details }),
      });
      const result = await response.json();

      if (result.newAchievements && result.newAchievements.length > 0) {
        this.showAchievementToast(result.newAchievements);
      }

      // Refresh progress
      await this.fetchProgress();

      // Check for streak celebration
      if (result.currentStreak > 0 && result.currentStreak % 7 === 0) {
        this.triggerStreakCelebration();
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  async showAchievementToast(achievements: string[]) {
    const achievementNames: Record<string, string> = {
      streak_3: '🔥 3-Day Streak!',
      streak_7: '⚡ Week Warrior!',
      streak_30: '🏆 Monthly Master!',
      steps_10: '👣 First Steps!',
      steps_50: '🎯 Milestone Maker!',
      steps_100: '💯 Century Club!',
      roadmaps_3: '🗺️ Path Finder!',
      roadmaps_10: '🧭 Explorer!',
      notes_10: '📝 Note Taker!',
    };

    for (const achievement of achievements) {
      const toast = await this.toastController.create({
        message: `Achievement Unlocked: ${achievementNames[achievement] || achievement}`,
        duration: 3000,
        position: 'top',
        color: 'warning',
        icon: 'trophy-outline',
      });
      await toast.present();
    }
  }

  triggerStreakCelebration() {
    this.showStreakCelebration = true;
    setTimeout(() => {
      this.showStreakCelebration = false;
    }, 3000);
  }

  // ============================================
  // NOTES METHODS
  // ============================================

  toggleNotes(step: LearningStep) {
    step.showNotes = !step.showNotes;
    if (!step.newNoteContent) {
      step.newNoteContent = '';
    }
  }

  async addNote(topic: LearningTopic, step: LearningStep) {
    if (!step.newNoteContent || step.newNoteContent.trim().length === 0) {
      return;
    }

    try {
      const response = await fetch(
        `${this.API_URL}/${topic._id}/steps/${step._id}/notes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: step.newNoteContent }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (!step.notes) step.notes = [];
        step.notes.push(result.note);
        step.newNoteContent = '';

        const toast = await this.toastController.create({
          message: 'Note added!',
          duration: 2000,
          position: 'top',
          color: 'success',
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  }

  async deleteNote(topic: LearningTopic, step: LearningStep, note: Note) {
    const alert = await this.alertController.create({
      header: 'Delete Note',
      message: 'Are you sure you want to delete this note?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            try {
              const response = await fetch(
                `${this.API_URL}/${topic._id}/steps/${step._id}/notes/${note._id}`,
                { method: 'DELETE' }
              );

              if (response.ok) {
                step.notes = step.notes.filter((n) => n._id !== note._id);
              }
            } catch (error) {
              console.error('Error deleting note:', error);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  // ============================================
  // BOOKMARK METHODS
  // ============================================

  async toggleBookmark(topic: LearningTopic, step: LearningStep) {
    try {
      const response = await fetch(
        `${this.API_URL}/${topic._id}/steps/${step._id}/bookmark`,
        { method: 'PATCH' }
      );

      if (response.ok) {
        const result = await response.json();
        step.bookmarked = result.bookmarked;

        const toast = await this.toastController.create({
          message: result.bookmarked ? 'Bookmarked!' : 'Bookmark removed',
          duration: 1500,
          position: 'top',
          color: result.bookmarked ? 'primary' : 'medium',
        });
        await toast.present();
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  }

  // ============================================
  // SHARING METHODS
  // ============================================

  async openShareModal(topic: LearningTopic) {
    this.shareModalTopic = topic;

    // Generate share link if not exists
    if (!topic.shareId) {
      try {
        const response = await fetch(`${this.API_URL}/${topic._id}/share`, {
          method: 'POST',
        });
        const result = await response.json();
        topic.shareId = result.shareId;
        topic.isPublic = true;
      } catch (error) {
        console.error('Error generating share link:', error);
        return;
      }
    }

    // Always use the frontend URL for sharing
    this.shareUrl = `${window.location.origin}/shared/${topic.shareId}`;
    this.shareModalOpen = true;
  }

  closeShareModal() {
    this.shareModalOpen = false;
    this.shareModalTopic = null;
  }

  async copyShareLink() {
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      const toast = await this.toastController.create({
        message: 'Link copied to clipboard!',
        duration: 2000,
        position: 'top',
        color: 'success',
      });
      await toast.present();
    } catch (error) {
      console.error('Error copying link:', error);
    }
  }

  shareToTwitter() {
    if (!this.shareModalTopic) return;
    const text = `Check out my learning roadmap for ${this.shareModalTopic.title}! 🚀`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(this.shareUrl)}`;
    window.open(url, '_blank');
  }

  shareToLinkedIn() {
    if (!this.shareModalTopic) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.shareUrl)}`;
    window.open(url, '_blank');
  }

  async disableSharing(topic: LearningTopic) {
    try {
      await fetch(`${this.API_URL}/${topic._id}/share`, {
        method: 'DELETE',
      });
      topic.isPublic = false;
      this.closeShareModal();

      const toast = await this.toastController.create({
        message: 'Sharing disabled',
        duration: 2000,
        position: 'top',
        color: 'medium',
      });
      await toast.present();
    } catch (error) {
      console.error('Error disabling sharing:', error);
    }
  }

  // ============================================
  // EXPORT PDF
  // ============================================

  async exportToPDF(topic: LearningTopic) {
    // Create a simple HTML representation for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${topic.title} - Learning Roadmap</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
          .meta { color: #666; margin-bottom: 20px; }
          .step { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .step-title { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
          .step-desc { color: #666; font-size: 14px; }
          .step-time { color: #6366f1; font-size: 12px; margin-top: 5px; }
          .completed { background: #f0fdf4; border-color: #22c55e; }
          .completed .step-title::before { content: "✓ "; color: #22c55e; }
          .resources { margin-top: 10px; padding-left: 20px; }
          .resource { font-size: 13px; color: #3b82f6; margin: 5px 0; }
          .notes { margin-top: 10px; padding: 10px; background: #fef3c7; border-radius: 4px; }
          .note { font-size: 13px; margin: 5px 0; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${topic.title}</h1>
        <div class="meta">
          <p><strong>Category:</strong> ${this.getCategoryLabel(topic.category)}</p>
          <p><strong>Goal:</strong> ${topic.learningGoal || 'Not specified'}</p>
          <p><strong>Progress:</strong> ${this.getCompletedSteps(topic)}/${topic.subtasks.length} steps completed</p>
        </div>
        <h2>Learning Path</h2>
        ${topic.subtasks.map((step, i) => `
          <div class="step ${step.completed ? 'completed' : ''}">
            <div class="step-title">${i + 1}. ${step.title}</div>
            <div class="step-desc">${step.description}</div>
            <div class="step-time">⏱️ ${step.estimatedTime}</div>
            ${step.resources && step.resources.length > 0 ? `
              <div class="resources">
                <strong>Resources:</strong>
                ${step.resources.map(r => `<div class="resource">• ${r.title}</div>`).join('')}
              </div>
            ` : ''}
            ${step.notes && step.notes.length > 0 ? `
              <div class="notes">
                <strong>Notes:</strong>
                ${step.notes.map(n => `<div class="note">• ${n.content}</div>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
        <p style="margin-top: 40px; color: #666; font-size: 12px;">
          Generated by LearnStream on ${new Date().toLocaleDateString()}
        </p>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }
}
