import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'ai-assistant',
        loadComponent: () =>
          import('../ai-assistant/ai-assistant.page').then((m) => m.AiAssistantPage),
      },
      {
        path: 'add-resource',
        loadComponent: () =>
          import('../add-resource/add-resource.page').then((m) => m.AddResourcePage),
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/dashboard',
    pathMatch: 'full',
  },
];
