import { Component,ViewChild, signal } from '@angular/core';
import { Dialog } from '../../../../../shared/dialog/dialog';
import { BoardTask } from '../../../../../interfaces/task-board.interface';
import { TaskType } from '../../../../../types/task-type';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-show-edit-task',
  standalone: true,
  imports: [CommonModule, Dialog],
  templateUrl: './dialog-show-edit-task.html',
  styleUrl: './dialog-show-edit-task.scss',
})

export class DialogShowEditTask {
  @ViewChild('DialogShowEditTask') dialog!: Dialog;

  readonly task = signal<BoardTask | null>(null);
  readonly TaskType = TaskType;
  isEditMode: boolean = false;

  open(task: BoardTask): void {
    this.task.set(task);
    this.isEditMode = false;
    this.dialog.open();
  }

  close(): void {
    this.dialog.close();
  }

   get taskTypeSvg(): string {
    if (!this.task()) return '';
    switch (this.task()!.type) {
      case TaskType.UserStory:
        return 'img/task_type_user_story.svg';
      case TaskType.TechnicalTask:
        return 'img/task_type_technical_task.svg';
      default:
        return '';
    }
  }


  /* ----------------------------- SwitschFunktion für seitenwechsel---------------------------- */


switchPage(): void {
  this.isEditMode = !this.isEditMode;
}
}