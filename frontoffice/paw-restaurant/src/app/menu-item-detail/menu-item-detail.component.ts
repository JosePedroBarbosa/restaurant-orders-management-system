import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItemService } from '../services/menu-item.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-item-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-item-detail.component.html',
  styleUrl: './menu-item-detail.component.css'
})

export class MenuItemDetailComponent implements OnInit {
  menuItem: any;
  errorMessage: string | null = null;

  constructor(private route: ActivatedRoute, private menuItemService: MenuItemService, private cartService: CartService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // Obter o ID da URL
    
    if (id) {
      this.menuItemService.getMenuItemById(id).subscribe({
        next: (data) => {
          // console.log('Received menu item data:', data);
          this.menuItem = data;
        },
        error: (error) => {
          console.error('Error fetching menu item details:', error);
          this.errorMessage = 'Failed to load menu item details';
        },
      });
    }

  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }
  
  isCustomer(): boolean {
    return this.authService.hasRole('customer');
  }

  getMenuItemFullImageUrl(imagePath: string): string {
    const baseUrl = 'http://localhost:3000/';
    return imagePath ? baseUrl + imagePath : 'assets/images/default-menu-item.png';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/default-menu-item.png';
  }

  addToCart(portionName: string, portionPrice: number): void {
    const menuItem = this.menuItem.menuItem;
    const menuItemId = menuItem._id;
    const restaurantId = menuItem.restaurant?._id || menuItem.restaurant; 
  
    const payload = {
      menuItem: menuItemId,
      restaurantId,
      portionName,
      portionPrice,
      quantity: 1
    };
  
    this.cartService.addItem(payload).subscribe({
      next: (res) => {
        if (!localStorage.getItem('cartExpiry')) {
          const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutos
          localStorage.setItem('cartExpiry', expiryTime.toString());
        }
        
        this.router.navigate(['/cart']);
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Failed to add item to cart');
      }
    });
  }

  selectImage(index: number): void {
    if (this.menuItem?.menuItem?.images?.length > index) {
      // Reorganiza o array para colocar a imagem selecionada como principal
      const selectedImage = this.menuItem.menuItem.images[index];
      const newImages = [...this.menuItem.menuItem.images];
      
      // Remove a imagem selecionada e insere-a na primeira posição
      newImages.splice(index, 1);
      newImages.unshift(selectedImage);
      
      // Atualiza o array de imagens
      this.menuItem.menuItem.images = newImages;
      
      // Atualiza os elementos DOM com a classe 'active'
      setTimeout(() => {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, i) => {
          if (i === 0) {
            thumb.classList.add('active');
          } else {
            thumb.classList.remove('active');
          }
        });
      }, 0);
    }
  }
}