import { Component, HostListener, OnInit, inject } from '@angular/core';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../firebase-services/auth-services';
import { FirebaseServices } from '../../firebase-services/firebase-services';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AsyncPipe, NgIf],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
/**
 * Provides the application header, user menu, responsive state, and logout action.
 */
export class Header implements OnInit {
  firebase = inject(FirebaseServices);
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  guestLogin() {
    this.router.navigate(['/Login']);
  }

  /**
   * Closes the user menu and signs out the current user.
   */
  async onLogout() {
    this.closeMenu();
    await this.authService.logout();
  }

  /**
   * Closes the user menu when a click occurs outside the menu controls.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.menuOpen) {
      const clickedInsideMenu = target.closest('.menu, .menu-mobil');
      const clickedOnMenuIcon = target.closest('.menu-icon');

      if (!clickedInsideMenu && !clickedOnMenuIcon) {
        this.menuOpen = false;
      }
    }
  }

  isMobile: boolean = false;

  ngOnInit() {
    this.checkScreenWidth();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    this.isMobile = window.innerWidth <= 1050;
  }
}
