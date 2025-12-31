import { Component, ViewChild, inject } from '@angular/core';
import { TaskList } from './task-list/task-list';
import { DialogAddTask } from './dialog-add-task/dialog-add-task';
import { DialogShowEditTask } from './task-preview/dialog-show-edit-task/dialog-show-edit-task';
import { FirebaseServices } from '../../../firebase-services/firebase-services';
import { BoardTask } from '../../../interfaces/task-board.interface';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [TaskList, DialogAddTask,DialogShowEditTask],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {

  private readonly firebase = inject(FirebaseServices);

  @ViewChild(DialogAddTask) dialogAddTask!: DialogAddTask;
  @ViewChild(DialogShowEditTask) dialogShowEditTask!: DialogShowEditTask;

  openDialogAddTask() {
    this.dialogAddTask.open();
  }

  openDialogEditTask(task: BoardTask) {
  this.dialogShowEditTask.open(task);
}
}
