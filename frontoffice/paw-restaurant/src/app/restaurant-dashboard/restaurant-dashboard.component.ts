import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RestaurantService } from '../services/restaurant.service';
import { MenuService } from '../services/menu.service';
import { MenuItemService } from '../services/menu-item.service';
import { OrderService } from '../services/order.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';

@Component({
  standalone: true,
  selector: 'app-restaurant-dashboard',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './restaurant-dashboard.component.html',
  styleUrl: './restaurant-dashboard.component.css',
})
export class RestaurantDashboardComponent implements OnInit, OnDestroy {
  restaurantForm: FormGroup;
  menuForm: FormGroup;
  menuItemForm: FormGroup;
  imageFile: File | null = null;
  menuImageFile: File | null = null;
  menuItemImages: File[] = [];
  messageRestaurant: string = '';
  messageMenu: string = '';
  menuItemMessage: string = '';
  menuMessage: string = '';
  restaurantId: string = '';
  categories: any[] = [];
  menus: any[] = [];
  menuItems: any[] = [];
  orders: any[] = [];
  ordersLoading: boolean = true;
  ordersError: string = '';
  existingImageUrl: string = '';
  socket!: Socket;
  newOrderMessage: string = '';
  hasRestaurant: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private restaurantService: RestaurantService,
    private menuService: MenuService,
    private orderService: OrderService,
    private menuItemService: MenuItemService
  ) {
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
      image: [null], // opcional no update.
    });

    this.menuForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required, Validators.minLength(8)],
      image: [null, Validators.required],
    });

    this.menuItemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(8)]],
      category: ['', Validators.required],
      calories: [0, [Validators.required, Validators.min(0)]],
      proteins: [0, [Validators.required, Validators.min(0)]],
      carbs: [0, [Validators.required, Validators.min(0)]],
      fats: [0, [Validators.required, Validators.min(0)]],
      portionName: ['', Validators.required],
      portionPrice: [0, [Validators.required, Validators.min(0)]],
      images: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.restaurantService.getUpdateRestaurantData().subscribe({
      next: (data) => {
        this.hasRestaurant = true;

        const restaurant = data.restaurant;

        this.restaurantId = restaurant._id;


        // Iniciar socket e juntar-se à sala do restaurante
        this.socket = io('http://localhost:3000', { withCredentials: true });

        this.socket.emit('joinRestaurantRoom', this.restaurantId);

        this.socket.on('newOrder', (data) => {
          this.newOrderMessage = `🛎️ Nova encomenda de ${
            data.order.customerName || 'um cliente'
          }`;
          this.loadOrders();

          setTimeout(() => {
            this.newOrderMessage = '';
          }, 5000);
        });

        this.socket.on('orderUpdatedForRestaurant', (data) => {
          const updatedOrder = data.order;

          if (['delivered', 'cancelled'].includes(updatedOrder.status)) {
            this.orders = this.orders.filter((o) => o._id !== updatedOrder._id);
          } else {
            const index = this.orders.findIndex(
              (o) => o._id === updatedOrder._id
            );
            if (index !== -1) {
              this.orders[index] = updatedOrder;
            } else {
              this.orders.unshift(updatedOrder);
            }
          }
        });

        this.categories = data.categories;
        this.menus = data.menus;
        this.menuItems = data.menuItems;

        this.restaurantForm.patchValue({
          name: restaurant.name,
          description: restaurant.description,
          street: restaurant.address.street,
          city: restaurant.address.city,
          postalCode: restaurant.address.postalCode,
          preparationTime: restaurant.deliverySettings.preparationTime,
          deliveryTime: restaurant.deliverySettings.deliveryTime,
          maxDeliveryRadius: restaurant.deliverySettings.maxDeliveryRadius,
          maxOrdersPerHour: restaurant.deliverySettings.maxOrdersPerHour,
        });

        this.existingImageUrl = restaurant.image;
        this.loadOrders();
      },
      error: (err) => {
        if (err.status === 404) {
          this.hasRestaurant = false;
          this.messageRestaurant =
            'You should create a restaurant first in order to access the restaurant dashboard!';
          this.ordersLoading = false;
        } else {
          this.messageRestaurant =
            err.error?.message || 'Failed to load restaurant data';
        }
      },
    });
  }

  loadOrders(): void {
    if (!this.restaurantId) return;

    this.ordersLoading = true;

    this.orderService.getRestaurantOrders(this.restaurantId).subscribe({
      next: (res) => {
        this.orders = res.orders;
        console.log(this.orders);
        this.ordersLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.ordersError = err.error?.message || 'Erro ao carregar encomendas.';
        this.ordersLoading = false;
      },
    });
  }

  onItemImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.menuItemImages = Array.from(input.files);
      this.menuItemForm.get('images')?.setValue(this.menuItemImages);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const selectedFile = input.files[0];
      if (input.id === 'image') {
        this.imageFile = selectedFile;
        this.restaurantForm.get('image')?.setValue(this.imageFile);
      } else if (input.id === 'menuImage') {
        this.menuImageFile = selectedFile;
        this.menuForm.get('image')?.setValue(this.menuImageFile);
      }
    }
  }

  onSubmit(): void {
    if (this.restaurantForm.invalid) {
      this.messageRestaurant = 'Please fill out all required fields';
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

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    this.restaurantService
      .updateRestaurant(this.restaurantId, formData)
      .subscribe({
        next: (res) => {
          this.messageRestaurant = 'Restaurant updated successfully!';
          if (res.data?.image) {
            this.existingImageUrl = res.data.image;
          }
        },
        error: (err: any) => {
          this.messageRestaurant = err.message || 'Update failed';
        },
      });
  }

  onCreateMenu(): void {
    if (this.menuForm.invalid || !this.menuImageFile) {
      this.messageMenu = 'All fields are required for the menu.';
      return;
    }

    const formData = new FormData();
    const formValue = this.menuForm.value;

    formData.append('name', formValue.name);
    formData.append('description', formValue.description);
    formData.append('image', this.menuImageFile);

    this.menuService.createMenu(formData).subscribe({
      next: (res) => {
        this.messageMenu = 'Menu created successfully!';
        this.menuForm.reset();
        this.menuImageFile = null;

        this.menus.push(res.menu);
      },
      error: (err) => {
        this.messageMenu = err.error?.message || 'Error creating menu';
      },
    });
  }

  onDeleteMenu(menuId: string): void {
    if (!confirm('Are you sure you want to delete this menu?')) return;

    this.menuService.deleteMenu(menuId).subscribe({
      next: () => {
        this.menus = this.menus.filter((menu) => menu._id !== menuId);
        this.menuMessage = 'Menu deleted successfully!';
      },
      error: (err) => {
        this.menuMessage = err.message || 'Error deleting menu.';
      },
    });
  }

  onCreateMenuItem(): void {
    if (this.menuItemForm.invalid || this.menuItemImages.length === 0) {
      this.menuItemMessage = 'All fields are required for the menu item.';
      return;
    }

    const formData = new FormData();
    const formValue = this.menuItemForm.value;

    formData.append('name', formValue.name);
    formData.append('description', formValue.description);
    formData.append('category', formValue.category);
    formData.append('calories', formValue.calories);
    formData.append('proteins', formValue.proteins);
    formData.append('carbs', formValue.carbs);
    formData.append('fats', formValue.fats);
    formData.append('portionName', formValue.portionName);
    formData.append('portionPrice', formValue.portionPrice);

    for (const file of this.menuItemImages) {
      formData.append('images', file);
    }

    this.menuItemService.createMenuItem(formData).subscribe({
      next: (res) => {
        this.menuItems.push(res.menuItem);
        this.menuItemMessage = 'Menu item created successfully!';
        this.menuItemForm.reset();
        this.menuItemImages = [];
      },
      error: (err) => {
        this.menuItemMessage =
          err.error?.message || 'Error creating menu item.';
      },
    });
  }

  onDeleteMenuItem(id: string): void {
    if (confirm('Are you sure you want to delete this menu item?')) {
      this.menuItemService.deleteMenuItem(id).subscribe({
        next: () => {
          this.menuItems = this.menuItems.filter((item) => item._id !== id);
          this.menuItemMessage = 'Menu item deleted successfully!';
        },
        error: (err) => {
          this.menuItemMessage = err.message || 'Error deleting menu item';
        },
      });
    }
  }

  updateOrderStatus(orderId: string, newStatus: string): void {
    this.orderService
      .updateOrderStatus(orderId, { status: newStatus })
      .subscribe({
        next: () => {
          if (['delivered', 'cancelled'].includes(newStatus)) {
            this.orders = this.orders.filter((o) => o._id !== orderId);
          } else {
            const order = this.orders.find((o) => o._id === orderId);
            if (order) order.status = newStatus;
          }
        },
        error: (err) => {
          console.error('Erro ao atualizar estado da encomenda:', err);
        },
      });
  }

  onCancelOrder(orderId: string): void {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.updateOrderStatus(orderId, 'cancelled');
  }

  getRestaurantFullImageUrl(imagePath: string): string {
    const baseUrl = 'http://localhost:3000/';
    return imagePath
      ? baseUrl + imagePath
      : 'assets/images/default-restaurant.png';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/default-menu.png';
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
