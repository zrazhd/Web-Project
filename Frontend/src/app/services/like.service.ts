import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface LikeResponse {
  id: number;
  from_user: number;
  to_user: number;
  is_match: boolean;  // true if mutual match was created
}

export interface Match {
  id: number;
  user1: MatchedUser;
  user2: MatchedUser;
  created_at: string;
  matched_user: MatchedUser;
  unread_count?: number;
}

export interface MatchedUser {
  id: number;
  name: string;
  age: number;
  city: string;
  photoUrl: string;
  bio: string;
}

@Injectable({ providedIn: 'root' })
export class LikeService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // POST /api/like/<to_user_id>/ — send like
  sendLike(toUserId: number): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`${this.apiUrl}/like/${toUserId}/`, {}).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // DELETE /api/like/<to_user_id>/ — send dislike / remove like
  sendDislike(toUserId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/like/${toUserId}/`).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
