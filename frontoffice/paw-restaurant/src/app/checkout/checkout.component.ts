import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cartItems: any[] = [];
  totalPrice: number = 0;
  isLoading: boolean = true;
  hasCartItems: boolean = false;
  timeLeft: number = 0;
  intervalId: any;
  public submitErrorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      deliveryType: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      customerPhone: ['', Validators.required],
      citizenCardNumber: ['', Validators.required],
      customerNote: [''],
    });

    this.loadCart();
    this.checkOrStartTimer();
  }

  checkOrStartTimer(): void {
    const expiry = localStorage.getItem('cartExpiry');
    const now = Date.now();

    if (expiry && now >= +expiry) {
      this.clearCartAndRedirect();
      return;
    }

    if (expiry) {
      const remaining = +expiry - now;
      this.timeLeft = Math.floor(remaining / 1000);
      if (!this.intervalId) {
        this.startCountdown();
      }
    } else {
      const expiryTimestamp = now + 10 * 60 * 1000; // now + 10min
      localStorage.setItem('cartExpiry', expiryTimestamp.toString());
      this.timeLeft = 10 * 60; // 10 min
      this.startCountdown();
    }
  }

  startCountdown(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.intervalId);
        this.clearCartAndRedirect();
      }
    }, 1000);
  }

  get formattedTime(): string {
    const safeTime = Math.max(this.timeLeft, 0);
    const minutes = Math.floor(safeTime / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (safeTime % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  clearCartAndRedirect(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        localStorage.removeItem('cartExpiry');
        this.router.navigate(['/']);
      },
      error: () => {
        this.router.navigate(['/']);
      },
    });
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.cartItems = res.cart.items;
        this.hasCartItems = this.cartItems.length > 0;
        this.updateTotalPrice();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading cart:', err);
        this.isLoading = false;
      },
    });
  }

  updateTotalPrice(): void {
    this.totalPrice = this.cartItems.reduce((total, item) => {
      return total + item.quantity * item.portionPrice;
    }, 0);
  }

  submitOrder(): void {
    if (this.checkoutForm.invalid) {
      return;
    }

    const formValues = this.checkoutForm.value;
    const restaurantId = this.cartItems[0]?.menuItem?.restaurant || null;

    const orderData = {
      restaurantId,
      deliveryType: formValues.deliveryType,
      paymentMethod: formValues.paymentMethod,
      street: formValues.street,
      city: formValues.city,
      postalCode: formValues.postalCode,
      customerPhone: formValues.customerPhone,
      citizenCardNumber: formValues.citizenCardNumber,
      customerNote: formValues.customerNote,
    };

    this.cartService.submitOrder(orderData).subscribe({
      next: (res) => {
        clearInterval(this.intervalId);
        localStorage.removeItem('cartExpiry');
        this.router.navigate(['/order', res.orderId]);
      },
      error: (err) => {
        console.error('Error submitting order:', err);
        if (err.status === 403 && err.error?.message) {
          this.submitErrorMessage = err.error.message;
        } else {
          this.submitErrorMessage = 'Failed to submit order. Please try again.';
        }
      },
    });
  }
}