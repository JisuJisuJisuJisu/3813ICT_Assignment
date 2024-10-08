import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit, OnDestroy {
  private socket: Socket | null = null;
  messages: { userId: string | null, username: string, message: string, profileImageUrl?: string, isImage?: boolean;}[] = []; // Message list
  newMessage: string = ''; // New message input field
  channelId: string = ''; // Channel ID
  username: string = ''; // User's username
  userId: string = ''; // User's ID
  selectedFile: File | null = null; // Selected file
  
  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Retrieve user data from session storage
    const loggedInUser = sessionStorage.getItem('loggedinUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      this.username = user.username;
      this.userId = user._id; // Retrieve user's ID
    }

    // Retrieve channel ID from the URL
    this.route.paramMap.subscribe(params => {
      this.channelId = params.get('channelId') || ''; // Retrieve channel ID from the URL
      if (this.channelId) {
        this.loadMessageHistory(); // Load the message history from MongoDB
        this.setupSocketConnection(); // Set up the socket connection
      }
    });
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Set up connection with the Socket.IO server
  setupSocketConnection(): void {
    if (this.socket) {
      this.socket.off('new-message');
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:3000'); // Connect to the server

    // Join the channel
    this.socket.emit('join-channel', this.channelId);

    // Listen for new messages
    this.socket.on('new-message', (message) => {
      console.log('Received new message:', message);

      // Check if the message is an image URL
      const isImage = message.text && (message.text.endsWith('.jpg') || message.text.endsWith('.png') || message.text.endsWith('.gif'));

      this.messages.push({
        userId: message.userId,
        username: message.username,
        message: message.text,
        profileImageUrl: message.profileImageUrl,
        isImage: isImage  // Add flag to check if it's an image
      });
    });
  }

  // Load chat history from MongoDB
  loadMessageHistory(): void {
    this.http.get<{ userId: string | null, username: string, message: string, profileImageUrl: string }[]>(`http://localhost:3000/messages?channelId=${this.channelId}`)
      .subscribe({
        next: (data) => {
          // Check each message for image status
          this.messages = data.map(message => {
            const isImage = !!message.message && (message.message.endsWith('.jpg') || message.message.endsWith('.png') || message.message.endsWith('.gif'));
            return {
              ...message,
              isImage: isImage  // Set the image flag as true or false
            };
          });
          console.log('Successfully loaded message history:', this.messages);
        },
        error: (error) => {
          console.error('Failed to load message history:', error);
        }
      });
  }

  // Send a message to the channel
  sendMessage(): void {
    if (this.socket && this.newMessage.trim() !== '') {
      const messageData = {
        channelId: this.channelId, // Actual channel ID
        message: this.newMessage,
        username: this.username, // Username retrieved from session
        userId: this.userId // User ID retrieved from session
      };

      // Send the message to the server
      this.socket.emit('send-message', messageData);
      console.log('Message sent to the server:', messageData);

      // Clear the message input field
      this.newMessage = '';
    }
  }

  // Handle file selection (image)
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; // Store the selected file
    }
  }

  // Handle image sending
  sendImage(): void {
    if (this.selectedFile && this.socket) {  // Check if this.socket is not null
      const formData = new FormData();
      formData.append('image', this.selectedFile);

      this.http.post<{ imageUrl: string }>('http://localhost:3000/upload-chat-image', formData)
        .subscribe(response => {
          const imageUrl = response.imageUrl;

          const messageData = {
            channelId: this.channelId,
            userId: this.userId,
            username: this.username,
            message: imageUrl // Set image URL as the message
          };

          if (this.socket) {  // Double check if this.socket is not null
            this.socket.emit('send-image', messageData);
            console.log('Image message sent to the server:', messageData);
          }

          this.selectedFile = null;
          console.log('Image URL to be sent:', imageUrl);
          console.log('Message data to be sent:', messageData);
        }, error => {
          console.error('Image upload failed:', error);
        });
    }
  }
}
