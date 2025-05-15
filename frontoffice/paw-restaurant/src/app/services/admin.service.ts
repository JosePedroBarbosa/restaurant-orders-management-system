import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = 'http://localhost:3000/api/v1/admin';

  constructor(private http: HttpClient) {}

  // Método para retornar users com role restaurant isValidated false
  getRestaurantsToValidate(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/restaurantsToValidate`).pipe(
      tap((response) => console.log('API Response:', response)),
      catchError((error) => {
        console.error('API Error:', error);
        return this.handleError(error);
      })
    );
  }

  createRestaurantAsAdmin(formData: FormData): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/createRestaurantAsAdmin`, formData)
      .pipe(
        tap((res) => console.log('Restaurant created by admin:', res)),
        catchError((error) => this.handleError(error))
      );
  }

  getEligibleUsersForRestaurant(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}/eligibleUsersForRestaurant`)
      .pipe(
        tap((res) => console.log('Eligible users:', res)),
        catchError((error) => this.handleError(error))
      );
  }

  validateRestaurant(id: string): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/validateRestaurant/${id}`, {})
      .pipe(
        tap((response) => console.log('API Response:', response)),
        catchError((error) => {
          console.error('API Error:', error);
          return this.handleError(error);
        })
      );
  }

  getAllRestaurants(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getAllRestaurants`).pipe(
      tap((response) => console.log('API Response:', response)),
      catchError((error) => {
        console.error('API Error:', error);
        return this.handleError(error);
      })
    );
  }

  getAllOrders(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getAllOrders`).pipe(
      tap((response) => console.log('API Response:', response)),
      catchError((error) => {
        console.error('API Error:', error);
        return this.handleError(error);
      })
    );
  }

  removeRestaurant(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/removeRestaurant/${id}`).pipe(
      tap((response) => console.log('API Response:', response)),
      catchError((error) => {
        console.error('API Error:', error);
        return this.handleError(error);
      })
    );
  }

  getAllCategories(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getAllCategories`).pipe(
      tap((response) => console.log('API Response:', response)),
      catchError((error) => {
        console.error('API Error:', error);
        return this.handleError(error);
      })
    );
  }

  getMenus(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getAllMenus`).pipe(
      tap((response) => console.log('API Response:', response)),
      catchError((error) => {
        console.error('API Error:', error);
        return this.handleError(error);
      })
    );
  }

  createCategory(name: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createCategory`, { name }).pipe(
      tap((response) => console.log('API Response:', response)),
      catchError((error) => {
        console.error('API Error:', error);
        return this.handleError(error);
      })
    );
  }

  removeCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/removeCategory/${id}`).pipe(
      tap((response) => console.log('API Response:', response)),
      catchError((error) => {
        console.error('API Error:', error);
        return this.handleError(error);
      })
    );
  }

  deleteMenu(restaurantId: string, menuId: string): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}/deleteMenu/${restaurantId}/${menuId}`)
      .pipe(
        tap((response) => console.log('API Response:', response)),
        catchError((error) => {
          console.error('API Error:', error);
          return this.handleError(error);
        })
      );
  }

  deleteMenuItem(restaurantId: string, menuItemId: string): Observable<any> {
    return this.http
      .delete<any>(
        `${this.baseUrl}/deleteMenuItem/${restaurantId}/${menuItemId}`
      )
      .pipe(
        tap((response) => console.log('API Response:', response)),
        catchError((error) => {
          console.error('API Error:', error);
          return this.handleError(error);
        })
      );
  }

  createMenuAsAdmin(formData: FormData): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/createRestaurantMenu`, formData)
      .pipe(
        tap((response) => console.log('Admin menu created:', response)),
        catchError((error) => this.handleError(error))
      );
  }

  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/removeOrder/${orderId}`);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro da API:', error);
    return throwError(() => error);
  }

  getMonthlyOrderStats() {
    return this.http.get<{ monthlyOrders: number[] }>(
      `${this.baseUrl}/monthlyOrders`
    );
  }
}
