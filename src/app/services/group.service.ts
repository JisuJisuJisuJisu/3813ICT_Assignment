import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private apiUrl = 'http://localhost:3000'; // Server URL

  constructor(private http: HttpClient) { }

  // Method to create a new group: sends a POST request to create a group
  createGroup(newGroup: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/groups`, newGroup);
  }

  // Method to get all groups: sends a GET request to fetch all groups
  getAllGroups(): Observable<any> {
    return this.http.get(`${this.apiUrl}/groups`);
  }

  // Method to get a group by ID: sends a GET request to fetch a specific group
  getGroupById(groupId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/groups/${groupId}`);
  }
}
