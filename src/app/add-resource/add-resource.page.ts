
import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonButton, IonList, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-add-resource',
  templateUrl: 'add-resource.page.html',
  styleUrls: ['add-resource.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea, IonButton, IonList, IonIcon, CommonModule, FormsModule],
})
export class AddResourcePage {
  resource = {
    title: '',
    category: '',
    description: ''
  };

  constructor() {
    addIcons({ addCircleOutline });
  }

  saveResource() {
    console.log('Resource saved:', this.resource);
    // Reset form
    this.resource = { title: '', category: '', description: '' };
  }
}
