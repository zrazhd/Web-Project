import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  editData: Partial<User> = {};
  loading = false;
  saving = false;
  error = '';
  success = '';
  isEditing = false;

  constructor(public auth: AuthService, private userService: UserService) {}

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.editData = { ...user };
    }
  }

  get user() { return this.auth.currentUser(); }

  startEdit() {
    this.isEditing = true;
    this.error = '';
    this.success = '';
  }

  cancelEdit() {
    this.isEditing = false;
    this.editData = { ...this.user! };
    this.error = '';
  }

  saveProfile() {
    if (!this.user) return;
    this.saving = true;
    this.error = '';
    this.success = '';
    this.userService.updateProfile(this.user.id, this.editData).subscribe({
      next: (updated) => {
        localStorage.setItem('user', JSON.stringify(updated));
        this.auth.currentUser.set(updated);
        this.saving = false;
        this.isEditing = false;
        this.success = 'Профиль обновлён!';
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Ошибка при сохранении профиля';
        this.saving = false;
      }
    });
  }

  logout() { this.auth.logout(); }
}
