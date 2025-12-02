import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonInput, IonItem, IonList } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';
import { InAppBrowserService } from '../../services/in-app-browser/in-app-browser.service';

@Component({
  selector: 'app-in-app-search',
  template: `
    <ion-list lines="none" class="search-container">
      <ion-item class="search-input-item">
        <ion-input
          label="Search Google"
          labelPlacement="floating"
          placeholder="Type your query..."
          [(ngModel)]="searchUrl"
          (keyup.enter)="search()">
        </ion-input>
        <ion-button slot="end" fill="clear" (click)="search()">
          <ion-icon name="search-outline"></ion-icon>
        </ion-button>
      </ion-item>
    </ion-list>
  `,
  styles: [`
    .search-container {
      background: transparent;
      padding: 0;
    }
    .search-input-item {
      --background: var(--ion-color-light);
      border-radius: 8px;
      margin-bottom: 10px;
    }
  `],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonIcon, IonInput, IonItem, IonList]
})
export class InAppSearchComponent {
  @Input() initialUrl: string = '';
  searchUrl: string = '';

  constructor(private iab: InAppBrowserService) {
    addIcons({ searchOutline });
  }

  ngOnInit() {
    if (this.initialUrl) {
      this.searchUrl = this.initialUrl;
    }
  }

  search() {
    if (!this.searchUrl) return;

    const query = encodeURIComponent(this.searchUrl);
    const url = `https://www.google.com/search?q=${query}`;

    this.iab.openInWebView(url);
  }
}
