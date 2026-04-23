import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ChatMessage {
  id: number;
  sender: number;
  receiver: number;
  content: string;
  timestamp: string;
  is_read: boolean;
  isPending?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'http://localhost:8080/api/chat';

  constructor(private http: HttpClient) {}

  getMessages(userId: number): Observable<ChatMessage[]> {
    // Append a timestamp to perfectly bust aggressive browser cache during polling
    const t = new Date().getTime();
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/${userId}/?t=${t}`).pipe(
      catchError(err => throwError(() => err))
    );
  }

  sendMessage(receiverId: number, content: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/${receiverId}/`, { content }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
