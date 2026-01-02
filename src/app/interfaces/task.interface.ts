import { TaskType } from '../types/task-type';
import { TaskStatus } from '../types/task-status';
import { Timestamp } from '@angular/fire/firestore';

export interface Task {
  id?: string;
  type: TaskType;
  status: TaskStatus;
  date: Timestamp;
  title: string;
  description: string;
  priority: number;
}