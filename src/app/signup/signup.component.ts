import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../models/user.model'; // User 인터페이스 import

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;

  // Router를 생성자에 추가하여 주입합니다.
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
        username: username, // 이메일에서 추출한 username 사용
        email: email,
        roles: ['User'],  // 기본 역할 설정
        groups: []        // 초기 그룹은 없음
      };

      // 로컬 스토리지에 이메일과 비밀번호 저장
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPassword', password);

      console.log('Signup successful');
      
      // 로그인 페이지로 리디렉션
      this.router.navigate(['/login']);
    }
  }
}
