import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder) {
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

      console.log('User signed up with email:', email);

      // 이후에 원하는 페이지로 리디렉션할 수 있습니다.
      // 예: this.router.navigate(['/login']);
    }
  }
}
