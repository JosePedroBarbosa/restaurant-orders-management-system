import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private baseUrl = 'http://localhost:3000/api/v1/restaurants';

  constructor(private http: HttpClient) {}

  // Método para retornar todos os restaurantes
  getAllRestaurants(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/allRestaurants`).pipe(
      retry(1),
      tap((response) => console.log('Restaurant API response:', response)),
      catchError(this.handleError)
    );
  }

  // Método para retornar um restaurante por ID
  getRestaurantById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/restaurant/${id}`).pipe(
      tap((response) => console.log('API Response:', response)),
      catchError((error) => {
        console.error('API Error:', error);
        return this.handleError(error);
      })
    );
  }

  // Método para retornar dados para o dashboard do restaurante
  getUpdateRestaurantData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/updateRestaurantData`).pipe(
      tap((res) => console.log('Fetched update data:', res)),
      catchError(this.handleError)
    );
  }

  // Método para retornar informações do user logado
  getMyRestaurant(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/myRestaurant`).pipe(
      tap((res) => console.log('Fetched my restaurant:', res)),
      catchError(this.handleError)
    );
  }

  // Método para criar um novo restaurante (estabelecimento)
  createRestaurant(restaurant: FormData): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/createRestaurant`, restaurant)
      .pipe(
        tap((response) => console.log('Created restaurant:', response)),
        catchError(this.handleError)
      );
  }

  // Método para atualizar um restaurante (estabelecimento)
  updateRestaurant(restaurantId: string, data: FormData): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}/updateRestaurant/${restaurantId}`, data)
      .pipe(
        tap((res) => console.log('Updated restaurant:', res)),
        catchError(this.handleError)
      );
  }

  //Método get average review restaurant.
  getRestaurantReviewStats(restaurantId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/reviewStats/${restaurantId}`);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro da API:', error); 
    return throwError(() => error); 
  }
}
