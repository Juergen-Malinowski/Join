import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-helper',
  imports: [CommonModule],
  templateUrl: './helper.html',
  styleUrl: './helper.scss',
})
/**
 * Displays the application help content and provides back navigation.
 */
export class Helper {

  constructor(private location: Location) {}

  backToSite() {
    this.location.back();
  }
}
