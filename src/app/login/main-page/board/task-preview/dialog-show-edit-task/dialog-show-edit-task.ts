import { Component,ViewChild } from '@angular/core';
import { Dialog } from '../../../../../shared/dialog/dialog';

@Component({
  selector: 'app-dialog-show-edit-task',
  imports: [Dialog],
  templateUrl: './dialog-show-edit-task.html',
  styleUrl: './dialog-show-edit-task.scss',
})

export class DialogShowEditTask {
  @ViewChild('DialogShowEditTask') dialog!: Dialog; 

  open() {
    this.dialog.open();
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

