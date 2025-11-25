import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea, IonButton, IonList } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-resource',
  templateUrl: 'add-resource.page.html',
  styleUrls: ['add-resource.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonSelect, IonSelectOption, IonTextarea, IonButton, IonList, CommonModule, FormsModule],
})
export class AddResourcePage {
  resource = {
    title: '',
    category: '',
    description: ''
  };

  constructor() { }

  saveResource() {
    console.log('Resource saved:', this.resource);
    // Reset form
    this.resource = { title: '', category: '', description: '' };
  }
}
