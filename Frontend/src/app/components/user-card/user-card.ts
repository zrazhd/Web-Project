import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-user-card',
  standalone: true,
  templateUrl: './user-card.html',
  styleUrl: './user-card.css'
})
export class UserCardComponent {
  @Input() user!: User;
  @Output() liked = new EventEmitter<number>();

  loading = false;
  liked_sent = false;
  error = '';

  constructor(private userService: UserService) {}

  sendLike() {
    if (this.liked_sent || this.loading) return;
    this.loading = true;
    this.error = '';
    this.userService.sendLike(this.user.id).subscribe({
      next: () => {
        this.liked_sent = true;
        this.loading = false;
        this.liked.emit(this.user.id);
      },
      error: (err) => {
        this.error = err.error?.message || 'Ошибка при отправке симпатии';
        this.loading = false;
      }
    });
  }
}
