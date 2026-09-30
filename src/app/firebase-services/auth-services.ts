import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  deleteUser,
  user,
} from '@angular/fire/auth';
import { FirebaseServices } from '../firebase-services/firebase-services';
import { UserUiService } from '../services/user-ui.service';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firebase = inject(FirebaseServices);
  private userUi = inject(UserUiService);
  private readonly router = inject(Router);

  currentUser$ = user(this.auth);
  private justLoggedInSubject = new BehaviorSubject<boolean>(false);
  justLoggedIn$ = this.justLoggedInSubject.asObservable();

  async login(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    this.justLoggedInSubject.next(true);
    return cred;
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

    this.justLoggedInSubject.next(true);
    return cred.user;
  }

  async loginGuest() {
    const cred = await signInAnonymously(this.auth);
    this.justLoggedInSubject.next(true);
    return cred;
  }

  async logout() {
    const user = this.auth.currentUser;

    try {
      if (user && user.isAnonymous) {
        await deleteUser(user);
      } else {
        await signOut(this.auth);
      }
    } catch (error: any) {
      console.warn('Logout/Delete:', error.message);
    } finally {
      this.justLoggedInSubject.next(false);
      this.router.navigate(['/Login']);
    }
  }
}
