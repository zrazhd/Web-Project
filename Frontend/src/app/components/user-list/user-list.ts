import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserCardComponent } from '../user-card/user-card';
import { UserService } from '../../services/user';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [UserCardComponent, FormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';

  // Filter controls (ngModel ×4 total in app)
  filterCity = '';
  filterGender = '';
  filterMinAge = 18;
  filterMaxAge = 99;

  constructor(private userService: UserService) {}

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.userService.getUsers({
      city: this.filterCity || undefined,
      gender: this.filterGender || undefined,
      minAge: this.filterMinAge,
      maxAge: this.filterMaxAge
    }).subscribe({
      next: (data) => { this.users = data; this.loading = false; },
      error: (err) => {
        this.error = err.error?.message || 'Не удалось загрузить анкеты. Проверь подключение к серверу.';
        this.loading = false;
      }
    });
  }

  applyFilters() { this.loadUsers(); }

  resetFilters() {
    this.filterCity = '';
    this.filterGender = '';
    this.filterMinAge = 18;
    this.filterMaxAge = 99;
    this.loadUsers();
  }

  onLiked(userId: number) {
    // Mark the liked user optimistically
    const u = this.users.find(u => u.id === userId);
    if (u) u.likedByMe = true;
  }
}
