import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {
  constructor(private authService: AuthService) { }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  isCustomer(): boolean {
    const userRole = this.authService.getUserRole();
    return userRole === 'customer' && this.authService.isLoggedIn();
  }

  onLogout(): void {
    this.authService.logout();
  }
}