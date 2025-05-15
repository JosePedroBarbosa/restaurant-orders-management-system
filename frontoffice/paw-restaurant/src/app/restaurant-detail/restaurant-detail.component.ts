import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../services/restaurant.service';

@Component({
  selector: 'app-restaurant-detail',
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class RestaurantDetailComponent implements OnInit {
  restaurant: any;
  errorMessage: string | null = null;
  averageRating: number = 0;
  totalReviews: number = 0;
  math = Math;

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // Obter o ID da URL

    if (id) {
      this.restaurantService.getRestaurantById(id).subscribe({
        next: (data) => {
          console.log('Received restaurant data:', data);
          this.restaurant = data;
        },
        error: (error) => {
          console.error('Error fetching restaurant details:', error);
          this.errorMessage = 'Failed to load restaurant details';
        },
      });

      this.restaurantService.getRestaurantReviewStats(id).subscribe({
        next: (res) => {
          this.averageRating = res.averageRating;
          this.totalReviews = res.totalReviews;
        },
        error: (err) => console.error('Error fetching review stats:', err),
      });
    }
  }

  getRestaurantFullImageUrl(imagePath: string): string {
    const baseUrl = 'http://localhost:3000/';
    return imagePath
      ? baseUrl + imagePath
      : 'assets/images/default-restaurant.png';
  }

  getMenuFullImageUrl(imagePath: string): string {
    const baseUrl = 'http://localhost:3000/';
    return imagePath ? baseUrl + imagePath : 'assets/images/default-menu.png';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/default-restaurant.png';
  }
}
