import { Injectable, inject } from '@angular/core';
import { FirebaseServices } from './../firebase-services/firebase-services';

@Injectable({
  providedIn: 'root',
})
export class UserUiService {
  private readonly maxColors = 15;
  private lastUserColor = 0;

  private readonly firebase = inject(FirebaseServices);

  async init(): Promise<void> {
    this.lastUserColor = await this.firebase.getLastUserColor();
  } 

  getInitials(name?: string): string {
  if (!name || typeof name !== 'string') {
    return '?';
  }

  const parts = name.trim().split(' ').filter(Boolean);

  const first = parts[0]?.charAt(0).toUpperCase() ?? '';
  const last =
    parts.length > 1
      ? parts[parts.length - 1].charAt(0).toUpperCase()
      : '';

  return (first + last) || '?';
}

  async getNextColorIndex(): Promise<number> {
    this.lastUserColor = (this.lastUserColor % this.maxColors) + 1;
    await this.firebase.setLastUserColor(this.lastUserColor);
    return this.lastUserColor;
  }

  getColorByIndex(index: number): string {
    const cssVar = `--userColor${index}`;
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue(cssVar).trim() || '#000000';
  }
}