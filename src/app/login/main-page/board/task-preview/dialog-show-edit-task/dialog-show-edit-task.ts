import { Component, ViewChild, signal, inject, ElementRef } from '@angular/core';
import { Dialog } from '../../../../../shared/dialog/dialog';
import { BoardTask } from '../../../../../interfaces/task-board.interface';
import { TaskType } from '../../../../../types/task-type';
import { CommonModule } from '@angular/common';
import { FirebaseServices } from '../../../../../firebase-services/firebase-services';
import { Contact } from '../../../../../interfaces/contact.interface';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserUiService } from '../../../../../services/user-ui.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';

/**
 * Displays task details and manages editing, assignments, and subtasks in a dialog.
 */
@Component({
  selector: 'app-dialog-show-edit-task',
  standalone: true,
  imports: [CommonModule, Dialog, FormsModule, MatSelectModule, MatFormFieldModule, RouterModule],
  templateUrl: './dialog-show-edit-task.html',
  styleUrls: ['./dialog-show-task.scss', './dialog-edit-task.scss'],
})
export class DialogShowEditTask {
  @ViewChild('DialogShowEditTask') dialog!: Dialog;
  @ViewChild('subtaskInput') subtaskInput!: ElementRef<HTMLInputElement>;

  private readonly firebase = inject(FirebaseServices);
  private readonly userUi = inject(UserUiService);

  readonly task = signal<BoardTask | null>(null);
  readonly contacts = signal<Contact[]>([]);
  readonly TaskType = TaskType;

  isEditMode: boolean = false;
  editData: any = {
    title: '',
    description: '',
    date: '',
    priority: 2,
    assigns: [],
    subtasks: [],
  };
  newSubtaskTitle: string = '';
  editingIndex: number | null = null;
  originalTitle = '';

  constructor() {
    this.firebase
      .subContactsList()
      .pipe(takeUntilDestroyed())
      .subscribe((contacts) => {
        this.contacts.set(contacts);
      });
  }

  /** Opens the dialog for the selected board task in read-only mode. */
  open(task: BoardTask): void {
    this.task.set(task);
    this.isEditMode = false;
    this.dialog.open();
  }

  close(): void {
    this.dialog.close();
  }

  /** Returns the icon that represents the current task type. */
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

  /** Toggles between detail and edit mode and prepares an editable task snapshot. */
  switchPage(): void {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode && this.task()) {
      const t = this.task()!;
      this.editData = {
        ...t,
        date: new Date(t.date.seconds * 1000).toISOString().split('T')[0],
        assigns: t.assigns ? t.assigns.map((a) => ({ ...a })) : [],
        subtasks: t.subtasks ? t.subtasks.map((s) => ({ ...s })) : [],
      };
    }
  }

  setPrio(prio: number) {
    this.editData.priority = prio;
  }

  focusInput(): void {
    this.subtaskInput?.nativeElement.focus();
  }

  /** Adds a new unsaved subtask to the current edit state. */
  addSubtask() {
    if (this.newSubtaskTitle.trim()) {
      this.editData.subtasks.push({
        title: this.newSubtaskTitle,
        done: false,
      });
      this.newSubtaskTitle = '';
    }
  }

  cancelAddSubtask() {
    this.newSubtaskTitle = '';
    (document.activeElement as HTMLElement)?.blur();
  }

  removeSubtask(index: number) {
    this.editData.subtasks.splice(index, 1);
  }

  getInitials(name: string): string {
    return this.userUi.getInitials(name);
  }

  /** Toggles a persisted subtask's completion state. */
  async toggleSubtask(index: number, task: BoardTask) {
    if (!task.subtasks || !task.subtasks[index]) return;
    const subtask = task.subtasks[index];
    subtask.done = !subtask.done;
    if (task.id && subtask.id) {
      await this.firebase.editSubtask(task.id, subtask.id, { done: subtask.done });
    }
  }

  /** Deletes the current task together with its nested assignments and subtasks. */
  async deleteTask(): Promise<void> {
    const taskId = this.task()?.id;
    if (!taskId) return;
    await this.firebase.deleteTaskWithChildren(taskId);
    this.close();
  }

  /**
   * Persists task field changes and synchronizes assignments and subtasks with Firestore.
   */
  async saveTask() {
    const currentTask = this.task();
    if (!currentTask?.id) return;

    try {
      const taskId = currentTask.id;

      const updatedTask = {
        title: this.editData.title,
        description: this.editData.description,
        priority: this.editData.priority,
        date: Timestamp.fromDate(new Date(this.editData.date)),
      };
      await this.firebase.editTask({ id: taskId, ...updatedTask } as any);

      const currentDbAssigns = await firstValueFrom(this.firebase.subTaskAssigns(taskId));

      for (const dbA of currentDbAssigns) {
        const stillExists = this.editData.assigns.some((fa: any) => fa.contactId === dbA.contactId);
        if (!stillExists && dbA.id) {
          await this.firebase.deleteTaskAssign(taskId, dbA.id);
        }
      }

      for (const fa of this.editData.assigns) {
        const alreadyInDb = currentDbAssigns.some((dbA) => dbA.contactId === fa.contactId);
        if (!alreadyInDb) {
          await this.firebase.addTaskAssign(taskId, {
            contactId: fa.contactId,
            name: fa.name,
            color: fa.color,
            initials: fa.initials,
          });
        }
      }

      const currentDbSubtasks = await firstValueFrom(this.firebase.subSubtasks(taskId));

      for (const dbS of currentDbSubtasks) {
        if (!this.editData.subtasks.some((fs: any) => fs.title === dbS.title)) {
          if (dbS.id) await this.firebase.deleteSubtask(taskId, dbS.id);
        }
      }

      for (const fs of this.editData.subtasks) {
        if (!currentDbSubtasks.some((dbS) => dbS.title === fs.title)) {
          await this.firebase.addSubtask(taskId, { title: fs.title, done: fs.done || false });
        }
      }

      this.close();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  }

  selectOpened: boolean = false;

  /** Returns contacts that are currently assigned in the edit state. */
  getSelectedContacts(): Contact[] {
    return this.contacts().filter((c) =>
      this.editData.assigns.some((a: any) => a.contactId === c.id),
    );
  }

  /** Rebuilds the editable assignment list from the contact selection. */
  onSelectionChange(event: any) {
    const selectedContacts: Contact[] = event.value;
    this.editData.assigns = selectedContacts.map((c) => ({
      contactId: c.id,
      name: c.name,
      color: c.color,
      initials: this.getInitials(c.name),
    }));
  }

  /** Starts inline editing while preserving the original title for cancellation. */
  setEditing(index: number) {
    this.editingIndex = index;
    this.originalTitle = this.editData.subtasks[index].title;
  }

  confirmEdit() {
    this.editingIndex = null;
    this.originalTitle = '';
  }

  /** Restores the original subtask title and exits inline editing. */
  cancelEdit() {
    if (this.editingIndex === null) return;

    this.editData.subtasks[this.editingIndex].title = this.originalTitle;
    this.editingIndex = null;
    this.originalTitle = '';
  }

  clearEditing() {
    this.editingIndex = null;
  }
}
