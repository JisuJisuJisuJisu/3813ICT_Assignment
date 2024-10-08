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
  messages: { userId: string | null, username: string, message: string, profileImageUrl?: string,  isImage?: boolean;}[] = []; // 메시지 리스트
  newMessage: string = ''; // 새로운 메시지 입력 필드
  channelId: string = ''; // 채널 ID
  username: string = ''; // 사용자의 사용자 이름
  userId: string = ''; // 사용자의 ID
  selectedFile: File | null = null; // 선택된 파일
 
  

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // 세션 스토리지에서 사용자 데이터 가져오기
    const loggedInUser = sessionStorage.getItem('loggedinUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      this.username = user.username;
      this.userId = user._id; // 사용자 ID 가져오기
    }

    // URL에서 채널 ID 가져오기
    this.route.paramMap.subscribe(params => {
      this.channelId = params.get('channelId') || ''; // URL에서 채널 ID 가져오기
      if (this.channelId) {
        this.loadMessageHistory(); // MongoDB에서 채널의 메시지 히스토리 가져오기
        this.setupSocketConnection(); // 소켓 연결 설정
      }
    });
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Socket.IO 서버와 연결 설정
setupSocketConnection(): void {
  if (this.socket) {
    this.socket.off('new-message');
    this.socket.disconnect();
  }

  this.socket = io('http://localhost:3000'); // 서버 주소로 연결

  // 채널에 참여
  this.socket.emit('join-channel', this.channelId);

  // 새로운 메시지를 수신
  this.socket.on('new-message', (message) => {
    console.log('새로운 메시지 수신:', message);

    // 메시지가 이미지 URL인지 확인
    const isImage = message.text && (message.text.endsWith('.jpg') || message.text.endsWith('.png') || message.text.endsWith('.gif'));

    this.messages.push({
      userId: message.userId,
      username: message.username,
      message: message.text,
      profileImageUrl: message.profileImageUrl,
      isImage: isImage  // 이미지 여부를 확인하여 추가
    });
  });
}

  // MongoDB에서 채팅 히스토리 가져오기
  loadMessageHistory(): void {
    this.http.get<{ userId: string | null, username: string, message: string, profileImageUrl: string }[]>(`http://localhost:3000/messages?channelId=${this.channelId}`)
      .subscribe({
        next: (data) => {
          this.messages = data; // 서버로부터 가져온 메시지 히스토리를 메시지 리스트에 저장
          console.log('메시지 히스토리 불러오기 성공:', data);
        },
        error: (error) => {
          console.error('메시지 히스토리 불러오기 실패:', error);
        }
      });
  }

  // 채널에 메시지 보내기
  sendMessage(): void {
    if (this.socket && this.newMessage.trim() !== '') {
      const messageData = {
        channelId: this.channelId, // 실제 채널 ID
        message: this.newMessage,
        username: this.username, // 세션에서 가져온 사용자 이름
        userId: this.userId // 세션에서 가져온 사용자 ID
      };

      // 서버로 메시지 전송
      this.socket.emit('send-message', messageData);
      console.log('서버로 메시지를 보냈습니다:', messageData);

      // 메시지 입력 필드 초기화
      this.newMessage = '';
      
    }
    
  }

  // 파일 선택 처리 (이미지)
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; // 선택한 파일 저장
    }
  }

  // 이미지 전송 처리
  // 이미지 전송 처리
sendImage(): void {
  if (this.selectedFile && this.socket) {  // this.socket이 null이 아닌지 확인
    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.http.post<{ imageUrl: string }>('http://localhost:3000/upload-chat-image', formData)
      .subscribe(response => {
        const imageUrl = response.imageUrl;

        const messageData = {
          channelId: this.channelId,
          userId: this.userId,
          username: this.username,
          message: imageUrl // 이미지 URL을 message로 설정
        };

        if (this.socket) {  // this.socket이 null이 아닌지 한 번 더 확인
          this.socket.emit('send-image', messageData);
          console.log('서버로 이미지 메시지를 보냈습니다:', messageData);
        }

        this.selectedFile = null;
        console.log('전송될 이미지 URL:', imageUrl);
        console.log('전송될 메시지 데이터:', messageData);
      }, error => {
        console.error('Image upload failed:', error);
      });
  }
}

  
}
