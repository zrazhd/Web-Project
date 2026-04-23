import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  constructor(
    private profileService: ProfileService,
    private likeService: LikeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
    this.likeService.sendLike(profile.user).subscribe({
      next: (res) => {
        this.likedIds.add(profile.user);
        this.dislikedIds.delete(profile.user);
        if (res.is_match) this.matchedIds.add(profile.user);
        this.actionLoading.delete(profile.user);
      },
      error: (err) => {
        // 400 = already liked
        if (err.status === 400) this.likedIds.add(profile.user);
        this.actionLoading.delete(profile.user);
      },
    });
  }

  sendDislike(profile: Profile): void {
    if (this.actionLoading.has(profile.user)) return;
    this.actionLoading.add(profile.user);
    this.likeService.sendDislike(profile.user).subscribe({
      next: () => {
        this.dislikedIds.add(profile.user);
        this.likedIds.delete(profile.user);
        this.matchedIds.delete(profile.user);
        this.actionLoading.delete(profile.user);
      },
      error: () => {
        this.actionLoading.delete(profile.user);
      },
    });
  }
}
