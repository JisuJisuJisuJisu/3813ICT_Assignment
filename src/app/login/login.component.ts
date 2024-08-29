import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  onLogin() {
    console.log('Login attempt');
    console.log('Form Valid:', this.loginForm.valid);

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      // 로컬 스토리지에서 모든 사용자 정보를 가져옴
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');

      // 저장된 사용자들 중에서 입력한 이메일과 비밀번호가 일치하는 사용자를 찾음
      const user = storedUsers.find((u: User) => u.email === email && u.password === password);

      if (user) {
        console.log('Login successful');
        sessionStorage.setItem('loggedInUserEmail', user.email);
        // 대시보드로 User 객체를 전달하며 이동
        this.router.navigate(['/dashboard'], { state: { user: user } });
      } else {
        console.log('Invalid email or password');
      }
    }
  }
}
