import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  phoneNumber: string | null = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.phoneNumber = this.authService.getPhoneNumber();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToMyShares(): void {
    this.router.navigate(['/my-shares']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}