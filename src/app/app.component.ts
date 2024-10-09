import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './models/user.model';  // Import the User model
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 's5310537';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.syncUsersWithLocalStorage();
  }

  // Fetches the users from the server and syncs with localStorage
  syncUsersWithLocalStorage(): void {
    this.http.get<User[]>('http://localhost:3000/users').subscribe({
      next: (users: User[]) => {
        // Save user data to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        console.log('User data has been updated in localStorage.');
      },
      error: (error) => {
        console.error('Error occurred while fetching user data from the server:', error);
      }
    });
  }
}
