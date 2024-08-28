import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onLogin() {
    console.log('Login attempt');
    console.log('Form Valid:', this.loginForm.valid);
    console.log('Form Errors:', this.loginForm.errors);
    
    if (this.loginForm.valid) {
      
      console.log('hello');
      const { email, password } = this.loginForm.value;
      

      // 로컬 스토리지에서 사용자 정보를 확인
      const storedEmail = localStorage.getItem('userEmail');
      const storedPassword = localStorage.getItem('userPassword');

      if (email === storedEmail && password === storedPassword) {
        console.log('Login successful');
        // 로그인 성공 시 dashboard로 이동
        this.router.navigate(['/dashboard']);
      } else {
        console.log('Invalid email or password');
        console.log('Input Email:', email);
        console.log('Stored Email:', storedEmail);
        console.log('Input Password:', password);
        console.log('Stored Password:', storedPassword);
        // 오류 처리 로직 추가 가능
      }
    }
  }
}
