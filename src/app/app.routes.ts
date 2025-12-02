import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'shared/:shareId',
    loadComponent: () =>
      import('./shared-roadmap/shared-roadmap.page').then(
        (m) => m.SharedRoadmapPage
      ),
  },
];
