import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Match } from './like.service';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // GET /api/matches/ — list of current user's matches
  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.apiUrl}/matches/`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
