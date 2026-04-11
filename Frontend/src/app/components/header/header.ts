import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  constructor(public auth: AuthService) {}

  get user() { return this.auth.currentUser(); }
  get loggedIn() { return this.auth.isLoggedIn(); }

  logout() { this.auth.logout(); }
}
