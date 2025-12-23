import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    CdkDragDrop
} from '@angular/cdk/drag-drop';
import { TaskPreview } from "../task-preview/task-preview";

@Component({
    selector: 'app-task-list',
    imports: [
    CommonModule,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    TaskPreview
],
    templateUrl: './task-list.html',
    styleUrl: './task-list.scss',
})
export class TaskList {

    // =========================
    // TASK MODEL (UI DUMMY)
    // =========================

    allTasks = [
        {
            id: '1',
            type: 'User Story',
            title: 'Kochwelt Page & Recipe Recommender',
            description: 'Build start page with recipe recommendation',
            subtasksDone: 1,
            subtasksTotal: 2,
            priority: 'medium',
            status: 'todo'
        },
        {
            id: '2',
            type: 'Technical Task',
            title: 'Implement Auth Guard',
            description: 'Protect board route',
            subtasksDone: 0,
            subtasksTotal: 1,
            priority: 'urgent',
            status: 'inProgress'
        },
        {
            id: '3',
            type: 'User Story',
            title: 'Feedback Landing Page',
            description: 'Waiting for UX feedback',
            subtasksDone: 0,
            subtasksTotal: 0,
            priority: 'low',
            status: 'awaitFeedback'
        },
        {
            id: '4',
            type: 'Technical Task',
            title: 'Setup Project Structure',
            description: 'Initial Angular project setup',
            subtasksDone: 3,
            subtasksTotal: 3,
            priority: 'low',
            status: 'done'
        }
    ];

    // =========================
    // COLUMN FILTERS
    // =========================

    get todoTasks() {
        return this.allTasks.filter(function (task) {
            return task.status === 'todo';
        });
    }

    get inProgressTasks() {
        return this.allTasks.filter(function (task) {
            return task.status === 'inProgress';
        });
    }

    get awaitFeedbackTasks() {
        return this.allTasks.filter(function (task) {
            return task.status === 'awaitFeedback';
        });
    }

    get doneTasks() {
        return this.allTasks.filter(function (task) {
            return task.status === 'done';
        });
    }

    // =========================
    // DRAG & DROP LOGIC
    // =========================

    drop(event: CdkDragDrop<any[]>, newStatus: string) {
        const movedTask = event.item.data;
        movedTask.status = newStatus;
    }

    // ==========================
    // SUBTASK PROGRESS-BAR
    // ==========================
    getSubtaskProgress(task: any): number {
        if (task.subtasksTotal === 0) {
            return 0;
        }

        return (task.subtasksDone / task.subtasksTotal) * 100;
    }
}
