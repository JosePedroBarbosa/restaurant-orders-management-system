import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuService } from '../services/menu.service';
import { MenuItemService } from '../services/menu-item.service';

@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true,
  selector: 'app-menu-edit',
  templateUrl: './menu-edit.component.html',
  styleUrl: './menu-edit.component.css'
})

export class MenuEditComponent implements OnInit {
  menuForm: FormGroup;
  menuId: string = '';
  editMenuMessage: string = '';
  manageItemsMessage: string = '';
  addItemsMessage: string = '';
  menuItems: any[] = [];
  allItems: any[] = [];
  imageFile: File | null = null;
  existingImageUrl: string = '';
  itemToAdd: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private menuService: MenuService,
    private menuItemService: MenuItemService
  ) {
    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.menuId = this.route.snapshot.paramMap.get('id') || '';
    if (this.menuId) {
      this.loadMenu();
      this.loadAllMenuItems();
    }
  }

  loadMenu(): void {
    this.menuService.getMenuById(this.menuId).subscribe({
      next: (menu) => {
        this.menuItems = menu.menu.menuItems;
        this.menuForm.patchValue({
          name: menu.menu.name,
          description: menu.menu.description
        });
        this.existingImageUrl = menu.menu.image;
      },
      error: (err) => {
        this.editMenuMessage = err.message || 'Failed to load menu';
      }
    });
  }

  loadAllMenuItems(): void {
    this.menuService.getMenuById(this.menuId).subscribe({
      next: (menu) => {
        const restaurantId = menu.menu.restaurant._id;
  
        if (restaurantId) {
          this.menuItemService.getMenuItemsByRestaurant(restaurantId).subscribe({
            next: (res) => {
              this.allItems = res.menuItems;
            },
            error: (err) => {
              console.error('Erro ao carregar menu items por restaurante:', err);
            }
          });
        } else {
          this.menuItemService.getMyMenuItems().subscribe({
            next: (res) => {
              this.allItems = res.menuItems;
            },
            error: (err) => {
              console.error('Erro ao carregar os meus menu items:', err);
            }
          });
        }
      },
      error: (err) => {
        this.editMenuMessage = 'Erro ao carregar menu';
      }
    });
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.imageFile = input.files[0];
      this.menuForm.get('image')?.setValue(this.imageFile);
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

  onSubmit(): void {
    if (this.menuForm.invalid) {
      this.editMenuMessage = 'Please fill out all required fields correctly.';
      return;
    }
  
    const formData = new FormData();
    const formValue = this.menuForm.value;
  
    formData.append('name', formValue.name);
    formData.append('description', formValue.description);
    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }
  
    this.menuService.updateMenu(this.menuId, formData).subscribe({
      next: (res) => {
        this.editMenuMessage = 'Menu updated successfully.';
        this.existingImageUrl = res.menu.image;
        this.imageFile = null;
      },
      error: (err) => {
        this.editMenuMessage = err.message || 'Failed to update menu.';
      }
    });
  }

  onAddItemToMenu(itemId: string): void {
    if (!this.itemToAdd) {
      this.addItemsMessage = 'Please select a valid item to add.';
      return;
    }
  
    this.menuService.addMenuItemToMenu(this.menuId, this.itemToAdd).subscribe({
      next: () => {
        this.loadMenu();
        this.itemToAdd = '';
        this.addItemsMessage = 'Item added to the menu successfully.';
      },
      error: (err) => {
        this.addItemsMessage = err.error?.message || 'Failed to add item.';
      }
    });
  }

  onRemoveItemFromMenu(itemId: string): void {
    const confirmed = confirm('Are you sure you want to remove this menu item?');
    if (!confirmed) return;
  
    this.menuService.removeMenuItemFromMenu(this.menuId, itemId).subscribe({
      next: () => {
        this.menuItems = this.menuItems.filter(item => item._id !== itemId);
        this.manageItemsMessage = 'Menu item removed successfully.';
      },
      error: (err) => {
        this.manageItemsMessage = err.error?.message || 'Failed to remove item.';
      }
    });
  }

  isItemAlreadyInMenu(itemId: string): boolean {
    return this.menuItems.some(item => item._id === itemId);
  }
}
