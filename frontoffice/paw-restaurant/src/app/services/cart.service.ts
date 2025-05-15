import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CartService {
  private apiUrl = 'http://localhost:3000/api/v1/cart'; 

  constructor(private http: HttpClient) {}

  // Método get itens do carrinho
  getCart() {
    return this.http.get<{ cart: any }>(`${this.apiUrl}/getCart`);
  }

  // Método para limpar o carrinho
  clearCart() {
    return this.http.delete(`${this.apiUrl}/clearCart`);
  }

  // Método para adicionar um item ao carrinho
  addItem(item: any) {
    return this.http.post(`${this.apiUrl}/addItem`, item); 
  }

  // Método para remover um item do carrinho
  removeItem(menuItemId: string, portionName: string) {
    return this.http.delete(`${this.apiUrl}/removeItem/${menuItemId}/${portionName}`);
  }

  updateItemQuantity(menuItemId: string, portionName: string, quantity: number) {
    return this.http.put(
      `${this.apiUrl}/updateItemQuantity/${menuItemId}/${portionName}`,
      { quantity },
    );
  }

  submitOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submitOrder`, orderData);
  }
}
