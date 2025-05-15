import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MenuItemService {
  private baseUrl = 'http://localhost:3000/api/v1/menuItems';

  constructor(private http: HttpClient) {}

  // Método para retornar um menuItem por ID
  getMenuItemById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/menuItem/${id}`).pipe(
      tap((response) => console.log('API Response:', response)),
      catchError((error) => {
        console.error('API Error:', error);
        return this.handleError(error);
      })
    );
  }

  // Criar um novo menu item
  createMenuItem(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createMenuItem`, formData).pipe(
      tap((response) => console.log('Menu item created:', response)),
      catchError(this.handleError)
    );
  }

  // Atualizar um menu item existente
  updateMenuItem(id: string, formData: FormData): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}/updateMenuItem/${id}`, formData)
      .pipe(
        tap((response) => console.log('Menu item updated:', response)),
        catchError(this.handleError)
      );
  }

  // Remover um menu item pelo ID
  deleteMenuItem(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}/deleteMenuItem/${id}`, {})
      .pipe(
        tap(() => console.log(`Menu item ${id} deleted`)),
        catchError(this.handleError)
      );
  }

  getMenuItemsByRestaurant(restaurantId: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/restaurant/${restaurantId}`)
      .pipe(catchError(this.handleError));
  }

  getMyMenuItems(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/myMenuItems`)
      .pipe(catchError(this.handleError));
  }

  //Add a portion to a menu item
  addPortion(
    menuItemId: string,
    portionName: string,
    portionPrice: number
  ): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/${menuItemId}/addPortion`, {
        portionName,
        portionPrice,
      })
      .pipe(catchError(this.handleError));
  }

  //Remove a portion from a menu item
  removePortion(id: string, portionId: string): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}/${id}/removePortion/${portionId}`)
      .pipe(
        tap(() =>
          console.log(`Portion ${portionId} removed from menu item ${id}`)
        ),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro da API:', error);
    return throwError(() => error);
  }
}
