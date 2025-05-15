import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private baseUrl = 'http://localhost:3000/api/v1/menus';

  constructor(private http: HttpClient) {}

  // Método para retornar um menu por ID
  getMenuById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/menu/${id}`).pipe(
      tap((response) => console.log('API Response:', response)),
      catchError((error) => {
        console.error('API Error:', error);
        return this.handleError(error);
      })
    );
  }

  // Método para criar menu
  createMenu(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/createMenu`, formData).pipe(
      tap((response) => console.log('Menu created:', response)),
      catchError((error) => this.handleError(error))
    );
  }

  // Método para atualizar menu
  updateMenu(menuId: string, formData: FormData): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}/updateMenu/${menuId}`, formData)
      .pipe(
        tap((response) => console.log('Menu updated:', response)),
        catchError(this.handleError)
      );
  }

  // Método para remover menu
  deleteMenu(menuId: string): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}/deleteMenu/${menuId}`, {})
      .pipe(
        tap(() => console.log(`Deleted menu ${menuId}`)),
        catchError(this.handleError)
      );
  }

  // Método para adicionar item ao menu
  addMenuItemToMenu(menuId: string, menuItemId: string): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/${menuId}/addItem`, { menuItemId })
      .pipe(
        tap(() =>
          console.log(`Added menu item ${menuItemId} to menu ${menuId}`)
        ),
        catchError(this.handleError)
      );
  }

  // Método para remover item do menu
  removeMenuItemFromMenu(menuId: string, menuItemId: string): Observable<any> {
    return this.http
      .delete<any>(`${this.baseUrl}/${menuId}/removeItem/${menuItemId}`, {})
      .pipe(
        tap(() =>
          console.log(`Removed menu item ${menuItemId} from menu ${menuId}`)
        ),
        catchError(this.handleError)
      );
  }

  getFilters(): Observable<any> {
    return this.http.get(`${this.baseUrl}/filters`);
  }

  searchMenuItems(filters: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/searchMenuItems`, {
      params: filters,
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erro da API:', error);
    return throwError(() => error);
  }
}
