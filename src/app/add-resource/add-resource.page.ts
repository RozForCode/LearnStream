import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
  IonList,
  IonIcon,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { addCircleOutline } from 'ionicons/icons';
import { InAppSearchComponent } from '../components/in-app-search/in-app-search.component';

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
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonButton,
    IonList,
    IonIcon,
    CommonModule,
    FormsModule,
  ],
})
export class AddResourcePage {
  skill = {
    title: '',
    category: '',
    description: '',
    currentSkillLevel: '',
    learningGoal: '',
    targetSkillLevel: '',
    subtasks: [] as { id: number; title: string; completed: boolean }[],
  };

  constructor() {
    addIcons({ addCircleOutline });
  }

  saveSkill() {
    console.log('Skill saved:', this.skill);
    // make a POST request to the API
    fetch('http://localhost:3000/api/resources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: this.skill.title,
        category: this.skill.category,
        description: this.skill.description,
        currentSkillLevel: this.skill.currentSkillLevel,
        learningGoal: this.skill.learningGoal,
        targetSkillLevel: this.skill.targetSkillLevel,
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error('Error:', error));
    // Reset form
    // this.skill = { title: '', category: '', description: '', subtasks: [] };
  }
}
