import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
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

      // 서버로 로그인 요청을 보냄
      this.http.post('http://localhost:3000/login', { email, password }).subscribe({
        next: (response: any) => {
          console.log('Login successful');
          sessionStorage.setItem('loggedInUserEmail', response.user.email);
          this.router.navigate(['/dashboard'], { state: { user: response.user } });
        },
        error: (error) => {
          console.error('Invalid email or password', error);
        }
      });
    }
  }
}
