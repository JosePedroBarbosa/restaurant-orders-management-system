import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class OrderService {
  private baseUrl = 'http://localhost:3000/api/v1/orders';

  constructor(private http: HttpClient) {}

  getOrderById(orderId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/order/${orderId}`);
  }

  getRestaurantOrders(restaurantId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/${restaurantId}`);
  }

  updateOrderStatus(orderId: string, data: { status: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/updateStatus/${orderId}`, data);
  }

  getUserOrderHistory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/history`);
  }

  getRestaurantOrderHistory(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/history/${userId}`);
  }

  submitReview(orderId: string, formData: FormData): Observable<any> {
      return this.http.post(`${this.baseUrl}/review/${orderId}`, formData);
  }
}
