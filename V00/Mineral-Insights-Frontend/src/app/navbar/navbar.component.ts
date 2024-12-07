import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  displayedTextProject: string = '';
  titleProject: string = 'Mineral Insights';
  charIndexProject: number = 0;
  private authSubscription!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.animateTitle();
    // Subscribe to isLoggedIn$ to get real-time login status updates
    this.authSubscription = this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  animateTitle() {
    setInterval(() => {
      if (this.charIndexProject < this.titleProject.length) {
        this.displayedTextProject += this.titleProject[this.charIndexProject];
        this.charIndexProject++;
      }
    }, 500);
  }

  onLogout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  navigateIfLoggedIn(route: string) {
    if (this.isLoggedIn) {
      this.router.navigate([route]);
    } else {
      alert('You need to be logged in to access this page.');
      this.router.navigate(['/login']);
    }
  }
}
