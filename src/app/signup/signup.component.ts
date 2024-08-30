import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../models/user.model';
import { Group } from '../models/group.model'; 


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const { email, password } = this.signupForm.value;

      // 고유 ID 생성
      const id = this.generateUniqueId();

      // email의 @ 앞 부분을 username으로 사용
      const username = email.split('@')[0];

      // 새로운 사용자 생성
      const newUser: User = {
        id: id,
        username: username,
        email: email,
        password: password,
        roles: ['User'], 
        groups: []        
      };

      // 기존 사용자 리스트를 가져옴
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // 새 사용자 추가
      users.push(newUser);

      // 사용자 리스트를 로컬 스토리지에 저장
      localStorage.setItem('users', JSON.stringify(users));

      console.log('Signup successful');
      
      // 로그인 페이지로 리디렉션
      this.router.navigate(['/login']);
    }
  }
}
