import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardTask } from '../../../../interfaces/task-board.interface';
import { TaskType } from '../../../../types/task-type';

@Component({
  selector: 'app-task-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-preview.html',
  styleUrls: ['./task-preview.scss'],
})
export class TaskPreview {
  @Input({ required: true }) task!: BoardTask;

  readonly TaskType = TaskType;
  readonly maxVisibleAssigns = 3;

  get taskTypeSvg(): string {
    switch (this.task.type) {
      case TaskType.UserStory:
        return 'img/task_type_user_story.svg';
      case TaskType.TechnicalTask:
        return 'img/task_type_technical_task.svg';
      default:
        return '';
    }
  }

  get visibleAssigns() {
    return this.task.assigns.slice(0, this.maxVisibleAssigns);
  }

  get remainingAssignsCount(): number {
    return Math.max(this.task.assigns.length - this.maxVisibleAssigns, 0);
  }

  get remainingAssignNames(): string {
    if (!this.task?.assigns?.length) return '';

    return this.task.assigns
      .slice(this.maxVisibleAssigns)
      .map((assign) => assign.name)
      .join(', ');
  }

  get remainingAssignsGradient(): string {
    const remaining = this.task.assigns.slice(this.maxVisibleAssigns);

    if (!remaining.length) return '';

    const first = remaining[0].color;
    const second = remaining[1]?.color;

    if (!second) {
      return first;
    }

    return `linear-gradient(135deg, ${first}, ${second})`;
  }
}
