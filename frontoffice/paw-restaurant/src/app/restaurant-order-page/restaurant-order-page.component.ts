import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../services/order.service';

@Component({
  standalone: true,
  selector: 'app-order-page',
  imports: [CommonModule],
  templateUrl: './restaurant-order-page.component.html',
  styleUrl: './restaurant-order-page.component.css',
})
export class RestaurantOrderPageComponent implements OnInit {
  order: any;
  isLoading = true;

  readonly statusLabels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    inProgress: 'In Preparation',
    outForDelivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');

    if (orderId) {
      this.orderService.getOrderById(orderId).subscribe({
        next: (res) => {
          this.order = res.order;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to fetch order:', err);
          this.isLoading = false;
        },
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'confirmed':
        return 'bg-primary';
      case 'inProgress':
        return 'bg-info text-white';
      case 'outForDelivery':
        return 'bg-secondary';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-dark';
    }
  }

  getReadableStatus(status: string): string {
    return this.statusLabels[status] || status;
  }
}
