import { Task } from './task.interface';
import { TaskAssign } from './task-assign.interface';
import { Subtask } from './subtask.interface';

export interface BoardTask extends Task {
  assigns: TaskAssign[];
  subtasksTotal: number;
  subtasksDone: number;
  progress: number;
  subtasks?: Subtask[];
}
