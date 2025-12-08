import { Component } from '@angular/core';
import { Contact } from '../../../../interfaces/contact.interface';
import { FirebaseServices } from '../../../../firebase-services/firebase-services';
import { Dialog } from '../../../../shared/dialog/dialog';

@Component({
  selector: 'app-single-contact',
  imports: [Dialog],
  templateUrl: './single-contact.html',
  styleUrl: './single-contact.scss',
})

export class SingleContact {

  constructor(private contactService: FirebaseServices) {}

}


