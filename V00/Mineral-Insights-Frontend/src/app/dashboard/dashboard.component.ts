import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  userName: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserName();
  }

  loadUserName(): void {
    // Decode the JWT to get the user's name (assumes 'name' is in the token payload)
    const token = localStorage.getItem('jwtToken');
    if (token) {
      const name = localStorage.getItem('name');
      this.userName = name || 'User'; // Default to 'User' if name isn't in token
      this.authService.checkIsUserLoggedIn().subscribe((response: any) => {
        console.log(response);
      },
      (error: any) => {
        alert("You have been logged out");
        this.authService.logout();
        this.router.navigate(['/login']);
      });
    } else {
      this.router.navigate(['/login']); // Redirect to login if no token
    }
  }
}
