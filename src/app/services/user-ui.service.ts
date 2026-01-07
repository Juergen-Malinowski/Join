import { Injectable, inject } from '@angular/core';
import { FirebaseServices } from './../firebase-services/firebase-services';
import { Timestamp } from '@angular/fire/firestore';

export type TaskUrgency = 'normal' | 'urgent';

@Injectable({
  providedIn: 'root',
})
export class UserUiService {
  private readonly maxColors = 15;
  private lastUserColor = 0;

  private readonly firebase = inject(FirebaseServices);

  private readonly twoDaysInMS = 2 * 24 * 60 * 60 * 1000;

  async init(): Promise<void> {
    this.lastUserColor = await this.firebase.getLastUserColor();
  }

  getInitials(name?: string): string {
    if (!name || typeof name !== 'string') {
      return '?';
    }

    const parts = name.trim().split(' ').filter(Boolean);

    const first = parts[0]?.charAt(0).toUpperCase() ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() : '';

    return first + last || '?';
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

  isTaskUrgent(dueDate?: Timestamp): boolean {
    if (!dueDate) return false;

    const now = Date.now();
    const dueTime = dueDate.toDate().getTime();
    const diff = dueTime - now;

    return diff > 0 && diff <= this.twoDaysInMS;
  }

  getTaskUrgency(dueDate?: Timestamp): TaskUrgency {
    if (!dueDate) return 'normal';

    const now = Date.now();
    const dueTime = dueDate.toDate().getTime();
    const diff = dueTime - now;

    if (diff <= this.twoDaysInMS) return 'urgent';

    return 'normal';
  }

  getRemainingDays(dueDate?: Timestamp): number | null {
    if (!dueDate) return null;

    const now = Date.now();
    const dueTime = dueDate.toDate().getTime();

    return Math.ceil((dueTime - now) / (24 * 60 * 60 * 1000));
  }

  formatTaskDate(dueDate?: Timestamp, locale: string = 'de-DE'): string {
    if (!dueDate) return '';

    return dueDate.toDate().toLocaleDateString(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
}
