import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  phone: string = '';
  titleSignup: string = 'Sign Up';
  displayedTextSignup: string = '';
  charIndexSignup: number = 0;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.animateTitle();
  }

  animateTitle() {
    setInterval(() => {
      if (this.charIndexSignup < this.titleSignup.length) {
        this.displayedTextSignup += this.titleSignup[this.charIndexSignup];
        this.charIndexSignup++;
      }
    }, 500);
  }

  onSignup() {
    console.log('Signup:', { name: this.name, email: this.email, phone: this.phone });

    if ( this.validateForm()) {
      const formData = {
        name: this.name,
        email: this.email,
        password: this.password,
        phoneNumber: this.phone,
      };

      this.authService.signup(formData).subscribe(
        (response) => {
          console.log('Signup successful', response);
          this.authService.saveToken(response.token, response.name);
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          if( error.error.message == 'User already exists' ){
            alert( 'Email already exists please login' );
          }
          else{
            alert('Signup failed, please check the details and try again');
          }
        }
      );
    }
  }

  validateForm(): boolean {
    if (this.name.length < 5) {
      alert('Name should be at least 5 characters long.');
      return false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.email)) {
      alert('Please enter a valid email address.');
      return false;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(this.password)) {
      alert(
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
      );
      return false;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return false;
    }

    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(this.phone)) {
      alert('Phone number should be exactly 10 digits.');
      return false;
    }

    return true;
  }
}
