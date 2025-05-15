import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { MenuService } from '../services/menu.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartType, ChartOptions, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    BaseChartDirective,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  restaurantsToValidate: any[] = [];
  allRestaurants: any[] = [];
  adminRestaurantForm: FormGroup;
  restaurantImageFile: File | null = null;
  eligibleUsers: any[] = [];
  categoryForm: FormGroup;
  menuForm: FormGroup;
  selectedFile: File | null = null;
  categories: any[] = [];
  menus: any[] = [];
  orders: any[] = [];
  public currentYear: number = new Date().getFullYear();
  public ordersLineChartType: 'line' = 'line';

  public ordersLineChartData: ChartData<'line'> = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        label: 'Orders per Month',
        data: Array(12).fill(0),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13,110,253,0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  public ordersLineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  public restaurantChartType: ChartType = 'bar';

  public restaurantChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  public restaurantChartData: ChartData<'bar'> = {
    labels: ['Total Restaurants'],
    datasets: [
      {
        label: 'Total',
        data: [0],
        backgroundColor: ['#0d6efd'],
      },
    ],
  };

  constructor(
    private adminService: AdminService,
    private menuService: MenuService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
    });
    this.menuForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      restaurantId: ['', Validators.required],
    });
    this.adminRestaurantForm = this.fb.group({
      userId: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      preparationTime: [null, [Validators.required, Validators.min(1)]],
      deliveryTime: [null, [Validators.required, Validators.min(1)]],
      maxDeliveryRadius: [null, [Validators.required, Validators.min(0.1)]],
      maxOrdersPerHour: [null, [Validators.required, Validators.min(1)]],
      image: [null],
    });
  }

  ngOnInit(): void {
    this.loadRestaurantsToValidate();
    this.getAllRestaurants();
    this.loadCategories();
    this.loadMenus();
    this.loadOrders();
    this.loadMonthlyOrderStats();
    this.loadEligibleUsers();
  }

  loadEligibleUsers(): void {
    this.adminService.getEligibleUsersForRestaurant().subscribe({
      next: (res) => {
        this.eligibleUsers = res.eligibleUsers || [];
      },
      error: (err) => {
        console.error('Failed to load eligible users:', err);
      },
    });
  }

  onRestaurantImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.restaurantImageFile = input.files[0];
    }
  }

  createRestaurantAsAdmin(): void {
    if (this.adminRestaurantForm.invalid || !this.restaurantImageFile) {
      alert('Please fill all required fields and select an image.');
      return;
    }

    const formData = new FormData();
    const values = this.adminRestaurantForm.value;

    formData.append('userId', values.userId);
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('street', values.street);
    formData.append('city', values.city);
    formData.append('postalCode', values.postalCode);
    formData.append('preparationTime', values.preparationTime);
    formData.append('deliveryTime', values.deliveryTime);
    formData.append('maxDeliveryRadius', values.maxDeliveryRadius);
    formData.append('maxOrdersPerHour', values.maxOrdersPerHour);
    formData.append('image', this.restaurantImageFile);

    this.adminService.createRestaurantAsAdmin(formData).subscribe({
      next: () => {
        alert('Restaurant created successfully!');
        this.adminRestaurantForm.reset();
        this.restaurantImageFile = null;
        this.loadEligibleUsers();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to create restaurant.');
      },
    });
  }

  loadMonthlyOrderStats(): void {
    this.adminService.getMonthlyOrderStats().subscribe({
      next: (res) => {
        this.ordersLineChartData = {
          labels: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          datasets: [
            {
              label: 'Total Delivered Orders',
              data: res.monthlyOrders,
              borderColor: '#0d6efd',
              backgroundColor: 'rgba(13,110,253,0.2)',
              tension: 0.3,
              fill: true,
            },
          ],
        };
      },
      error: (err) => {
        console.error('Erro ao obter estatísticas mensais de encomendas:', err);
      },
    });
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
    }
  }
  loadCategories(): void {
    this.adminService.getAllCategories().subscribe({
      next: (res) => (this.categories = res.categories),
      error: (err) => console.error('Failed to fetch categories:', err),
    });
  }

  loadMenus(): void {
    this.adminService.getMenus().subscribe({
      next: (data) => (this.menus = data.menus),
      error: (err) => console.error('Failed to load menus', err),
    });
  }

  loadOrders(): void {
    this.adminService.getAllOrders().subscribe({
      next: (data) => (this.orders = data.orders),
      error: (err) => console.error('Failed to load menus', err),
    });
  }

  createMenu(): void {
    if (this.menuForm.invalid || !this.selectedFile) {
      alert('Please fill in all required fields and select an image.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.menuForm.get('name')?.value);
    formData.append('description', this.menuForm.get('description')?.value);
    formData.append('restaurantId', this.menuForm.get('restaurantId')?.value);
    formData.append('image', this.selectedFile);

    this.adminService.createMenuAsAdmin(formData).subscribe({
      next: () => {
        this.menuForm.reset();
        this.selectedFile = null;
        this.loadMenus();
      },
      error: (err) => alert(err.error?.message || 'Failed to create menu'),
    });
  }

  removeMenu(menuId: string): void {
    if (!confirm('You sure you want to delete this menu?')) return;

    this.menuService.deleteMenu(menuId).subscribe({
      next: () => this.loadMenus(),
      error: (err) => alert(err.error?.message || 'Failed to delete menu'),
    });
  }

  removeOrder(orderId: string): void {
    if (!confirm('Are you sure you want to delete this order?')) return;

    this.adminService.deleteOrder(orderId).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (err) => {
        console.error('Failed to delete order:', err);
        alert(err.error?.message || 'Failed to delete order');
      },
    });
  }

  loadRestaurantsToValidate(): void {
    this.adminService.getRestaurantsToValidate().subscribe({
      next: (res) => (this.restaurantsToValidate = res.restaurants || []),
      error: (err) => console.error('Failed to fetch restaurants:', err),
    });
  }

  validateRestaurant(id: string): void {
    if (!confirm('Are you sure you want to validate this restaurant?')) return;
    this.adminService.validateRestaurant(id).subscribe({
      next: () => this.loadRestaurantsToValidate(),
      error: (err) => alert(err.message || 'Validation failed'),
    });
  }

  getAllRestaurants(): void {
    this.adminService.getAllRestaurants().subscribe({
      next: (res) => {
        this.allRestaurants = res.restaurants || [];
        const total = res.restaurants.length;
        // console.log('Total restaurants:', total);

        this.restaurantChartData = {
          labels: ['Total Restaurants'],
          datasets: [
            {
              label: 'Total',
              data: [total],
              backgroundColor: ['#0d6efd'],
            },
          ],
        };
      },
      error: (err) => {
        console.error('Erro ao obter restaurantes:', err);
      },
    });
  }

  removeRestaurant(id: string): void {
    if (!confirm('Are you sure you want to remove this restaurant?')) return;
    this.adminService.removeRestaurant(id).subscribe({
      next: () => this.getAllRestaurants(),
      error: (err) => alert(err.message || 'Failed to remove restaurant'),
    });
  }

  createCategory(): void {
    if (this.categoryForm.invalid) return;

    const name = this.categoryForm.get('name')?.value;

    this.adminService.createCategory(name).subscribe({
      next: () => {
        this.categoryForm.reset();
        this.loadCategories();
      },
      error: (err) => alert(err.error?.message || 'Failed to create category'),
    });
  }

  removeCategory(id: string): void {
    if (!confirm('Are you sure you want to delete this category?')) return;

    this.adminService.removeCategory(id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => alert(err.error?.message || 'Failed to delete category'),
    });
  }
}
