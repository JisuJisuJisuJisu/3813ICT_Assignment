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
      email: ['', [Validators.required]],
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
          // 로그인한 사용자의 정보를 객체로 세션 스토리지에 저장
          const user = {
            _id: response.user._id,
            id: response.user.id,
            username: response.user.username,
            email: response.user.email,
            roles: response.user.roles,
            groups: response.user.groups
          };

          // JSON 형식으로 변환해서 세션 스토리지에 저장
          sessionStorage.setItem('loggedinUserEmail', JSON.stringify(user));
          // sessionStorage.setItem('loggedInUserEmail', response.user.email);
          this.router.navigate(['/dashboard'], { state: { user: response.user } });
        },
        error: (error) => {
          alert(error.error.message);
          console.error('Invalid email or password', error);
        }
      });
    }
  }
}
