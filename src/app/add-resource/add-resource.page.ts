import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonList,
  IonIcon,
  IonChip,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  checkmarkCircle,
  arrowForwardOutline,
  arrowBackOutline,
  rocketOutline,
  sparklesOutline,
  timeOutline,
  phonePortraitOutline,
  desktopOutline,
  serverOutline,
  colorPaletteOutline,
  hardwareChipOutline,
  cloudOutline,
  terminalOutline,
  shieldCheckmarkOutline,
  analyticsOutline,
  gameControllerOutline,
  videocamOutline,
  bookOutline,
  codeSlashOutline,
  peopleOutline,
} from 'ionicons/icons';

interface Category {
  value: string;
  label: string;
  icon: string;
}

interface SkillLevel {
  value: string;
  label: string;
  emoji: string;
  description: string;
  order: number;
}

interface LearningGoal {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

interface TimeCommitment {
  value: string;
  label: string;
}

interface LearningPreference {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-add-resource',
  templateUrl: 'add-resource.page.html',
  styleUrls: ['add-resource.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonList,
    IonIcon,
    IonChip,
    CommonModule,
    FormsModule,
  ],
})
export class AddResourcePage {
  currentStep = 1;

  skill = {
    title: '',
    category: '',
    description: '',
    currentSkillLevel: '',
    learningGoal: '',
    targetSkillLevel: '',
    timeCommitment: '',
    learningPreference: '',
  };

  categories: Category[] = [
    { value: 'frontend', label: 'Frontend', icon: 'desktop-outline' },
    { value: 'backend', label: 'Backend', icon: 'server-outline' },
    { value: 'mobile', label: 'Mobile', icon: 'phone-portrait-outline' },
    { value: 'ai', label: 'AI / ML', icon: 'hardware-chip-outline' },
    { value: 'devops', label: 'DevOps', icon: 'cloud-outline' },
    { value: 'design', label: 'UI/UX', icon: 'color-palette-outline' },
    { value: 'security', label: 'Security', icon: 'shield-checkmark-outline' },
    { value: 'data', label: 'Data', icon: 'analytics-outline' },
    { value: 'gamedev', label: 'Game Dev', icon: 'game-controller-outline' },
    { value: 'other', label: 'Other', icon: 'terminal-outline' },
  ];

  skillLevels: SkillLevel[] = [
    {
      value: 'absolute_beginner',
      label: 'Absolute Beginner',
      emoji: '🌱',
      description: "I've never worked with this before",
      order: 1,
    },
    {
      value: 'beginner',
      label: 'Beginner',
      emoji: '📚',
      description: "I know the basics but haven't built anything",
      order: 2,
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      emoji: '🔧',
      description: "I've built some projects and understand core concepts",
      order: 3,
    },
    {
      value: 'advanced',
      label: 'Advanced',
      emoji: '⚡',
      description: 'I work with this regularly and know it well',
      order: 4,
    },
  ];

  targetLevels: SkillLevel[] = [
    {
      value: 'beginner',
      label: 'Beginner',
      emoji: '📚',
      description: 'Understand basics and terminology',
      order: 2,
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      emoji: '🔧',
      description: 'Build projects independently',
      order: 3,
    },
    {
      value: 'advanced',
      label: 'Advanced',
      emoji: '⚡',
      description: 'Master complex concepts and patterns',
      order: 4,
    },
    {
      value: 'expert',
      label: 'Expert',
      emoji: '🏆',
      description: 'Deep expertise, can architect solutions',
      order: 5,
    },
  ];

  learningGoals: LearningGoal[] = [
    {
      value: 'career_switch',
      label: 'Career Switch',
      emoji: '🚀',
      description: 'I want to transition into this field professionally',
    },
    {
      value: 'job_ready',
      label: 'Get Job Ready',
      emoji: '💼',
      description: 'Prepare for interviews and land a job',
    },
    {
      value: 'side_project',
      label: 'Build Side Projects',
      emoji: '🛠️',
      description: 'I want to build personal projects or apps',
    },
    {
      value: 'upskill',
      label: 'Upskill at Work',
      emoji: '📈',
      description: 'Improve my skills for my current role',
    },
    {
      value: 'fundamentals',
      label: 'Learn Fundamentals',
      emoji: '🎓',
      description: 'Just want to understand how things work',
    },
    {
      value: 'certification',
      label: 'Get Certified',
      emoji: '🏅',
      description: 'Prepare for a certification exam',
    },
  ];

  timeCommitments: TimeCommitment[] = [
    { value: 'casual', label: '1-3 hrs/week' },
    { value: 'moderate', label: '4-7 hrs/week' },
    { value: 'dedicated', label: '8-15 hrs/week' },
    { value: 'intensive', label: '15+ hrs/week' },
  ];

  learningPreferences: LearningPreference[] = [
    { value: 'video', label: 'Videos', icon: 'videocam-outline' },
    { value: 'reading', label: 'Reading', icon: 'book-outline' },
    { value: 'hands_on', label: 'Hands-on', icon: 'code-slash-outline' },
    { value: 'mixed', label: 'Mixed', icon: 'people-outline' },
  ];

  constructor(
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      addCircleOutline,
      checkmarkCircle,
      arrowForwardOutline,
      arrowBackOutline,
      rocketOutline,
      sparklesOutline,
      timeOutline,
      phonePortraitOutline,
      desktopOutline,
      serverOutline,
      colorPaletteOutline,
      hardwareChipOutline,
      cloudOutline,
      terminalOutline,
      shieldCheckmarkOutline,
      analyticsOutline,
      gameControllerOutline,
      videocamOutline,
      bookOutline,
      codeSlashOutline,
      peopleOutline,
    });
  }

  nextStep() {
    if (this.canProceed()) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.skill.title.trim().length > 0 && this.skill.category !== '';
      case 2:
        return (
          this.skill.currentSkillLevel !== '' &&
          this.skill.targetSkillLevel !== ''
        );
      default:
        return true;
    }
  }

  canSubmit(): boolean {
    return (
      this.skill.title.trim().length > 0 &&
      this.skill.category !== '' &&
      this.skill.currentSkillLevel !== '' &&
      this.skill.targetSkillLevel !== '' &&
      this.skill.learningGoal !== ''
    );
  }

  isTargetDisabled(targetValue: string): boolean {
    if (!this.skill.currentSkillLevel) return false;

    const currentLevel = this.skillLevels.find(
      (l) => l.value === this.skill.currentSkillLevel
    );
    const targetLevel = this.targetLevels.find((l) => l.value === targetValue);

    if (!currentLevel || !targetLevel) return false;

    // Target must be higher than current
    return targetLevel.order <= currentLevel.order;
  }

  getCategoryLabel(value: string): string {
    const cat = this.categories.find((c) => c.value === value);
    return cat ? cat.label : value;
  }

  getLevelLabel(value: string): string {
    const level = [...this.skillLevels, ...this.targetLevels].find(
      (l) => l.value === value
    );
    return level ? level.label : value;
  }

  async saveSkill() {
    if (!this.canSubmit()) {
      const toast = await this.toastController.create({
        message: 'Please fill in all required fields',
        duration: 2000,
        color: 'warning',
        position: 'top',
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creating your personalized roadmap...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      const response = await fetch('http://localhost:3000/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: this.skill.title,
          category: this.skill.category,
          description: this.buildDescription(),
          currentSkillLevel: this.skill.currentSkillLevel,
          learningGoal: this.skill.learningGoal,
          targetSkillLevel: this.skill.targetSkillLevel,
        }),
      });

      if (response.ok) {
        await loading.dismiss();

        const toast = await this.toastController.create({
          message: 'Roadmap created! AI is gathering resources...',
          duration: 3000,
          color: 'success',
          position: 'top',
        });
        await toast.present();

        // Reset form
        this.resetForm();

        // Navigate to dashboard
        this.router.navigate(['/tabs/dashboard']);
      } else {
        throw new Error('Failed to create roadmap');
      }
    } catch (error) {
      await loading.dismiss();
      console.error('Error:', error);

      const toast = await this.toastController.create({
        message: 'Failed to create roadmap. Please try again.',
        duration: 3000,
        color: 'danger',
        position: 'top',
      });
      await toast.present();
    }
  }

  private buildDescription(): string {
    const parts = [];

    if (this.skill.description) {
      parts.push(this.skill.description);
    }

    if (this.skill.timeCommitment) {
      const time = this.timeCommitments.find(
        (t) => t.value === this.skill.timeCommitment
      );
      if (time) {
        parts.push(`Time commitment: ${time.label}`);
      }
    }

    if (this.skill.learningPreference) {
      const pref = this.learningPreferences.find(
        (p) => p.value === this.skill.learningPreference
      );
      if (pref) {
        parts.push(`Preferred learning style: ${pref.label}`);
      }
    }

    return parts.join('. ');
  }

  private resetForm() {
    this.skill = {
      title: '',
      category: '',
      description: '',
      currentSkillLevel: '',
      learningGoal: '',
      targetSkillLevel: '',
      timeCommitment: '',
      learningPreference: '',
    };
    this.currentStep = 1;
  }
}
