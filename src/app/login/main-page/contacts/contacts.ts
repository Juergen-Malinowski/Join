import { Component } from '@angular/core';
import { SingleContact } from './single-contact/single-contact';
import { Contact } from '../../../interfaces/contact.interface';
import { FirebaseServices } from '../../../firebase-services/firebase-services';

@Component({
  selector: 'app-contacts',
  imports: [SingleContact],
  templateUrl: './contacts.html',
  styleUrl: './contacts.scss',
})
export class Contacts {
  contactsList: Contact[] = [];

  constructor(public contactService: FirebaseServices) {    
  }
}
