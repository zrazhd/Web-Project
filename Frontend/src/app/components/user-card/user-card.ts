import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../models/user.model';
import { LikeService } from '../../services/like.service';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css'
})
export class UserCardComponent {
  @Input() user!: User;
  @Output() matched = new EventEmitter<User>();

  loading = false;
  liked = false;
  disliked = false;
  isMatch = false;   // true when mutual match detected
  error = '';
  alreadyLiked = false; // server says already liked

  constructor(private likeService: LikeService) {}

  // (click) event 1 — Like
  sendLike() {
    if (this.liked || this.disliked || this.loading) return;
    this.loading = true;
    this.error = '';
    this.likeService.sendLike(this.user.id).subscribe({
      next: (res) => {
        this.liked = true;
        this.loading = false;
        if (res.is_match) {
          this.isMatch = true;
          this.matched.emit(this.user);
          // Hide match banner after 4s
          setTimeout(() => this.isMatch = false, 4000);
        }
      },
      error: (err) => {
        if (err.status === 400) {
          this.alreadyLiked = true;
          this.liked = true;
          this.error = 'Already liked';
        } else if (err.status === 0) {
          this.error = 'Server unavailable';
        } else {
          this.error = err.error?.message || 'Failed to send like';
        }
        this.loading = false;
      }
    });
  }

  // (click) event 2 — Dislike
  sendDislike() {
    if (this.disliked || this.loading) return;
    this.loading = true;
    this.error = '';
    this.likeService.sendDislike(this.user.id).subscribe({
      next: () => { this.disliked = true; this.liked = false; this.loading = false; },
      error: (err) => {
        this.error = err.status === 0 ? 'Server unavailable' : 'Failed to dislike';
        this.loading = false;
      }
    });
  }
}
