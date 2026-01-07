import { Component, inject } from '@angular/core';
import { FirebaseServices } from '../../../firebase-services/firebase-services';
import { TaskStatus } from '../../../types/task-status';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { UserUiService } from '../../../services/user-ui.service';
import { Task } from '../../../interfaces/task.interface';

@Component({
  selector: 'app-summary',
  imports: [AsyncPipe],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  private firebase = inject(FirebaseServices);
  ui = inject(UserUiService);

  summary$ = this.firebase.subTasks().pipe(
    map((tasks) => {
      const upcoming = this.getNextDueTask(tasks);

      return {
        todo: tasks.filter((t) => t.status === TaskStatus.ToDo).length,
        inProgress: tasks.filter((t) => t.status === TaskStatus.InProgress).length,
        awaitFeedback: tasks.filter((t) => t.status === TaskStatus.AwaitFeedback).length,
        done: tasks.filter((t) => t.status === TaskStatus.Done).length,
        urgent: tasks.filter((t) => this.ui.isTaskUrgent(t.date)).length,
        total: tasks.length,
        nextDueDate: upcoming?.date ?? null,
      };
    })
  );

  private getNextDueTask(tasks: Task[]): Task | null {
    return (
      tasks.filter((t) => t.date).sort((a, b) => a.date.toMillis() - b.date.toMillis())[0] ?? null
    );
  }
}
