import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  age: number | null = null;
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  submit() {
    if (this.loading) return;
    this.error = '';
    this.loading = true;
    this.auth.register({
      name: this.name,
      email: this.email,
      password: this.password,
      age: this.age ?? undefined,
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => this.router.navigate(['/feed']),
      error: (err) => {
        const data = err.error;
        this.error = data?.email?.[0] || data?.password?.[0] || data?.name?.[0] || 'Registration failed.';
      },
    });
  }
}
