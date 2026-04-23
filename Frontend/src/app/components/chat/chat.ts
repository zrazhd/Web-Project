import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ChatService, ChatMessage } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, NgClass],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  chatUserId!: number;
  messages: ChatMessage[] = [];
  newMessage = '';
  loading = true;
  error = '';
  sending = false;

  private pollSub?: Subscription;
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.chatUserId = +id;
        this.loadMessages();
        this.startPolling();
      }
    });
  }

  ngOnDestroy() {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
  }

  loadMessages() {
    this.chatService.getMessages(this.chatUserId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
      })
    ).subscribe({
      next: (data) => {
        // Force new array reference to ensure Change Detection treats it as updated data
        const isNew = this.messages.length !== data.length;
        this.messages = [...data];
        if (isNew) {
          setTimeout(() => this.scrollToBottom(), 100);
        }
      },
      error: (err) => {
        this.error = "Could not load messages.";
      }
    });
  }

  startPolling() {
    // Poll every 3 seconds
    this.pollSub = interval(3000).subscribe(() => {
      this.loadMessages();
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || this.sending) return;
    this.sending = true;
    const text = this.newMessage;
    this.newMessage = ''; // Optimistic clear

    this.chatService.sendMessage(this.chatUserId, text).pipe(
      finalize(() => {
        this.sending = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (msg) => {
        // Update immutably to guarantee UI refresh
        this.messages = [...this.messages, msg];
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => {
        this.error = "Failed to send message.";
        this.newMessage = text; // Restore text
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  isMine(msg: ChatMessage): boolean {
    // It's mine if the sender is not the person I am chatting with
    return msg.sender !== this.chatUserId;
  }
}
