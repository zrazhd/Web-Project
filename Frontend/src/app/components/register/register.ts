import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterDto } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  newUser: RegisterDto = {
    name: '',
    age: 18,
    city: '',
    photoUrl: '',
    bio: '',
    gender: '',
    interests: '',
    email: '',
    password: ''
  };

  loading = false;
  error = '';
  success = '';

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/users']);
  }

  onRegister() {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password || !this.newUser.gender) {
      this.error = 'Заполни все обязательные поля';
      return;
    }
    if (this.newUser.password.length < 6) {
      this.error = 'Пароль должен быть минимум 6 символов';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.register(this.newUser).subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err) => {
        this.error = err.error?.message || 'Ошибка при регистрации. Попробуй снова.';
        this.loading = false;
      }
    });
  }
}
