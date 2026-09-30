import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-helper',
  imports: [CommonModule],
  templateUrl: './helper.html',
  styleUrl: './helper.scss',
})
export class Helper {

  constructor(private location: Location) {}

  backToSite() {
    this.location.back();
  }
}
