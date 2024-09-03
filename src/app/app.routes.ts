import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SuperAdminComponent } from './super-admin/super-admin.component';
import { GroupAdminComponent } from './group-admin/group-admin.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageGroupsComponent } from './manage-groups/manage-groups.component';
import { ManageChannelsComponent } from './manage-channels/manage-channels.component';
import { GroupListComponent } from './group-list/group-list.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, children:[
    { path: '', component: GroupListComponent}
  ] }, 
  {
    path: 'super-admin',
    component: SuperAdminComponent,
    children: [
      { path: 'manage-users', component: ManageUsersComponent },
      { path: 'manage-groups', component: ManageGroupsComponent },
      { path: 'manage-channels', component: ManageChannelsComponent },
    ]
  },
  {
    path: 'group-admin',
    component: GroupAdminComponent,  // Group Admin 전용 레이아웃을 원하면 별도의 컴포넌트로 교체 가능
    children: [
      { path: 'manage-groups', component: ManageGroupsComponent }
    ]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'prefix' },  // 기본 경로를 로그인 페이지로 리디렉션
  { path: '**', redirectTo: '/login' }, // 유효하지 않은 경로 처리
];
