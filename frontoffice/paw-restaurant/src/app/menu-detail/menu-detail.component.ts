import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuService } from '../services/menu.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-menu-detail',
  templateUrl: './menu-detail.component.html',
  styleUrl: './menu-detail.component.css',
  standalone: true,
  imports: [CommonModule, RouterModule]
})

export class MenuDetailComponent implements OnInit {
  menu: any;
  errorMessage: string | null = null;

  constructor(private location: Location, private route: ActivatedRoute, private menuService: MenuService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // Obter o ID da URL
    if (id) {
      this.menuService.getMenuById(id).subscribe({
        next: (data) => {
          console.log('Received menu data:', data);
          this.menu = data;
        },
        error: (error) => {
          console.error('Error fetching menu details:', error);
          this.errorMessage = 'Failed to load menu details';
        },
      });
    }
  }

  getMenuFullImageUrl(imagePath: string): string {
    const baseUrl = 'http://localhost:3000/';
    return imagePath ? baseUrl + imagePath : 'assets/images/default-menu.png';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/default-menu.png';
  }

  goBack(): void {
    this.location.back();
  }
}
