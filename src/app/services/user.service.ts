import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000'; // Server URL

  constructor(private http: HttpClient) { }

  // User login method: sends a POST request to log in a user
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  // User signup method: sends a POST request to register a new user
  signup(newUser: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, newUser);
  }

  // Get all users: sends a GET request to fetch all users from the server
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  // Get user by email: sends a GET request to fetch a user based on their email
  getUserByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/email`, { params: { email } });
  }
}
