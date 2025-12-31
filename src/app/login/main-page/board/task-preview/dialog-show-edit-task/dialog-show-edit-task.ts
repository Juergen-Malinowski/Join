import { Component,ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from '../../../../../shared/dialog/dialog';
import { BoardTask } from '../../../../../interfaces/task-board.interface';

@Component({
  selector: 'app-dialog-show-edit-task',
  imports: [Dialog, CommonModule],
  templateUrl: './dialog-show-edit-task.html',
  styleUrl: './dialog-show-edit-task.scss',
})

export class DialogShowEditTask {
  @ViewChild('DialogShowEditTask') dialog!: Dialog; 
  task: BoardTask | null = null;

  open(task: BoardTask) {
    this.task = task;
    setTimeout(() => {
      this.dialog.open();
    }, 0);
  }

  close() {
    this.dialog.close();
  }


  /* ----------------------------- SwitschFunktion für seitenwechsel---------------------------- */
isEditMode: boolean = false;

switchPage() {
  this.isEditMode = !this.isEditMode;
}

}
