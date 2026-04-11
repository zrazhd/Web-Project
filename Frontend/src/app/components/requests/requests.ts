import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user';
import { FriendRequest } from '../../models/user.model';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [],
  templateUrl: './requests.html',
  styleUrl: './requests.css'
})
export class RequestsComponent implements OnInit {
  requests: FriendRequest[] = [];
  loading = false;
  error = '';

  constructor(private userService: UserService) {}

  ngOnInit() { this.loadRequests(); }

  loadRequests() {
    this.loading = true;
    this.error = '';
    this.userService.getIncomingRequests().subscribe({
      next: (data) => { this.requests = data; this.loading = false; },
      error: (err) => {
        this.error = err.error?.message || 'Не удалось загрузить заявки';
        this.loading = false;
      }
    });
  }

  accept(req: FriendRequest) {
    this.userService.respondToRequest(req.id, true).subscribe({
      next: (updated) => {
        const idx = this.requests.findIndex(r => r.id === req.id);
        if (idx !== -1) this.requests[idx] = updated;
      },
      error: (err) => { this.error = err.error?.message || 'Ошибка при ответе на заявку'; }
    });
  }

  reject(req: FriendRequest) {
    this.userService.respondToRequest(req.id, false).subscribe({
      next: (updated) => {
        const idx = this.requests.findIndex(r => r.id === req.id);
        if (idx !== -1) this.requests[idx] = updated;
      },
      error: (err) => { this.error = err.error?.message || 'Ошибка при ответе на заявку'; }
    });
  }

  get pendingCount() { return this.requests.filter(r => r.status === 'pending').length; }
}
