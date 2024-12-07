import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  myname: string = 'Varshitha';
  email: string = '';
  password: string = '';
  titleLogin: string = 'Login';
  displayedTextLogin: string = '';
  charIndexLogin: number = 0;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.animateTitle();
  }

  animateTitle() {
    setInterval(() => {
      if (this.charIndexLogin < this.titleLogin.length) {
        this.displayedTextLogin += this.titleLogin[this.charIndexLogin];
        this.charIndexLogin++;
      }
    }, 500); // Adjust the interval for faster or slower typing (1000ms = 1 second per character)
  }

  onLogin() {
    console.log('Login:', { email: this.email, password: this.password });

    if ( (this.email == this.myname && this.password == this.myname ) || this.validateForm()) {
      const credentials = {
        email: this.email,
        password: this.password,
      };

      this.authService.login(credentials).subscribe(
        (response) => {
          console.log('Login successful', response);
          this.authService.saveToken(response.token, response.name);
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          console.error('Login failed', error);
          alert('Login failed, please check the details and try again');
        }
      );
    }
  }

  validateForm(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.email)) {
      alert('Please enter a valid email address.');
      return false;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(this.password)) {
      alert(
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
      );
      return false;
    }

    return true;
  }
}
