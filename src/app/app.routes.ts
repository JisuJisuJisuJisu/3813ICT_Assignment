import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent }, 
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // 기본 경로를 로그인 페이지로 리디렉션
  { path: '**', redirectTo: '/login' }, // 유효하지 않은 경로 처리
];
