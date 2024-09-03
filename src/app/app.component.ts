import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './models/user.model';  // 사용자 모델을 가져옵니다.
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 's5310537';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.syncUsersWithLocalStorage();
  }

  syncUsersWithLocalStorage(): void {
    this.http.get<User[]>('http://localhost:3000/users').subscribe({
      next: (users: User[]) => {
        // 로컬 스토리지에 사용자 데이터를 저장합니다.
        localStorage.setItem('users', JSON.stringify(users));
        console.log('로컬 스토리지에 사용자 데이터를 업데이트했습니다.');
      },
      error: (error) => {
        console.error('서버에서 사용자 데이터를 가져오는 중 오류 발생:', error);
      }
    });
  }
}
