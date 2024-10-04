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
  messages: { userId: string | null, message: string }[] = []; // 메시지 리스트
  newMessage: string = ''; // 새로운 메시지 입력 필드
  channelId: string = ''; // 채널 ID - 실제 채널 ID를 넣어주세요.
  username: string = ''; // 사용자의 사용자 이름
  userId: string = ''; // 사용자의 ID

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    //get User data from session Storage
    const loggedInUser = sessionStorage.getItem('loggedinUser');
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      this.username = user.username;
      this.userId = user._id; // 사용자 ID 가져오기
    }

    // get Channel ID from URL
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
    this.socket = io('http://localhost:3000'); // 서버 주소로 연결

    // 채널에 참여
    if (this.socket) {
      this.socket.emit('join-channel', this.channelId);
    }

    // 예시로 채널에서 새로운 메시지를 수신
    this.socket.on('new-message', (message) => {
      console.log('새로운 메시지 수신:', message);
      this.messages.push(message); // 수신한 메시지를 메시지 리스트에 추가
    });
  }

  // MongoDB에서 채팅 히스토리 가져오기
  loadMessageHistory(): void {
    this.http.get<{ userId: string | null, message: string }[]>(`http://localhost:3000/messages?channelId=${this.channelId}`)
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
      this.socket.emit('send-message', messageData); // 서버로 메시지 전송
      console.log('서버로 메시지를 보냈습니다:', messageData);
      this.newMessage = ''; // 메시지 입력 필드 초기화
    }
  }
}
