import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { RestaurantService } from '../services/restaurant.service';
import { AdminService } from '../services/admin.service';
import { ActivatedRoute , RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-restaurant-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './restaurant-management.component.html',
  styleUrl: './restaurant-management.component.css'
})

export class RestaurantManagementComponent implements OnInit {
  restaurantForm!: FormGroup;
  restaurantId!: string;
  menus: any[] = [];
  menuItems: any[] = [];
  selectedImage!: File;

  constructor(
    private fb: FormBuilder,
    private restaurantService: RestaurantService,
    private adminService: AdminService,
    private route: ActivatedRoute
  ) {}

  
  ngOnInit(): void {
    this.restaurantId = this.route.snapshot.paramMap.get('id')!;
    this.initForm();
    this.loadRestaurant();
  }

  initForm(): void {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      preparationTime: [0, [Validators.required, Validators.min(1)]],
      deliveryTime: [0, [Validators.required, Validators.min(1)]],
      maxDeliveryRadius: [0, [Validators.required, Validators.min(1)]],
      maxOrdersPerHour: [0, [Validators.required, Validators.min(1)]],
    });
  }

  loadRestaurant(): void {
    this.restaurantService.getRestaurantById(this.restaurantId).subscribe(restaurant => {
      this.restaurantForm.patchValue({
        name: restaurant.name,
        description: restaurant.description,
        street: restaurant.address?.street,
        city: restaurant.address?.city,
        postalCode: restaurant.address?.postalCode,
        preparationTime: restaurant.deliverySettings?.preparationTime,
        deliveryTime: restaurant.deliverySettings?.deliveryTime,
        maxDeliveryRadius: restaurant.deliverySettings?.maxDeliveryRadius,
        maxOrdersPerHour: restaurant.deliverySettings?.maxOrdersPerHour
      });
  
      this.menus = restaurant.menus ?? [];
      this.menuItems = restaurant.allMenuItems ?? [];
    });
  }

  onFileSelected(event: any): void {
    this.selectedImage = event.target.files[0];
  }

  deleteMenu(restaurantId: string, menuId: string): void {
    if (!confirm('Are you sure you want to delete this menu?')) return;
  
    this.adminService.deleteMenu(restaurantId, menuId).subscribe({
      next: () => {
        this.menus = this.menus.filter(menu => menu._id !== menuId);
      },
      error: (err) => console.error(err)
    });
  }

  deleteMenuItem(itemId: string): void {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
  
    this.adminService.deleteMenuItem(this.restaurantId, itemId).subscribe({
      next: () => {
        this.menuItems = this.menuItems.filter(item => item._id !== itemId);
      },
      error: (err) => console.error(err)
    });
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('data', JSON.stringify(this.restaurantForm.value));
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.restaurantService.updateRestaurant(this.restaurantId, formData).subscribe({
      next: () => alert('Updated successfully'),
      error: (err) => console.error(err)
    });
  }
}