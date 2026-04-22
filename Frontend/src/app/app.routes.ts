import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent),
  },
  // A2: profile and feed routes — add here with canActivate: [authGuard]
  // A3: matches route — see app.routes.PATCH.ts
  { path: '**', redirectTo: 'login' },
];
