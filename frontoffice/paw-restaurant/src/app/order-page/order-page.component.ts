import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { io } from 'socket.io-client';

@Component({
  standalone: true,
  selector: 'app-order-page',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.css',
})
export class OrderPageComponent implements OnInit, OnDestroy {
  readonly statusLabels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    inProgress: 'In Preparation',
    outForDelivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  order: any;
  isLoading = true;
  accessDenied = false;
  orderNotFound = false;
  canCancel = false;
  remainingTime = 0;
  countdownInterval: any;
  notificationMessage = '';
  reviewForm!: FormGroup;
  reviewSubmitted = false;
  selectedImageFile: File | null = null;
  imagePreviewUrl: string = '';
  private socket: any;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      rating: [
        null,
        [Validators.required, Validators.min(1.0), Validators.max(5.0)],
      ],
      comment: ['', Validators.required],
      photo: [null],
    });

    const orderId = this.route.snapshot.paramMap.get('id');
    const currentUserId = this.authService.getCurrentUserId();

    if (orderId) {
      this.socket = io('http://localhost:3000');
      this.socket.emit('joinOrderRoom', orderId);

      this.socket.on('orderUpdated', (data: any) => {
        this.order = data.order;
        this.notificationMessage =
          data.message || 'Estado da encomenda atualizado.';

        setTimeout(() => {
          this.notificationMessage = '';
        }, 5000);
      });

      this.orderService.getOrderById(orderId).subscribe({
        next: (res) => {
          if (res.order.customer._id !== currentUserId) {
            this.accessDenied = true;
          } else {
            this.order = res.order;
            this.evaluateCancellationWindow();
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to fetch order:', err);
          if (err.status === 404 || err.error?.message === 'Order not found') {
            this.orderNotFound = true;
          }
          this.isLoading = false;
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    clearInterval(this.countdownInterval);
  }

  canShowCancelOption(): boolean {
    return (
      ['pending', 'confirmed'].includes(this.order?.status) && this.canCancel
    );
  }

  wasCancellableButExpired(): boolean {
    return (
      ['pending', 'confirmed'].includes(this.order?.status) && !this.canCancel
    );
  }

  hasPassedCancellationPhase(): boolean {
    return ['inProgress', 'outForDelivery', 'delivered'].includes(
      this.order?.status
    );
  }

  evaluateCancellationWindow(): void {
    if (!this.order || this.order.status === 'inProgress') return;

    const createdAt = new Date(this.order.createdAt).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    const timeElapsed = now - createdAt;

    if (timeElapsed < fiveMinutes) {
      this.canCancel = true;
      this.remainingTime = Math.floor((fiveMinutes - timeElapsed) / 1000);
      this.startCountdown();
    }
  }

  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.canCancel = false;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  getReadableStatus(status: string): string {
    return this.statusLabels[status] || status;
  }

  cancelOrder(): void {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.orderService
      .updateOrderStatus(this.order._id, { status: 'cancelled' })
      .subscribe({
        next: () => {
          this.order.status = 'cancelled';
          this.canCancel = false;
          clearInterval(this.countdownInterval);
        },
        error: (err) => {
          console.error('Failed to cancel order:', err);
          alert('Could not cancel the order. Please try again.');
        },
      });
  }

  submitReview(): void {
    if (this.reviewForm.invalid || !this.order?._id) return;

    const formData = new FormData();
    formData.append('rating', this.reviewForm.value.rating);
    formData.append('comment', this.reviewForm.value.comment);
    if (this.selectedImageFile) {
      formData.append('photo', this.selectedImageFile);
    }

    console.log('--- FormData Contents ---');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    this.orderService.submitReview(this.order._id, formData).subscribe({
      next: (res) => {
        this.reviewSubmitted = true;
        this.order.review = res.review;
      },
      error: (err) => {
        console.error('Error submitting review:', err);
      },
    });
  }

  shouldShowReviewForm(): boolean {
    return this.order?.status === 'delivered' && !this.order?.review;
  }

  shouldShowSubmittedReview(): boolean {
    return this.order?.status === 'delivered' && !!this.order?.review;
  }

  onReviewImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedImageFile = input.files[0];
      this.reviewForm.get('photo')?.setValue(this.selectedImageFile);
      this.imagePreviewUrl = URL.createObjectURL(this.selectedImageFile);
    }
  }

  getReviewFullImageUrl(imagePath: string): string {
    const baseUrl = 'http://localhost:3000/';
    return imagePath ? baseUrl + imagePath : 'assets/images/default-menu.png';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/default-menu.png';
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
}
