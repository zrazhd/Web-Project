import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import type { Match } from './like.service';
export type { Match };

@Injectable({ providedIn: 'root' })
export class MatchService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // GET /api/matches/ — list of current user's matches
  getMatches(): Observable<Match[]> {
    const t = new Date().getTime();
    return this.http.get<Match[]>(`${this.apiUrl}/matches/?t=${t}`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
