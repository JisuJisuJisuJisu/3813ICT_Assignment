import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const { email, password } = this.signupForm.value;

      // 로컬 스토리지에 이메일과 비밀번호 저장
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPassword', password);

      console.log('Signup successful');
      
      // 로그인 페이지로 리디렉션
      this.router.navigate(['/login']);
    }
  }
}
