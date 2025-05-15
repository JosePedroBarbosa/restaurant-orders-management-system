import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService } from '../services/restaurant.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-restaurant-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './restaurant-create.component.html',
  styleUrl: './restaurant-create.component.css'
})

export class RestaurantCreateComponent {
  restaurantForm: FormGroup;
  imageFile: File | null = null;
  message: string = '';

  constructor(private fb: FormBuilder, private restaurantService: RestaurantService) {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      preparationTime: [null, [Validators.required, Validators.min(1)]],
      deliveryTime: [null, [Validators.required, Validators.min(1)]],
      maxDeliveryRadius: [null, [Validators.required, Validators.min(1)]],
      maxOrdersPerHour: [null, [Validators.required, Validators.min(1)]],
      image: [null, Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input?.files?.length) {
      this.imageFile = input.files[0];
      this.restaurantForm.get('image')?.setValue(this.imageFile);
    } else {
      console.warn('No image file selected');
    }
  }

  onSubmit() {
    if (this.restaurantForm.invalid || !this.imageFile) {
      this.message = 'All fields are required.';
      return;
    }

    const formData = new FormData();
    const formValue = this.restaurantForm.value;

    formData.append('name', formValue.name);
    formData.append('description', formValue.description);
    formData.append('street', formValue.street);
    formData.append('city', formValue.city);
    formData.append('postalCode', formValue.postalCode);
    formData.append('preparationTime', formValue.preparationTime);
    formData.append('deliveryTime', formValue.deliveryTime);
    formData.append('maxDeliveryRadius', formValue.maxDeliveryRadius);
    formData.append('maxOrdersPerHour', formValue.maxOrdersPerHour);
    formData.append('image', this.imageFile);

    this.restaurantService.createRestaurant(formData).subscribe({
      next: (res: any) => {
        this.message = 'Restaurant created successfully!';
        this.restaurantForm.reset();
        this.imageFile = null;
      },
      error: (err: any) => {
        console.error('Backend error:', err);
        if (err.error?.message) {
          this.message = err.error.message; 
        } else if (err.message) {
          this.message = err.message;
        } else {
          this.message = 'Unexpected error creating restaurant.';
        }
      }
    });
  }
}