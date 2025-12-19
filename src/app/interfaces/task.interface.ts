import { TaskType } from '../types/task-type';
import { TaskStatus } from '../types/task-status';

export interface Task {
  id?: string;
  type: TaskType;
  status: TaskStatus;
  date: string;
  title: string;
  description: string;
  priority: number;
}