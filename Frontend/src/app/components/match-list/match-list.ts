import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatchService } from '../../services/match.service';
import type { Match } from '../../services/match.service';
import { SlicePipe } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  templateUrl: './match-list.html',
  styleUrl: './match-list.css'
})
export class MatchListComponent implements OnInit, OnDestroy {
  matches: Match[] = [];
  loading = false;
  error = '';
  private pollSub?: Subscription;

  constructor(
    private matchService: MatchService, 
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) { }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() { 
    this.loadMatches(); 
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
  }

  startPolling() {
    // Poll matches every 3 seconds to get unread message count updates
    this.pollSub = interval(3000).subscribe(() => {
      this.fetchMatches(false); // background fetch
    });
  }

  loadMatches() {
    this.fetchMatches(true);
  }

  fetchMatches(showSpinner: boolean) {
    if (showSpinner) this.loading = true;
    this.error = '';
    this.matchService.getMatches().pipe(
      finalize(() => {
        if (showSpinner) this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        // Deep compare or force reference update to ensure CD tracks changes
        this.matches = [...data];
      },
      error: (err) => {
        if (showSpinner) this.error = err.error?.message || 'Failed to load matches. Server unavailable.';
      }
    });
  }
}
