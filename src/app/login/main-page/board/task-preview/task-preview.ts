import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-preview',
  imports: [
    CommonModule,
  ],
  templateUrl: './task-preview.html',
  styleUrl: './task-preview.scss',
  standalone: true,
})

export class TaskPreview {

  taskreceived: any;

  @Input() task?: object;

  constructor() {
    this.taskreceived = this.task;
    console.log(this.taskreceived);
  }

  getSubtaskProgress(task: any): number {
        if (task.subtasksTotal === 0) {
            return 0;
        }

        return (task.subtasksDone / task.subtasksTotal) * 100;
    }
}
