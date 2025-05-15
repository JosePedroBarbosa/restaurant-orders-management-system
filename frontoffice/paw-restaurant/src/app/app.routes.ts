import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RestaurantDetailComponent } from './restaurant-detail/restaurant-detail.component';
import { MenuDetailComponent } from './menu-detail/menu-detail.component';
import { MenuItemDetailComponent } from './menu-item-detail/menu-item-detail.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { CartComponent } from './cart/cart.component';
import { RestaurantCreateComponent } from './restaurant-create/restaurant-create.component';
import { RestaurantDashboardComponent } from './restaurant-dashboard/restaurant-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { RestaurantManagementComponent } from './restaurant-management/restaurant-management.component';
import { MenuEditComponent } from './menu-edit/menu-edit.component';
import { MenuItemEditComponent } from './menu-item-edit/menu-item-edit.component';
import { SearchPageComponent } from './search-page/search-page.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrderPageComponent } from './order-page/order-page.component';
import { RestaurantOrderPageComponent } from './restaurant-order-page/restaurant-order-page.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'restaurant/:id', component: RestaurantDetailComponent },
  { path: 'menu/:id', component: MenuDetailComponent },
  { path: 'menuItem/:id', component: MenuItemDetailComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  {
    path: 'auth/profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  { path: 'cart', component: CartComponent, canActivate: [authGuard, roleGuard], data: { roles: ['customer'] } },
  { path: 'search', component: SearchPageComponent },
  {
    path: 'restaurants/createRestaurant',
    component: RestaurantCreateComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'restaurant'] },
  },
  {
    path: 'restaurants/dashboard',
    component: RestaurantDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['restaurant'] },
  },
  {
    path: 'restaurants/menu/edit/:id',
    component: MenuEditComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['restaurant', 'admin'] },
  },
  {
    path: 'restaurants/menuItem/edit/:id',
    component: MenuItemEditComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['restaurant', 'admin'] },
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/updateRestaurant/:id',
    component: RestaurantManagementComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
  },
  {
    path: 'order/:id',
    component: OrderPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['customer'] },
  },
  {
    path: 'restaurantOrder/:id',
    component: RestaurantOrderPageComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['restaurant', 'admin'] },
  },
];
