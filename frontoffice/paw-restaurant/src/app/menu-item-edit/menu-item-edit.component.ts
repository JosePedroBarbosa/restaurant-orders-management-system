import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MenuItemService } from '../services/menu-item.service';

@Component({
  standalone: true,
  selector: 'app-menu-item-edit',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './menu-item-edit.component.html',
  styleUrl: './menu-item-edit.component.css'
})

export class MenuItemEditComponent implements OnInit {
  menuItemForm: FormGroup;
  menuItemId: string = '';
  imageFiles: File[] = [];
  imagePreviews: string[] = [];
  categories: any[] = [];
  portions: any[] = [];
  newPortion = { name: '', price: null };
  editMenuItemMessage: string = '';

  constructor(
      private route: ActivatedRoute,
      private fb: FormBuilder,
      private menuItemService: MenuItemService,
      private router: Router
    ) {
      this.menuItemForm = this.fb.group({
        name: ['', Validators.required],
        description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
        category: ['', Validators.required],
        calories: [null, [Validators.required, Validators.min(0)]],
        proteins: [null, [Validators.required, Validators.min(0)]],
        carbs: [null, [Validators.required, Validators.min(0)]],
        fats: [null, [Validators.required, Validators.min(0)]]
      });
    }

    ngOnInit(): void {
      this.menuItemId = this.route.snapshot.paramMap.get('id') || '';
      if (this.menuItemId) {
        this.loadMenuItem();
      }
    }

    loadMenuItem(): void {
      this.menuItemService.getMenuItemById(this.menuItemId).subscribe({
        next: (res) => {
          const item = res.menuItem;
          this.categories = res.categories;
          this.portions = item.portions || [];
  
          this.menuItemForm.patchValue({
            name: item.name,
            description: item.description,
            category: item.category?._id || '',
            calories: item.nutritionalInfo?.calories,
            proteins: item.nutritionalInfo?.proteins,
            carbs: item.nutritionalInfo?.carbs,
            fats: item.nutritionalInfo?.fats
          });
  
          this.imagePreviews = item.images.map((img: string) => this.getMenuItemImageUrl(img));
        },
        error: (err) => {
          this.editMenuItemMessage = err.message || 'Failed to load menu item.';
        }
      });
    }

    getMenuItemImageUrl(imagePath: string): string {
      const baseUrl = 'http://localhost:3000/';
      return imagePath ? baseUrl + imagePath : 'assets/images/default-menu-item.png';
    }

    onImageSelected(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input?.files?.length) {
        this.imageFiles = Array.from(input.files);
        this.imagePreviews = this.imageFiles.map(file => URL.createObjectURL(file));
      }
    }

    onSubmit(): void {
      if (this.menuItemForm.invalid) {
        this.editMenuItemMessage = 'Please correct the errors before submitting.';
        return;
      }
  
      const formData = new FormData();
      const values = this.menuItemForm.value;
  
      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('category', values.category);
      formData.append('calories', values.calories);
      formData.append('proteins', values.proteins);
      formData.append('carbs', values.carbs);
      formData.append('fats', values.fats);

      if (this.imageFiles.length > 0) {
        this.imageFiles.forEach(file => formData.append('images', file));
      }
    
      this.menuItemService.updateMenuItem(this.menuItemId, formData).subscribe({
        next: (res) => {
          this.editMenuItemMessage = res.message || 'Menu item updated successfully!';
          this.imageFiles = [];
          this.loadMenuItem();
        },
        error: (err) => {
          this.editMenuItemMessage = err.message || 'Update failed.';
        }
      });
    }

    onAddPortion(): void {
      const { name, price } = this.newPortion;
      if (!name || !price) return;
    
      this.menuItemService.addPortion(this.menuItemId, name, price).subscribe({
        next: () => {
          this.loadMenuItem(); // Refresh list
          this.newPortion = { name: '', price: null };
        },
        error: (err) => alert(err.message || 'Failed to add portion')
      });
    }
  
    onRemovePortion(portionId: string): void {
      if (!confirm('Are you sure you want to delete this portion?')) return;
  
      this.menuItemService.removePortion(this.menuItemId, portionId).subscribe({
        next: () => this.loadMenuItem(),
        error: (err) => alert(err.message || 'Failed to remove portion')
      });
    }

}
