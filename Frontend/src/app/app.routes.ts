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
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'feed',
    loadComponent: () => import('./components/feed/feed').then(m => m.FeedComponent),
    canActivate: [authGuard],
  },
  {
    path: 'matches',
    loadComponent: () => import('./components/match-list/match-list').then(m => m.MatchListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'chat/:id',
    loadComponent: () => import('./components/chat/chat').then(m => m.ChatComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'login' },
];

