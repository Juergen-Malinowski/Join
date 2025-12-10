import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone:true,
  imports: [CommonModule,RouterLinkActive,RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
 menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
