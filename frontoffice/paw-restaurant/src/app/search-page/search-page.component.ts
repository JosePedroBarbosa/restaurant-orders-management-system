import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuService } from '../services/menu.service';

@Component({
  standalone: true,
  selector: 'app-search-page',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})

export class SearchPageComponent implements OnInit {
  searchForm: FormGroup;
  categories: any[] = [];
  restaurants: any[] = [];
  menuItems: any[] = [];

  constructor(private fb: FormBuilder, private menuService: MenuService) {
    this.searchForm = this.fb.group({
      name: [''],
      category: [''],
      restaurant: [''],
      location: [''],
      minPrice: [''],
      maxPrice: ['']
    });
  }

  ngOnInit(): void {
    this.loadFilters();
  }

  loadFilters(): void {
    this.menuService.getFilters().subscribe(data => {
      this.categories = data.categories;
      this.restaurants = data.restaurants;
    });
  }

  onSearch(): void {
    const filters = this.searchForm.value;
    this.menuService.searchMenuItems(filters).subscribe(data => {
      this.menuItems = data.menuItems;
    });
  }

  getMenuItemFullImageUrl(imagePath: string): string {
    const baseUrl = 'http://localhost:3000/';
    return imagePath ? baseUrl + imagePath : 'assets/images/default-menu-item.png';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/default-menu-item.png';
  }

}