import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatchService, Match } from '../../services/match.service';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './match-list.html',
  styleUrl: './match-list.css'
})
export class MatchListComponent implements OnInit {
  matches: Match[] = [];
  loading = false;
  error   = '';

  constructor(private matchService: MatchService) {}

  ngOnInit() { this.loadMatches(); }

  loadMatches() {
    this.loading = true;
    this.error   = '';
    this.matchService.getMatches().subscribe({
      next: (data) => { this.matches = data; this.loading = false; },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load matches. Server unavailable.';
        this.loading = false;
      }
    });
  }
}
