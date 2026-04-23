import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Profile, ProfilePhoto } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /** GET /api/profile/ — fetch the current user's own profile */
  getMyProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/profile/`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  /** PUT /api/profile/ — update profile fields + optional photo (FormData) */
  updateProfile(data: FormData): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/profile/`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  /** POST /api/profile/ — create profile (first time) */
  createProfile(data: FormData): Observable<Profile> {
    return this.http.post<Profile>(`${this.apiUrl}/profile/`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  /** DELETE /api/profile/ — delete own profile */
  deleteProfile(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profile/`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  /** GET /api/profiles/browse/ — list of other users' profiles */
  browseProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.apiUrl}/profiles/browse/`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  /** POST /api/profile/photos/ — upload an additional photo */
  uploadAdditionalPhoto(file: File): Observable<ProfilePhoto> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<ProfilePhoto>(`${this.apiUrl}/profile/photos/`, formData).pipe(
      catchError(err => throwError(() => err))
    );
  }

  /** DELETE /api/profile/photos/<id>/ — delete an additional photo */
  deleteAdditionalPhoto(photoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/profile/photos/${photoId}/`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  /** POST /api/profile/photos/<id>/set_main/ — swap with main photo */
  setMainPhoto(photoId: number): Observable<{message: string, photo_url: string | null}> {
    return this.http.post<{message: string, photo_url: string | null}>(`${this.apiUrl}/profile/photos/${photoId}/set_main/`, {}).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
