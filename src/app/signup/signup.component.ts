import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  onSubmit() {
    console.log('Form submission triggered');
    if (this.signupForm.invalid) {
      alert('Please fill in all required fields.');
      return; 
    }
    if (this.signupForm.valid) {
      console.log('Form is valid');
      const { email, password } = this.signupForm.value;
  
   
      const id = this.generateUniqueId();
  
      // email의 @ 앞 부분을 username으로 사용
      const username = email;
  
     
      const newUser = {
        id: id,
        username: username,
        email: email,
        password: password,
        roles: ['User'], 
        groups: []
      };
  
     
      this.http.post('http://localhost:3000/signup', newUser).subscribe({
        next: (response: any) => {
          console.log('Signup successful', response);
          
          
          const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          storedUsers.push(response); // 서버로부터 받은 데이터를 로컬 스토리지에 저장
          localStorage.setItem('users', JSON.stringify(storedUsers));
  
          
          console.log('Navigating to login page...');
          this.router.navigate(['/login']).then((navigated) => {
            if (navigated) {
              console.log('Navigation to login successful!');
            } else {
              console.error('Navigation to login failed.');
            }
          });
        },
        error: (error) => {
          console.error('There was an error during signup!', error);
        }
      });
    }
  }
}
