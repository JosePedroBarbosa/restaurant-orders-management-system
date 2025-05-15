import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})

export class CartComponent implements OnInit {
  cartItems: any[] = [];
  isLoading: boolean = true;
  totalPrice = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.cartItems = res.cart.items;
        this.calculateTotal();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }
  
  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: (res) => {
        this.cartItems = [];
        this.updateTotalPrice?.(); 
      },
      error: (err) => {
        console.error('Error clearing cart:', err);
        alert(err.error?.message || 'Failed to clear cart');
      }
    });
  }

  //calculos
  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce((sum, item) =>
      sum + (item.quantity * item.portionPrice), 0);
  }

  updateTotalPrice(): void {
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + item.portionPrice * item.quantity, 0);
  }

  removeItem(menuItemId: string, portionName: string): void {
    if (!confirm('Are you sure you want to remove this item?')) return;

    this.cartService.removeItem(menuItemId, portionName).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(
          item => !(item.menuItem._id === menuItemId && item.portionName === portionName)
        );
        this.updateTotalPrice();

      },
      error: (err) => {
        console.error('Error removing item:', err);
        alert(err.error?.message || 'Failed to remove item from cart');
      }
    });
  }

  updateItemQuantity(item: any, portionName: string, quantity: number): void {
    if (!item?.menuItem?._id) {
      console.warn('menuItem._id is missing:', item);
      return;
    }

    if (quantity < 1) {
      this.removeItem(item.menuItem._id, portionName);
    } else {
      this.cartService.updateItemQuantity(item.menuItem._id, portionName, quantity).subscribe({
        next: (res) => {
          item.quantity = quantity;
          this.updateTotalPrice();
        },
        error: (err) => {
          console.error('Failed to update quantity:', err);
          alert(err.error?.message || 'Failed to update quantity');
        }
      });
    }
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