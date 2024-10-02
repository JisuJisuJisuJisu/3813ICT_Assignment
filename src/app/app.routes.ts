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
import { GroupDetailComponent } from './group-detail/group-detail.component';
import { ProfileComponent } from './profile/profile.component';
import { JoinGroupComponent } from './join-group/join-group.component';
import { GroupMemberComponent } from './groupmember/groupmember.component';
import { ChannelComponent } from './channel/channel.component';



export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, children:[
    { path: '', component: GroupListComponent},
    { path: 'group/:id', component: GroupDetailComponent, children: [
      { path: 'members', component: GroupMemberComponent }, // GroupDetailComponent의 자식 경로로 이동
      { path: 'channel/:channelId', component: ChannelComponent } 
    ]},
    { path: 'profile', component: ProfileComponent },
    { path: 'joingroup', component:JoinGroupComponent }  
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
    component: GroupAdminComponent, 
    children: [
      { path: 'manage-groups', component: ManageGroupsComponent }
    ]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'prefix' }, 
  { path: '**', redirectTo: '/login' }, 
];

