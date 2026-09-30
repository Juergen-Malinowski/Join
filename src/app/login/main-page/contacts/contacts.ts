import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy, signal, ViewChild } from '@angular/core';
import { SingleContact } from './single-contact/single-contact';
import { ListContact } from './list-contact/list-contact';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, ListContact, SingleContact],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class Contacts {
  @ViewChild(ListContact) listContact!: ListContact;

  selectedContactId = signal<string | null>(null);

  setSelectedContact(id: string) {
    this.selectedContactId.set(id);
  }

  returnArrow(): void {
    this.selectedContactId.set(null);
    if (this.listContact) {
      this.listContact.returnArrow();
    }
  }
}
