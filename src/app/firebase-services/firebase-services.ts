import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  collectionData,
  docData,
  getDoc,
  getDocs,
  collectionGroup,
  query,
  where,
  writeBatch,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from '@angular/fire/firestore';
import { Observable, map, switchMap, of } from 'rxjs';
import { Contact } from '../interfaces/contact.interface';
import { Task } from '../interfaces/task.interface';
import { TaskAssign } from '../interfaces/task-assign.interface';
import { Subtask } from '../interfaces/subtask.interface';
import { TaskStatus } from '../types/task-status';
import { TaskAssignDb } from '../interfaces/task-assign-db.interface';
import { Auth, deleteUser, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UserUiService } from '../services/user-ui.service';

/**
 * Provides Firestore access for contacts, tasks, assignments, subtasks, and user data.
 */
@Injectable({
  providedIn: 'root',
})
export class FirebaseServices {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly ui = inject(UserUiService);

  private settingsDoc = doc(this.firestore, 'appSettings/contacts');

  /** Returns a live stream of all contacts. */
  subContactsList(): Observable<Contact[]> {
    const ref = collection(this.firestore, 'contacts');
    return collectionData(ref, { idField: 'id' }) as Observable<Contact[]>;
  }

  /** Returns a live stream for one contact document. */
  subSingleContact(docID: string): Observable<Contact | undefined> {
    const ref = doc(this.firestore, `contacts/${docID}`);
    return docData(ref, { idField: 'id' }) as Observable<Contact | undefined>;
  }

  /** Maps raw contact data to the Contact interface with safe defaults. */
  toContact(data: any): Contact {
    return {
      id: data.id,
      name: data.name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? '',
      color: data.color ?? '',
    };
  }

  /** Creates a new contact document and returns it with its generated ID. */
  async addContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    const ref = collection(this.firestore, 'contacts');
    const docRef = await addDoc(ref, contact);
    return { id: docRef.id, ...contact };
  }

  /** Persists changes to an existing contact. */
  async editContact(contact: Contact): Promise<void> {
    if (!contact.id) {
      throw new Error('editContact: contact.id is missing');
    }

    const ref = doc(this.firestore, `contacts/${contact.id}`);
    const { id, ...data } = contact;
    await updateDoc(ref, data);
  }

  /** Removes a contact and related task assignments, including the own user account when applicable. */
  async deleteContact(contactId: string): Promise<void> {
    if (!contactId) {
      throw new Error('deleteContact: contactId is missing');
    }

    const currentUser = this.auth.currentUser;
    const contactRef = doc(this.firestore, `contacts/${contactId}`);
    const contactSnap = await getDoc(contactRef);

    if (contactSnap.exists()) {
      const contactData = contactSnap.data();
      const isRegisteredUser = contactData['isUser'] === true;
      const isOwnAccount = currentUser?.uid === contactId;

      if (isRegisteredUser && !isOwnAccount) {
        throw new Error('auth/permission-denied');
      }
    }

    const assignsGroup = collectionGroup(this.firestore, 'assigns');
    const q = query(assignsGroup, where('contactId', '==', contactId));
    const assignsSnap = await getDocs(q);

    if (!assignsSnap.empty) {
      const batch = writeBatch(this.firestore);
      assignsSnap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }

    await deleteDoc(contactRef);

    if (currentUser?.uid === contactId) {
      await deleteUser(currentUser);
      this.router.navigate(['/Login']);
    }
  }

  /** Returns a live stream of all tasks. */
  subTasks(): Observable<Task[]> {
    const ref = collection(this.firestore, 'tasks');
    return collectionData(ref, { idField: 'id' }) as Observable<Task[]>;
  }

  /** Returns a live stream for one task document. */
  subSingleTask(taskId: string): Observable<Task | undefined> {
    const ref = doc(this.firestore, `tasks/${taskId}`);
    return docData(ref, { idField: 'id' }) as Observable<Task | undefined>;
  }

  /** Creates a task and applies the default ToDo status when none is provided. */
  async addTask(task: Omit<Task, 'id'>): Promise<Task> {
    const ref = collection(this.firestore, 'tasks');

    const taskWithDefaults: Omit<Task, 'id'> = {
      ...task,
      status: task.status ?? TaskStatus.ToDo,
    };

    const docRef = await addDoc(ref, taskWithDefaults);

    return { id: docRef.id, ...taskWithDefaults };
  }

  /** Persists changes to an existing task. */
  async editTask(task: Task): Promise<void> {
    if (!task.id) throw new Error('editTask: task.id is missing');
    const ref = doc(this.firestore, `tasks/${task.id}`);
    const { id, ...data } = task;
    await updateDoc(ref, data);
  }

  /** Deletes a task together with its assignment and subtask subcollections. */
  async deleteTaskWithChildren(taskId: string): Promise<void> {
    if (!taskId) {
      throw new Error('deleteTaskWithChildren: taskId is missing');
    }

    const batch = writeBatch(this.firestore);

    const subtasksRef = collection(this.firestore, `tasks/${taskId}/subtasks`);
    const subtasksSnap = await getDocs(subtasksRef);
    subtasksSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    const assignsRef = collection(this.firestore, `tasks/${taskId}/assigns`);
    const assignsSnap = await getDocs(assignsRef);
    assignsSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    const taskRef = doc(this.firestore, `tasks/${taskId}`);
    batch.delete(taskRef);

    await batch.commit();
  }

  /** Updates only the workflow status of a task. */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    const ref = doc(this.firestore, `tasks/${taskId}`);
    await updateDoc(ref, { status });
  }

  /** Returns the assignments stored below a task. */
  subTaskAssigns(taskId: string): Observable<TaskAssignDb[]> {
    const ref = collection(this.firestore, `tasks/${taskId}/assigns`);
    return collectionData(ref, { idField: 'id' }) as Observable<TaskAssignDb[]>;
  }

  /** Adds an assignment to a task. */
  async addTaskAssign(taskId: string, assign: Omit<TaskAssign, 'id'>): Promise<void> {
    const ref = collection(this.firestore, `tasks/${taskId}/assigns`);
    await addDoc(ref, assign);
  }

  /** Removes an assignment from a task. */
  async deleteTaskAssign(taskId: string, assignId: string): Promise<void> {
    const ref = doc(this.firestore, `tasks/${taskId}/assigns/${assignId}`);
    await deleteDoc(ref);
  }

  /** Returns the subtasks stored below a task. */
  subSubtasks(taskId: string): Observable<Subtask[]> {
    const ref = collection(this.firestore, `tasks/${taskId}/subtasks`);
    return collectionData(ref, { idField: 'id' }) as Observable<Subtask[]>;
  }

  /** Adds a subtask to a task. */
  async addSubtask(taskId: string, subtask: Omit<Subtask, 'id'>): Promise<void> {
    const ref = collection(this.firestore, `tasks/${taskId}/subtasks`);
    await addDoc(ref, subtask);
  }

  /** Updates selected fields of a subtask. */
  async editSubtask(
    taskId: string,
    subtaskId: string,
    data: Partial<Omit<Subtask, 'id'>>
  ): Promise<void> {
    const ref = doc(this.firestore, `tasks/${taskId}/subtasks/${subtaskId}`);
    await updateDoc(ref, data);
  }

  /** Removes a subtask from a task. */
  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    const ref = doc(this.firestore, `tasks/${taskId}/subtasks/${subtaskId}`);
    await deleteDoc(ref);
  }

  /** Reads the most recently used avatar color index. */
  async getLastUserColor(): Promise<number> {
    const snap = await getDoc(this.settingsDoc);
    return snap.exists() ? snap.data()['lastUserColor'] ?? 0 : 0;
  }

  /** Stores the most recently used avatar color index. */
  async setLastUserColor(index: number): Promise<void> {
    await updateDoc(this.settingsDoc, { lastUserColor: index });
  }

  /** Creates the contact document that represents a registered user. */
  async createUserContact(uid: string, contact: Omit<Contact, 'id'>): Promise<void> {
    const ref = doc(this.firestore, `contacts/${uid}`);
    await setDoc(ref, contact);
  }

  /** Exposes display data for the current registered or guest user. */
  public currentUserData$ = authState(this.auth).pipe(
    switchMap(user => {
      if (!user || user.isAnonymous) return of({ name: 'Guest', initials: 'G' });

      const userDocRef = doc(this.firestore, `contacts/${user.uid}`);
      return docData(userDocRef).pipe(
        map((data: any) => ({
          name: data?.name || 'User',
          initials: this.ui.getInitials(data?.name)
        }))
      );
    })
  );
}
