import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonInput, IonItem, IonList } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, closeCircleOutline } from 'ionicons/icons';
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
      
      <div *ngIf="isBrowserOpen" class="browser-controls">
        <ion-button expand="block" color="danger" (click)="closeBrowser()">
          <ion-icon name="close-circle-outline" slot="start"></ion-icon>
          Close Browser
        </ion-button>
      </div>
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
    .browser-controls {
      margin-top: 10px;
    }
  `],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonIcon, IonInput, IonItem, IonList]
})
export class InAppSearchComponent implements OnInit, OnDestroy {
  @Input() initialUrl: string = '';
  searchUrl: string = '';
  isBrowserOpen: boolean = false;

  constructor(private iab: InAppBrowserService) {
    addIcons({ searchOutline, closeCircleOutline });
  }

  ngOnInit() {
    if (this.initialUrl) {
      this.searchUrl = this.initialUrl;
    }

    this.iab.addListener('browserClosed', () => {
      console.log('Browser closed event received');
      this.isBrowserOpen = false;
    });
  }

  ngOnDestroy() {
    this.iab.removeAllListeners();
  }

  search() {
    if (!this.searchUrl) return;

    const query = encodeURIComponent(this.searchUrl);
    const url = `https://www.google.com/search?q=${query}`;

    this.isBrowserOpen = true;
    this.iab.openInWebView(url);
  }

  closeBrowser() {
    this.iab.close();
    // Listener will update state, but we can force it here too for responsiveness
    this.isBrowserOpen = false;
  }
}
