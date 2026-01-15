import { Component, inject, signal, OnInit } from '@angular/core';
import { FirebaseServices } from '../../../firebase-services/firebase-services';
import { TaskStatus } from '../../../types/task-status';
import { map } from 'rxjs/operators';
import { AsyncPipe, NgIf } from '@angular/common';
import { UserUiService } from '../../../services/user-ui.service';
import { Task } from '../../../interfaces/task.interface';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { AuthService } from '../../../firebase-services/auth-services';



@Component({
  selector: 'app-summary',
  imports: [AsyncPipe, NgIf],
  templateUrl: './summary.html',
  styleUrls: ['./summary.scss', './summary-media.scss'],
  animations: []
  
})
export class Summary implements OnInit {
  private firebase = inject(FirebaseServices);
  private router = inject(Router);
  private auth = inject(AuthService); // AuthService injizieren
  ui = inject(UserUiService);

  greeting = this.getGreeting();
  userData$ = this.firebase.currentUserData$;
  overlay = signal(true); // Overlay sichtbar
   showSummary = signal(false);
   overlayInDom = signal(false)

  summary$ = this.firebase.subTasks().pipe(
    map((tasks) => {
      if (!tasks) return this.getEmptySummary();
      const upcoming = this.getNextDueTask(tasks);

      return {
        todo: tasks.filter((t) => t.status === TaskStatus.ToDo).length,
        inProgress: tasks.filter((t) => t.status === TaskStatus.InProgress).length,
        awaitFeedback: tasks.filter((t) => t.status === TaskStatus.AwaitFeedback).length,
        done: tasks.filter((t) => t.status === TaskStatus.Done).length,
        urgent: tasks.filter((t) => this.ui.isUrgentAndActive(t)).length,
        total: tasks.length,
        nextDueDate: upcoming ? upcoming.date : null,
      };
    }),
  );

ngOnInit(): void {
  this.overlay.set(false);

  this.auth.justLoggedIn$.subscribe((justLoggedIn) => {
    if (justLoggedIn && window.innerWidth <= 1050) {
      this.overlayInDom.set(true); 
      this.overlay.set(true);      

      // 1 Sekunde sichtbar lassen, dann fade-out starten
      timer(1000).subscribe(() => {
        this.overlay.set(false); 
      });

      // Overlay komplett aus DOM nach 3 Sekunden (1s sichtbar + 2s fade)
      timer(100000).subscribe(() => {
        this.overlayInDom.set(false);
      });

      // Flag zurücksetzen, damit Overlay beim nächsten Login wieder funktioniert
      timer(2000).subscribe(() => {
        this.auth['justLoggedInSubject'].next(false);
      });
    }
  });
}

  toBoard() {
    this.router.navigate(['/board']);
  }

  private getEmptySummary() {
    return {
      todo: 0,
      inProgress: 0,
      awaitFeedback: 0,
      done: 0,
      urgent: 0,
      total: 0,
      nextDueDate: null,
    };
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  }

  private getNextDueTask(tasks: Task[]): Task | null {
    if (!tasks || tasks.length === 0) return null;
    const tasksWithDate = tasks.filter((t) => t.date && typeof t.date.toMillis === 'function');

    if (tasksWithDate.length === 0) return null;

    return tasksWithDate.sort((a, b) => a.date.toMillis() - b.date.toMillis())[0];
  }
}
