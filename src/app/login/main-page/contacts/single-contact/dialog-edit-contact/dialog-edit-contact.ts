import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, ViewChild } from '@angular/core';
import { FirebaseServices } from '../../../../../firebase-services/firebase-services';
import { Contact } from '../../../../../interfaces/contact.interface';
import { FormsModule, NgForm } from '@angular/forms';
import { Dialog } from '../../../../../shared/dialog/dialog';
import { UserUiService } from '../../../../../services/user-ui.service';

/**
 * Manages editing and deletion actions for an existing contact.
 */
@Component({
  selector: 'app-dialog-edit-contact',
  imports: [CommonModule, FormsModule, Dialog],
  templateUrl: './dialog-edit-contact.html',
  styleUrl: './dialog-edit-contact.scss',
  standalone: true,
})
export class DialogEditContact {
  private readonly firebase = inject(FirebaseServices);
  public readonly userUi = inject(UserUiService);

  @ViewChild('editDialog') editDialog!: Dialog;

  editModel: Partial<Contact> = {};

  open() {
    this.editDialog.open();
  }

  /** Persists a valid contact edit and closes the dialog. */
  async saveEdit(form: NgForm): Promise<void> {
    if (!this.editModel.id || !form.valid) return;
    await this.firebase.editContact(this.editModel as Contact);
    this.editDialog.close();
  }

  /** Deletes the edited contact and closes the dialog afterwards. */
  async deleteContact(): Promise<void> {
    const id = this.editModel.id;
    if (!id) return;
    this.closeMenu();
    await this.firebase.deleteContact(id);
    if (this.editDialog) {
      this.editDialog.close();
    }
  }

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
