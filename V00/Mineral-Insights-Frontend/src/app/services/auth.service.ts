import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000'; // Point to the backend with a proxy or direct path
  private tokenKey = 'jwtToken';
  private nameKey = 'name';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());

  // Expose isLoggedIn as an Observable
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  signup(formData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/signup`, formData);
  }
  
  checkIsUserLoggedIn() {
    const token = localStorage.getItem( this.tokenKey ); // Retrieve JWT token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}/`, { headers });
  }


  // Method to get data from the backend
  getData(endpoint: string): Observable<any> {
    const token = localStorage.getItem( this.tokenKey ); // Retrieve JWT token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}${endpoint}`, { headers });
  }

  // Fetch data from backend for reports
  fetchReportData(endpoint: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}${endpoint}`, { headers });
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/login`, credentials);
  }

  // Method to save token after login
  saveToken(token: string, name: string) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.nameKey, name);
    this.isLoggedInSubject.next(true); // Notify observers that user is logged in
  }

  // Method to check if user is logged in based on token presence
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // Method to log out the user and clear the token
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedInSubject.next(false); // Notify observers that user is logged out
  }
}
