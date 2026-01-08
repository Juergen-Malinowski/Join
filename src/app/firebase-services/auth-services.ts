import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
} from '@angular/fire/auth';
import { FirebaseServices } from '../firebase-services/firebase-services';
import { UserUiService } from '../services/user-ui.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firebase = inject(FirebaseServices);
  private userUi = inject(UserUiService);

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginGuest() {
    return signInAnonymously(this.auth);
  }

  async signup(name: string, email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    await this.userUi.init();
    const colorIndex = await this.userUi.getNextColorIndex();
    const color = this.userUi.getColorByIndex(colorIndex);

    await this.firebase.createUserContact(cred.user.uid, {
      name,
      email,
      phone: '',
      color,
      isUser: true,
    });

    return cred.user;
  }
}
