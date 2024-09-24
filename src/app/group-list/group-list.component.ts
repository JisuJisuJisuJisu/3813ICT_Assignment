import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class GroupListComponent implements OnInit {
  userGroups: Group[] = [];

  @Output() groupSelected = new EventEmitter<Group>();

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // 세션 스토리지에서 'loggedinUser' 값을 가져옴
    const loggedInUserEmail = sessionStorage.getItem('loggedinUserEmail');
    
    // 가져온 데이터를 콘솔에 출력
    console.log('세션에서 가져온 loggedInUser:', loggedInUserEmail);
  
    // 세션 스토리지에 데이터가 없으면 오류 메시지 출력
    if (!loggedInUserEmail) {
      console.error('세션에 저장된 사용자 이메일이 없습니다.');
      return;
    }
  
    // 'loggedinUser'가 JSON 포맷일 경우 파싱
    const user = JSON.parse(loggedInUserEmail) as User;
    console.log('파싱된 사용자 데이터:', user);
    const loggedInUserEmail2 = user.email;
    console.log('로그인된 사용자 이메일:', loggedInUserEmail2);
  
    // 서버에서 사용자 목록을 가져옴
    this.http.get<User[]>('http://localhost:3000/users').subscribe({
      next: (users) => {
        console.log('Fetched users:', users); 
        const foundUser = users.find(u => u.email === loggedInUserEmail);
  
        if (foundUser) {
          console.log('User groups:', foundUser.groups);
          this.userGroups = foundUser.groups;
        } else {
          console.error('사용자를 찾을 수 없습니다.');
        }
      },
      error: (err) => {
        console.error('사용자 정보를 가져오는 중 오류 발생:', err);
      }
    });
  }
  
  onGroupClick(group: Group): void {
    this.groupSelected.emit(group); // 그룹 선택 시 해당 그룹 객체를 부모 컴포넌트로 전달
    this.router.navigate(['/dashboard/group', group.id]);
  }
}
