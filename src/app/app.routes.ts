import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { VerifyOtpComponent } from './components/auth/verify-otp/verify-otp.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MySharesComponent } from './components/sharing/my-shares/my-shares.component';
import { PublicPreviewComponent } from './components/sharing/public-preview/public-preview.component';

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

  // Preview for shared file
  {
    path: 'shared/:token', 
    component: PublicPreviewComponent
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
  },

  // Public preview for shared files
  {
    path: 'shared/:token',
    component: PublicPreviewComponent
  },
];