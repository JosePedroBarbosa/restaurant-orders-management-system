import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent implements OnInit {
  signupForm: FormGroup;
  message: string | null = null;
  isSubmitting: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.signupForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', [Validators.required]],
      password: [
        '',
        [Validators.required, Validators.minLength(6)],
      ],
      confirmPassword: ['', Validators.required],
      role: ['customer', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{4}-\d{3}$/)]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {}

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    this.clearMessage();
  
    if (this.signupForm.valid) {
      this.isSubmitting = true;
  
      const { userName, password, confirmPassword, fullName, street, city, postalCode, role } = this.signupForm.value;
  
      const credentials = { userName, password, confirmPassword, fullName, street, city, postalCode, role };
  
      console.log('Signup attempt with credentials:', credentials);
  
      this.authService.signup(credentials).subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.message = error.error.message || 'An unexpected error occurred.';
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.message = 'Please fill in all required fields.';
    }
}

  get f() {
    return this.signupForm.controls;
  }

  clearMessage() {
    this.message = null;
  }
}