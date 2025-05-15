import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1/auth';
  private tokenKey = 'jwt';

  constructor(private http: HttpClient, private router: Router) {}

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  login(credentials: {
    userName: string;
    password: string;
  }): Observable<string> {
    return new Observable((observer) => {
      if (!credentials.userName || !credentials.password) {
        observer.next('Please fill in all required fields.');
        return;
      }

      this.http
        .post<any>(`${this.apiUrl}/login`, credentials, { headers })
        .subscribe({
          next: (res) => {
            if (res.token && res.user) {
              this.setToken(res.token);
              observer.next('');
            } else {
              observer.next(res.error || 'Unknown error occurred.');
            }
          },
          error: (err) => {
            const errorMessage =
              err.error?.message || 'Login failed. Please try again.';
            observer.error(errorMessage);
          },
          complete: () => {
            observer.complete();
          },
        });
    });
  }

  signup(credentials: {
    userName: string;
    password: string;
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    role: string;
  }): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/signup`, credentials, { headers })
      .pipe(
        map((res) => {
          if (res.token && res.user) {
            this.setToken(res.token);
          }
          return res;
        }),
        catchError((err) => of(err.error))
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/auth/login']);
  }

  getUserProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profileInfo`, { headers }).pipe(
      map((res) => {
        if (res.user) {
          return res.user;
        } else {
          throw new Error('User not found');
        }
      }),
      catchError((err) => of(err.error))
    );
  }

  // Obter role do utilizador
  getUserRole(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.role || null;
    }
    return null;
  }

  // Verificar se utilizador tem uma role específica
  hasRole(requiredRole: string): boolean {
    const role = this.getUserRole();
    return role === requiredRole;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole !== null && roles.includes(userRole);
  }

  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.userId || null;
    }
    return null;
  }
}
