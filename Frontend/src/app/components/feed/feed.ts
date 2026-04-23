import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { LikeService } from '../../services/like.service';
import { Profile } from '../../models/profile.model';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class FeedComponent implements OnInit {
  profiles: Profile[] = [];
  loading = true;
  error = '';

  // Track like/dislike state per profile id
  likedIds = new Set<number>();
  dislikedIds = new Set<number>();
  matchedIds = new Set<number>();
  actionLoading = new Set<number>();
  hasProfile = true;
  activePhotoIndex = new Map<number, number>();

  constructor(
    private profileService: ProfileService,
    private likeService: LikeService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    this.profileService.getMyProfile().subscribe({
      next: () => this.hasProfile = true,
      error: () => this.hasProfile = false
    });

    this.profileService.browseProfiles().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (profiles) => {
        this.profiles = profiles;
      },
      error: (err) => {
        this.error = 'Failed to load profiles.';
      },
    });
  }

  sendLike(profile: Profile): void {
    if (this.actionLoading.has(profile.user)) return;
    this.actionLoading.add(profile.user);
    
    // Optimistic UI Update
    this.likedIds.add(profile.user);
    this.dislikedIds.delete(profile.user);

    this.likeService.sendLike(profile.user).subscribe({
      next: (res) => {
        if (res.is_match) this.matchedIds.add(profile.user);
        this.actionLoading.delete(profile.user);
      },
      error: (err) => {
        if (err.status !== 400) {
          this.likedIds.delete(profile.user); // Revert on actual error
        }
        this.actionLoading.delete(profile.user);
      },
    });
  }

  sendDislike(profile: Profile): void {
    if (this.actionLoading.has(profile.user)) return;
    this.actionLoading.add(profile.user);
    
    // Optimistic UI Update
    this.dislikedIds.add(profile.user);
    this.likedIds.delete(profile.user);
    this.matchedIds.delete(profile.user);

    this.likeService.sendDislike(profile.user).subscribe({
      next: () => {
        this.actionLoading.delete(profile.user);
      },
      error: () => {
        this.dislikedIds.delete(profile.user); // Revert
        this.actionLoading.delete(profile.user);
      },
    });
  }

  getAllPhotos(profile: Profile): string[] {
    const photos: string[] = [];
    if (profile.photo_url) photos.push(profile.photo_url);
    if (profile.additional_photos) {
      photos.push(...profile.additional_photos.map(p => p.url));
    }
    return photos;
  }

  getCurrentPhoto(profile: Profile): string | null {
    const photos = this.getAllPhotos(profile);
    if (!photos.length) return null;
    const idx = this.activePhotoIndex.get(profile.user) || 0;
    return photos[idx < photos.length ? idx : 0];
  }

  nextPhoto(profile: Profile, event: Event): void {
    event.stopPropagation();
    const photos = this.getAllPhotos(profile);
    if (photos.length <= 1) return;
    const current = this.activePhotoIndex.get(profile.user) || 0;
    if (current < photos.length - 1) {
      this.activePhotoIndex.set(profile.user, current + 1);
    }
  }

  prevPhoto(profile: Profile, event: Event): void {
    event.stopPropagation();
    const photos = this.getAllPhotos(profile);
    if (photos.length <= 1) return;
    const current = this.activePhotoIndex.get(profile.user) || 0;
    if (current > 0) {
      this.activePhotoIndex.set(profile.user, current - 1);
    }
  }
}
