import { CommonModule } from '@angular/common'; 
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RestaurantService } from '../services/restaurant.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule]
})

export class HomeComponent implements OnInit {
  restaurants: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  howItWorks = [
    {
      icon: 'bi bi-shop',
      title: 'Find a Restaurant',
      description: 'Browse our curated selection of local restaurants with verified quality and service.'
    },
    {
      icon: 'bi bi-menu-button',
      title: 'Choose Your Meal',
      description: 'Explore menus and select your favorite dishes from a wide variety of options.'
    },
    {
      icon: 'bi bi-truck',
      title: 'Get It Delivered',
      description: 'Place your order and receive it at your doorstep - hot, fresh and on time.'
    }
  ];

  constructor(private restaurantService: RestaurantService) { }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.restaurantService.getAllRestaurants().pipe(
      catchError(error => {
        console.error('Error fetching restaurants:', error);
        this.errorMessage = 'Failed to load restaurants. Please try again later.';
        return of({
          status: 'error',
          data: [] 
        });
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe(response => {
      // Extrair os restaurantes da resposta
      if (response && response.restaurants && Array.isArray(response.restaurants)) {
          this.restaurants = response.restaurants;
        } else {
          console.warn('Unexpected API response structure:', response);
          this.restaurants = [];
      }  
    });
  }

  getFullImageUrl(imagePath: string): string {
    const baseUrl = 'http://localhost:3000/';
    return imagePath ? baseUrl + imagePath : 'assets/images/default-restaurant.png';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = 'assets/images/default-restaurant.png';
    }
  }
}