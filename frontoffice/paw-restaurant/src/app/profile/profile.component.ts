import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})

export class ProfileComponent implements OnInit {
  user: any;
  errorMessage: string | null = null;
  orderHistory: any[] = [];
  historyLoading: boolean = true;
  historyError: string = '';

  constructor(private authService: AuthService, private orderService: OrderService) {}

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (data) => {
        console.log('Received user data:', data);
        this.user = data;

        if (this.isRestaurant()) {
          this.loadRestaurantOrderHistory();
        } else {
          this.loadOrderHistory(); 
        }
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
        this.errorMessage = 'Failed to load user details';
      },
    });
  }
  
  loadOrderHistory(): void {
    this.historyLoading = true;

    this.orderService.getUserOrderHistory().subscribe({
      next: (res) => {
        this.orderHistory = res.orders;
        this.historyLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar histórico de encomendas:', err);
        this.historyError = err.error?.message || 'Erro ao carregar histórico';
        this.historyLoading = false;
      }
    });
  }

  loadRestaurantOrderHistory(): void {
    this.historyLoading = true;
    console.log(this.user._id);
  
    this.orderService.getRestaurantOrderHistory(this.user._id).subscribe({
      next: (res) => {
        this.orderHistory = res.orders;
        this.historyLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar histórico do restaurante:', err);
        this.historyError = err.error?.message || 'Erro ao carregar histórico';
        this.historyLoading = false;
      }
    });
  }

  // Métodos para verificar roles
  isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }
  
  isRestaurant(): boolean {
    return this.authService.hasRole('restaurant');
  }
}