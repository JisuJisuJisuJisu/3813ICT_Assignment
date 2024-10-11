import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Peer } from 'peerjs';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel.component.html',
  styleUrls: ['./channel.component.css']
})
export class ChannelComponent implements OnInit, OnDestroy {
  private socket: Socket | null = null;
  messages: { userId: string | null, username: string, message: string, profileImageUrl?: string, isImage?: boolean, timestamp?: string }[] = []; // Message list
  newMessage: string = ''; // New message input field
  channelId: string = ''; // Channel ID
  username: string = ''; // User's username
  userId: string = ''; // User's ID
  selectedFile: File | null = null; // Selected file
  videoCallActive: boolean = false; 

  // PeerJS 관련 변수
  private peer: Peer | null = null; // PeerJS 객체
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private myPeerId: string | null = null;
  
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

    // PeerJS 
    this.peer = new Peer({
      host: 'localhost', 
      port: 9001, 
      path: '/peerjs'
    });

    this.peer.on('open', (id: string) => {
      this.myPeerId = id;
      console.log('My Peer ID is: ', id);
      

    });

    

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        this.localStream = stream;
        const localVideoElement = document.querySelector('video#local-video') as HTMLVideoElement;
        if (localVideoElement) {
          localVideoElement.srcObject = stream; 
        }
      })
      .catch(err => {
        console.error('Failed to get local stream', err);
      });
      

    if (this.peer) {
      this.peer.on('call', (call) => {
        call.answer(this.localStream || undefined); 
        call.on('stream', (remoteStream: MediaStream) => {
          this.remoteStream = remoteStream;
          const remoteVideoElement = document.querySelector('video#remote-video') as HTMLVideoElement;
          if (remoteVideoElement) {
            remoteVideoElement.srcObject = remoteStream; 
          }
        });
      });
    }
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.peer) {
      this.peer.destroy();
    }
  }

  // 영상 통화 시작
startVideoCall(): void {
  // Check if PeerJS and local stream are ready
  if (!this.peer || !this.localStream) {
    console.error('PeerJS or local stream is not ready.');
    return;
  }

  // Notify the current user with their Peer ID
  alert(`Your Peer ID is: ${this.myPeerId}`);
  this.videoCallActive = true;

  // Send the Peer ID as a normal message through the socket
  const peerIdMessage = {
    channelId: this.channelId,  // 현재 채널 ID
    userId: this.userId,  // 실제 사용자 ID
    username: this.username,  // 실제 사용자 이름
    message: `${this.username}'s Peer ID is: ${this.myPeerId}`,  // Peer ID 메시지로 추가
    timestamp: new Date().toLocaleString(),  // 현재 시간 추가
    isImage: false
  };
  
  
  // Local message push
  this.messages.push(peerIdMessage);

  // Broadcast the Peer ID message to other users in the channel
  if (this.socket) {
    this.socket.emit('peer-id', peerIdMessage); // 서버로 전송
  }

  // Prompt user to enter the remote peer ID
  const remotePeerId = prompt('Enter the remote peer ID:');
  if (remotePeerId) {
    const call = this.peer.call(remotePeerId, this.localStream || undefined); // Handle null by passing undefined
    console.log('Attempting to call remote peer:', remotePeerId);

    // Listen for the remote stream and set it to the video element
    call.on('stream', (remoteStream: MediaStream) => {
      this.remoteStream = remoteStream;
      const remoteVideoElement = document.querySelector('video#remote-video') as HTMLVideoElement;
      if (remoteVideoElement) {
        remoteVideoElement.srcObject = remoteStream; // Set the remote video stream
      }
    });

    // Handle any errors during the call
    call.on('error', (err: any) => {
      console.error('Error during the call:', err);
    });
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

    // Listen for users joining the channel
    this.socket.on('user-joined', (data) => {
      console.log('Join event data:', data); 
      this.messages.push({
        userId: null,  // System message
        username: 'System',
        message: `User has joined the channel at ${data.timestamp}`,
        isImage: false,
        timestamp: data.timestamp
      });
    });

    // Listen for users leaving the channel
    this.socket.on('user-left', (data) => {
      console.log('Leave event data:', data); 
      this.messages.push({
        userId: null,  // System message
        username: 'System',
        message: `User has left the channel at ${data.timestamp}`,
        isImage: false,
        timestamp: data.timestamp
      });
    });

    // Listen for new messages
    this.socket.on('new-message', (message) => {
      console.log('Received new message:', message);

      // Check if the message is an image URL
      const isImage = message.text && (message.text.endsWith('.jpg') || message.text.endsWith('.png') || message.text.endsWith('.gif'));

      // Add the new message to the message list, including the timestamp
      this.messages.push({
        userId: message.userId,
        username: message.username,
        message: message.text,
        profileImageUrl: message.profileImageUrl,
        isImage: isImage,
        timestamp: message.timestamp // Add the timestamp to the message
      });
    });
  }

  // Load chat history from MongoDB
  loadMessageHistory(): void {
    this.http.get<{ userId: string | null, username: string, message: string, profileImageUrl: string, timestamp: string }[]>(`http://localhost:3000/messages?channelId=${this.channelId}`)
      .subscribe({
        next: (data) => {
          // Map the message history and include timestamps
          this.messages = data.map(message => {
            const isImage = !!message.message && (message.message.endsWith('.jpg') || message.message.endsWith('.png') || message.message.endsWith('.gif'));
            return {
              ...message,
              isImage: isImage,  // Set the image flag as true or false
              timestamp: message.timestamp // Include the timestamp
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
        userId: this.userId, // User ID retrieved from session
        timestamp: new Date().toLocaleString() // Add the current timestamp
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
            message: imageUrl, // Set image URL as the message
            timestamp: new Date().toLocaleString() // Add the current timestamp
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
