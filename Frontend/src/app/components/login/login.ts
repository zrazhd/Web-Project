import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginDto } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginData: LoginDto = { email: '', password: '' };
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isLoggedIn()) this.router.navigate(['/users']);
  }

  onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      this.error = 'Заполни все поля';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.login(this.loginData).subscribe({
      next: () => this.router.navigate(['/users']),
      error: (err) => {
        this.error = err.error?.message || 'Неверный email или пароль';
        this.loading = false;
      }
    });
  }
}
