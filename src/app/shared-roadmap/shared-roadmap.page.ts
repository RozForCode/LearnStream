import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {

  IonContent,
  IonIcon,
  IonButton,
  IonSpinner,
  IonBadge,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  timeOutline,
  bookOutline,
  videocamOutline,
  logoGithub,
  documentTextOutline,
  linkOutline,
  constructOutline,
  openOutline,
  rocketOutline,
  trophyOutline,
  schoolOutline,
  copyOutline,
  logoTwitter,
  logoLinkedin,
  alertCircleOutline,
} from 'ionicons/icons';
import { Browser } from '@capacitor/browser';

interface ResourceLink {
  title: string;
  url: string;
  type: string;
}

interface LearningStep {
  title: string;
  description: string;
  estimatedTime: string;
  resources: ResourceLink[];
  completed: boolean;
}

interface SharedRoadmap {
  title: string;
  category: string;
  description?: string;
  currentSkillLevel?: string;
  learningGoal?: string;
  targetSkillLevel?: string;
  learningPath: LearningStep[];
  totalSteps: number;
  completedSteps: number;
  createdAt: string;
}

@Component({
  selector: 'app-shared-roadmap',
  templateUrl: './shared-roadmap.page.html',
  styleUrls: ['./shared-roadmap.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    IonButton,
    IonSpinner,
    IonBadge,
    CommonModule,
  ],
})
export class SharedRoadmapPage implements OnInit {
  shareId: string = '';
  roadmap: SharedRoadmap | null = null;
  isLoading = true;
  error: string | null = null;
  linkCopied = false;

  private readonly API_URL = 'http://localhost:3000/api/resources';

  constructor(private route: ActivatedRoute) {
    addIcons({
      checkmarkCircle,
      timeOutline,
      bookOutline,
      videocamOutline,
      logoGithub,
      documentTextOutline,
      linkOutline,
      constructOutline,
      openOutline,
      rocketOutline,
      trophyOutline,
      schoolOutline,
      copyOutline,
      logoTwitter,
      logoLinkedin,
      alertCircleOutline,
    });
  }

  ngOnInit() {
    this.shareId = this.route.snapshot.paramMap.get('shareId') || '';
    if (this.shareId) {
      this.loadRoadmap();
    } else {
      this.error = 'Invalid share link';
      this.isLoading = false;
    }
  }

  async loadRoadmap() {
    try {
      const response = await fetch(`${this.API_URL}/shared/${this.shareId}`);

      if (!response.ok) {
        if (response.status === 404) {
          this.error = 'This roadmap is no longer available or has been made private.';
        } else {
          this.error = 'Failed to load roadmap. Please try again later.';
        }
        this.isLoading = false;
        return;
      }

      this.roadmap = await response.json();
      this.isLoading = false;
    } catch (err) {
      console.error('Error loading shared roadmap:', err);
      this.error = 'Failed to load roadmap. Please check your connection.';
      this.isLoading = false;
    }
  }

  getProgress(): number {
    if (!this.roadmap) return 0;
    return this.roadmap.completedSteps / this.roadmap.totalSteps;
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      mobile: 'Mobile Development',
      frontend: 'Frontend Development',
      backend: 'Backend Development',
      design: 'UI/UX Design',
      ai: 'AI & Machine Learning',
      devops: 'DevOps',
      security: 'Security',
      data: 'Data Science',
      gamedev: 'Game Development',
      other: 'Other',
    };
    return labels[category] || category;
  }

  getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      absolute_beginner: 'Absolute Beginner',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      expert: 'Expert',
    };
    return labels[level] || level;
  }

  getGoalLabel(goal: string): string {
    const labels: Record<string, string> = {
      career_switch: 'Career Switch',
      job_ready: 'Get Job Ready',
      side_project: 'Build Side Projects',
      upskill: 'Upskill at Work',
      fundamentals: 'Learn Fundamentals',
      certification: 'Get Certified',
    };
    return labels[goal] || goal;
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
    } catch {
      window.open(url, '_blank');
    }
  }

  async copyLink() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      this.linkCopied = true;
      setTimeout(() => {
        this.linkCopied = false;
      }, 2000);
    } catch {
      console.error('Failed to copy link');
    }
  }

  shareToTwitter() {
    if (!this.roadmap) return;
    const text = `Check out this learning roadmap for ${this.roadmap.title}! 🚀`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  }

  shareToLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  }

  getTotalResources(): number {
    if (!this.roadmap) return 0;
    return this.roadmap.learningPath.reduce(
      (sum, step) => sum + (step.resources?.length || 0),
      0
    );
  }

  getTotalHours(): string {
    if (!this.roadmap) return '0';
    let totalMin = 0;
    let totalMax = 0;

    this.roadmap.learningPath.forEach((step) => {
      const match = step.estimatedTime?.match(/(\d+)-?(\d+)?/);
      if (match) {
        totalMin += parseInt(match[1]) || 0;
        totalMax += parseInt(match[2]) || parseInt(match[1]) || 0;
      }
    });

    if (totalMin === totalMax) {
      return `${totalMin}`;
    }
    return `${totalMin}-${totalMax}`;
  }
}
