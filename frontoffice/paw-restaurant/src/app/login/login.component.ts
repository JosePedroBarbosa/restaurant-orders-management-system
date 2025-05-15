import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css' 
})

export class LoginComponent {
  loginForm: FormGroup;
  message: string | null = null;
  passwordVisible: boolean = false; 
  isSubmitting: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    this.clearMessage();
  
    if (this.loginForm.valid) {
      this.isSubmitting = true;
  
      const { userName, password } = this.loginForm.value;
  
      const credentials = { userName, password };
    
      this.authService.login(credentials).subscribe({
        next: (error) => {
          if (error) {
            this.message = this.getErrorMessage(error); 
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.message = error || 'An unexpected error occurred. Please try again later.';
        },
        complete: () => {
          this.isSubmitting = false; 
        }
      });
    } else {
      this.message = 'Please fill in all required fields.';
    }
  }

  private getErrorMessage(error: string): string {
    switch (error) {
      case 'Invalid credentials':
        return 'Invalid username or password.';
      case 'Account not verified':
        return 'Your account is not yet verified. Please check your email.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  clearMessage() {
    this.message = null;
  }
}