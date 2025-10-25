import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { VerifyOtpComponent } from './components/auth/verify-otp/verify-otp.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MySharesComponent } from './components/sharing/my-shares/my-shares.component';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'verify-otp',
    component: VerifyOtpComponent
  },
  
  // Protected routes (require authentication)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'my-shares',
    component: MySharesComponent,
    canActivate: [authGuard]
  },
  
  // Default redirect
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  
  // Wildcard route (404)
  {
    path: '**',
    redirectTo: '/login'
  }
];