import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { FriendRequest, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  // GET all users with optional filter
  getUsers(filter?: { city?: string; minAge?: number; maxAge?: number; gender?: string }): Observable<User[]> {
    let params = new HttpParams();
    if (filter?.city) params = params.set('city', filter.city);
    if (filter?.minAge) params = params.set('minAge', filter.minAge.toString());
    if (filter?.maxAge) params = params.set('maxAge', filter.maxAge.toString());
    if (filter?.gender) params = params.set('gender', filter.gender);
    return this.http.get<User[]>(this.apiUrl, { params }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // GET single user profile
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // PUT update current user profile
  updateProfile(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // POST send friend/like request
  sendLike(toUserId: number): Observable<FriendRequest> {
    return this.http.post<FriendRequest>(`${this.apiUrl}/like/${toUserId}`, {}).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // GET incoming friend requests
  getIncomingRequests(): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/requests/incoming`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  // PUT accept/reject a request
  respondToRequest(requestId: number, accept: boolean): Observable<FriendRequest> {
    return this.http.put<FriendRequest>(`${this.apiUrl}/requests/${requestId}`, { accept }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
